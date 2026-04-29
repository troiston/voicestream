import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe.service";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const stripeSubscriptionId = session.subscription as string;
        const stripeCustomerId = session.customer as string;
        if (userId && stripeSubscriptionId && stripeCustomerId) {
          await db.subscription.upsert({
            where: { stripeSubscriptionId },
            create: {
              userId,
              stripeCustomerId,
              stripeSubscriptionId,
              stripePriceId: "",
              status: "active",
              currentPeriodEnd: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ),
            },
            update: {
              status: "active",
            },
          });
        }
        break;
      }
      case "customer.subscription.updated": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any;
        await db.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: sub.status,
            stripePriceId: sub.items.data[0]?.price.id ?? "",
            currentPeriodEnd: new Date((sub.current_period_end as number) * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await db.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "canceled" },
        });
        break;
      }
      case "invoice.payment_succeeded": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string | null;
        if (subscriptionId) {
          await db.subscription.update({
            where: { stripeSubscriptionId: subscriptionId },
            data: {
              currentPeriodEnd: new Date(
                ((invoice.period_end as number) ?? 0) * 1000
              ),
              status: "active",
            },
          });
        }
        break;
      }
      case "invoice.payment_failed": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string | null;
        if (subscriptionId) {
          await db.subscription.update({
            where: { stripeSubscriptionId: subscriptionId },
            data: { status: "past_due" },
          });
          console.error("Payment failed for subscription:", subscriptionId);
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
