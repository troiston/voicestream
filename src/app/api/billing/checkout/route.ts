import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/features/auth/session";
import { stripe } from "@/lib/stripe.service";
import { env } from "@/lib/env";
import { getOrCreateStripeCustomer } from "@/lib/billing/customer";
import { db } from "@/lib/db";

const bodySchema = z.object({
  plan: z.enum(["pro", "enterprise"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "Plano inválido" }, { status: 400 });

    const priceId =
      parsed.data.plan === "pro" ? env.STRIPE_PRICE_PRO : env.STRIPE_PRICE_ENTERPRISE;
    if (!priceId) return NextResponse.json({ error: "Plano não configurado" }, { status: 503 });

    const customerId = await getOrCreateStripeCustomer(
      session.userId,
      session.email,
      session.name,
    );

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/billing?checkout=cancelled`,
      allow_promotion_codes: true,
      locale: "pt-BR",
      metadata: {
        userId: session.userId,
        plan: parsed.data.plan,
      },
      subscription_data: {
        metadata: { userId: session.userId },
      },
    });

    // AuditLog (best-effort)
    await db.auditLog
      .create({
        data: {
          userId: session.userId,
          action: "billing.checkout.created",
          entityType: "CheckoutSession",
          entityId: checkoutSession.id,
          metadata: { plan: parsed.data.plan, priceId },
        },
      })
      .catch(() => {});

    return NextResponse.json({ url: checkoutSession.url, sessionId: checkoutSession.id });
  } catch (err) {
    console.error("[billing/checkout] Stripe error:", err);
    return NextResponse.json({ error: "Erro ao criar sessão de pagamento" }, { status: 500 });
  }
}
