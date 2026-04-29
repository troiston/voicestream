// IMPORTANT: The Stripe Customer Portal must be activated in the Stripe Dashboard before this
// endpoint will work. In test mode: Dashboard → Settings → Billing → Customer portal →
// click "Activate test link". Without this step, the API call below returns a 404 from Stripe.

import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/features/auth/session";
import { stripe } from "@/lib/stripe.service";
import { env } from "@/lib/env";
import { db } from "@/lib/db";

export async function POST(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const sub = await db.subscription.findFirst({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      select: { stripeCustomerId: true },
    });

    if (!sub?.stripeCustomerId) {
      return NextResponse.json({ error: "Sem assinatura ativa" }, { status: 404 });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/billing`,
      locale: "pt-BR",
    });

    return NextResponse.json({ url: portal.url });
  } catch (err) {
    console.error("[billing/portal] Stripe error:", err);
    return NextResponse.json({ error: "Erro ao abrir portal de cobrança" }, { status: 500 });
  }
}
