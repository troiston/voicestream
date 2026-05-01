import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe.service";

/** Retorna o stripeCustomerId do user, criando no Stripe se ainda não existir. */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name: string | null,
): Promise<string> {
  // 1) Já tem subscription com customerId? Usar.
  const existing = await db.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { stripeCustomerId: true },
  });
  if (existing?.stripeCustomerId) return existing.stripeCustomerId;

  // 2) Criar novo Customer no Stripe
  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId },
  });
  return customer.id;
}
