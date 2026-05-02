import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/session";
import { stripe } from "@/lib/stripe.service";
import { env } from "@/lib/env";
import { getOrCreateStripeCustomer } from "@/lib/billing/customer";
import { ADDON_MINUTES } from "@/lib/billing/plans";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const priceId = env.STRIPE_PRICE_ADDON_200;
  if (!priceId) {
    return NextResponse.json({ error: "Add-on não configurado" }, { status: 503 });
  }

  const customerId = await getOrCreateStripeCustomer(session.userId, session.email, session.name);

  const sess = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/billing?addon=success`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/billing?addon=cancelled`,
    metadata: {
      userId: session.userId,
      type: "addon-200",
      minutes: String(ADDON_MINUTES.minutes),
    },
  });

  return NextResponse.json({ url: sess.url });
}
