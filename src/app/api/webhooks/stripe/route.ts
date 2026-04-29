import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe.service";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { planFromPriceId } from "@/lib/billing/plans";

/**
 * Stripe webhook handler.
 *
 * IMPORTANT — Eventos a habilitar no Dashboard Stripe (Developers → Webhooks):
 *   - checkout.session.completed
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 *   - customer.subscription.trial_will_end
 *   - invoice.payment_succeeded
 *   - invoice.payment_failed
 *
 * Política de erro: qualquer falha de DB é logada mas o handler retorna 200.
 * Stripe entrega webhooks com pelo menos-uma-vez; retornar 5xx faz Stripe retentar,
 * o que pode multiplicar AuditLogs e causar race conditions.
 * Idempotência é garantida por upsert com `where: { stripeSubscriptionId }`.
 */

type StripeSubscriptionWithPeriod = Stripe.Subscription & {
  current_period_end: number;
};

type StripeInvoiceWithSubscription = Stripe.Invoice & {
  subscription: string | Stripe.Subscription | null;
  period_end?: number;
};

async function logAudit(
  userId: string | null,
  action: string,
  entityId: string | null,
  metadata: Record<string, unknown>
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: userId ?? undefined,
        action,
        entityType: "subscription",
        entityId: entityId ?? undefined,
        metadata: metadata as Stripe.Metadata,
      },
    });
  } catch (err) {
    console.error("[stripe-webhook] auditLog failed:", err);
  }
}

async function upsertSubscription(
  userId: string,
  sub: StripeSubscriptionWithPeriod
): Promise<void> {
  const priceId = sub.items.data[0]?.price.id ?? "";
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  try {
    await db.subscription.upsert({
      where: { stripeSubscriptionId: sub.id },
      create: {
        userId,
        stripeCustomerId: customerId,
        stripePriceId: priceId,
        stripeSubscriptionId: sub.id,
        status: sub.status,
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      },
      update: {
        stripeCustomerId: customerId,
        stripePriceId: priceId,
        status: sub.status,
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      },
    });
  } catch (err) {
    console.error("[stripe-webhook] subscription upsert failed:", err);
  }
}

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

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const subscriptionId = session.subscription as string | null;

      if (!userId) {
        console.error(
          "[stripe-webhook] checkout.session.completed missing metadata.userId",
          { sessionId: session.id }
        );
        break;
      }
      if (!subscriptionId) {
        console.error(
          "[stripe-webhook] checkout.session.completed without subscription",
          { sessionId: session.id }
        );
        break;
      }

      try {
        const sub = (await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ["items.data.price"],
        })) as unknown as StripeSubscriptionWithPeriod;

        await upsertSubscription(userId, sub);
        const priceId = sub.items.data[0]?.price.id ?? null;
        await logAudit(userId, "subscription.created", sub.id, {
          plan: planFromPriceId(priceId),
          priceId,
          status: sub.status,
        });
      } catch (err) {
        console.error("[stripe-webhook] checkout.session.completed handler error:", err);
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as StripeSubscriptionWithPeriod;
      try {
        const existing = await db.subscription.findUnique({
          where: { stripeSubscriptionId: sub.id },
          select: { userId: true },
        });
        if (!existing) {
          console.warn(
            "[stripe-webhook] customer.subscription.updated for unknown sub (orphan, ignoring)",
            { subscriptionId: sub.id }
          );
          break;
        }
        await upsertSubscription(existing.userId, sub);
        const priceId = sub.items.data[0]?.price.id ?? null;
        await logAudit(existing.userId, "subscription.updated", sub.id, {
          plan: planFromPriceId(priceId),
          priceId,
          status: sub.status,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        });
      } catch (err) {
        console.error("[stripe-webhook] customer.subscription.updated handler error:", err);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      try {
        const existing = await db.subscription.findUnique({
          where: { stripeSubscriptionId: sub.id },
          select: { userId: true },
        });
        if (!existing) {
          console.warn(
            "[stripe-webhook] customer.subscription.deleted for unknown sub (orphan, ignoring)",
            { subscriptionId: sub.id }
          );
          break;
        }
        await db.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "canceled", cancelAtPeriodEnd: false },
        });
        await logAudit(existing.userId, "subscription.canceled", sub.id, {
          status: "canceled",
        });
      } catch (err) {
        console.error("[stripe-webhook] customer.subscription.deleted handler error:", err);
      }
      break;
    }

    case "customer.subscription.trial_will_end": {
      const sub = event.data.object as Stripe.Subscription;
      console.log("[stripe-webhook] trial_will_end", {
        subscriptionId: sub.id,
        trialEnd: sub.trial_end,
      });
      try {
        const existing = await db.subscription.findUnique({
          where: { stripeSubscriptionId: sub.id },
          select: { userId: true },
        });
        if (existing) {
          await logAudit(existing.userId, "subscription.trial_will_end", sub.id, {
            trialEnd: sub.trial_end,
          });
        }
      } catch (err) {
        console.error("[stripe-webhook] trial_will_end handler error:", err);
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as StripeInvoiceWithSubscription;
      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id ?? null;
      try {
        let userId: string | null = null;
        if (subscriptionId) {
          const existing = await db.subscription.findUnique({
            where: { stripeSubscriptionId: subscriptionId },
            select: { userId: true },
          });
          userId = existing?.userId ?? null;
        }
        await logAudit(userId, "invoice.paid", invoice.id ?? null, {
          invoiceId: invoice.id,
          subscriptionId,
          amount: invoice.amount_paid,
          currency: invoice.currency,
        });
      } catch (err) {
        console.error("[stripe-webhook] invoice.payment_succeeded handler error:", err);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as StripeInvoiceWithSubscription;
      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id ?? null;
      try {
        let userId: string | null = null;
        if (subscriptionId) {
          const existing = await db.subscription.findUnique({
            where: { stripeSubscriptionId: subscriptionId },
            select: { userId: true },
          });
          userId = existing?.userId ?? null;
          if (existing) {
            await db.subscription.update({
              where: { stripeSubscriptionId: subscriptionId },
              data: { status: "past_due" },
            });
          }
        }
        await logAudit(userId, "invoice.failed", invoice.id ?? null, {
          invoiceId: invoice.id,
          subscriptionId,
          attempt: invoice.attempt_count,
          amountDue: invoice.amount_due,
          currency: invoice.currency,
        });
        console.error("[stripe-webhook] invoice payment failed", {
          invoiceId: invoice.id,
          subscriptionId,
          attempt: invoice.attempt_count,
        });
      } catch (err) {
        console.error("[stripe-webhook] invoice.payment_failed handler error:", err);
      }
      break;
    }

    default:
      console.log(`[stripe-webhook] unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
