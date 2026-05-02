/**
 * Sincroniza produtos e preços VoiceStream no Stripe (idempotente via lookup_key).
 * Uso: tsx scripts/stripe-sync-products.ts
 * Rode UMA VEZ por ambiente (test/live). Cole a saída no .env ou Portainer.
 */
import "dotenv/config";
import Stripe from "stripe";
import { BILLING_PLANS, ADDON_MINUTES } from "../src/lib/billing/plans";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-09-30.clover" as never });

async function ensurePrice({
  lookupKey,
  name,
  description,
  amountCents,
  recurring,
  metadata,
}: {
  lookupKey: string;
  name: string;
  description: string;
  amountCents: number;
  recurring?: Stripe.PriceCreateParams.Recurring;
  metadata?: Record<string, string>;
}): Promise<string> {
  const existing = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
  if (existing.data.length > 0) {
    console.log(`  ✓ ${name} já existe: ${existing.data[0].id}`);
    return existing.data[0].id;
  }

  const product = await stripe.products.create({ name, description, metadata });
  const priceParams: Stripe.PriceCreateParams = {
    product: product.id,
    unit_amount: amountCents,
    currency: "brl",
    lookup_key: lookupKey,
    nickname: lookupKey,
    metadata,
  };
  if (recurring) priceParams.recurring = recurring;

  const price = await stripe.prices.create(priceParams);
  console.log(`  + ${name} criado: ${price.id}`);
  return price.id;
}

async function main() {
  console.log("[stripe-sync] Sincronizando produtos VoiceStream...\n");

  const proPriceId = await ensurePrice({
    lookupKey: "voicestream_pro_monthly_brl",
    name: `VoiceStream ${BILLING_PLANS.pro.label}`,
    description: BILLING_PLANS.pro.features.join(" • "),
    amountCents: BILLING_PLANS.pro.priceCents,
    recurring: { interval: "month" },
    metadata: { plan: "pro", minutes_per_month: String(BILLING_PLANS.pro.minutesPerMonth) },
  });

  const enterprisePriceId = await ensurePrice({
    lookupKey: "voicestream_enterprise_monthly_brl",
    name: `VoiceStream ${BILLING_PLANS.enterprise.label}`,
    description: BILLING_PLANS.enterprise.features.join(" • "),
    amountCents: BILLING_PLANS.enterprise.priceCents,
    recurring: { interval: "month" },
    metadata: { plan: "enterprise", minutes_per_month: String(BILLING_PLANS.enterprise.minutesPerMonth) },
  });

  const addonPriceId = await ensurePrice({
    lookupKey: "voicestream_addon_200_minutes_brl",
    name: `VoiceStream ${ADDON_MINUTES.name}`,
    description: "Pacote único de minutos",
    amountCents: ADDON_MINUTES.priceCents,
    // sem recurring = one-time payment
    metadata: { kind: "addon", minutes: String(ADDON_MINUTES.minutes) },
  });

  console.log("\n[stripe-sync] Cole no .env ou Portainer:\n");
  console.log(`STRIPE_PRICE_PRO="${proPriceId}"`);
  console.log(`STRIPE_PRICE_ENTERPRISE="${enterprisePriceId}"`);
  console.log(`STRIPE_PRICE_ADDON_200="${addonPriceId}"`);
}

main().catch((e: Error) => {
  console.error("[stripe-sync] falhou:", e.message);
  process.exit(1);
});
