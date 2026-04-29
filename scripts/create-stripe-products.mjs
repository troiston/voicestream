import "dotenv/config";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function ensureProductWithPrice({ lookupKey, name, description, amountCents, metadata }) {
  // 1) Procurar Price existente por lookup_key (idempotência)
  const existing = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1, expand: ["data.product"] });
  if (existing.data.length > 0) {
    const price = existing.data[0];
    const product = typeof price.product === "string" ? null : price.product;
    console.log(`  ✓ ${name} já existe: price=${price.id} (R$${amountCents / 100}/mês)`);
    return { priceId: price.id, productId: product?.id };
  }

  // 2) Criar Product
  const product = await stripe.products.create({
    name,
    description,
    metadata,
  });

  // 3) Criar Price (BRL, mensal recorrente)
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: amountCents,
    currency: "brl",
    recurring: { interval: "month" },
    lookup_key: lookupKey,
    nickname: lookupKey,
    metadata,
  });

  console.log(`  + ${name} criado: price=${price.id} (R$${amountCents / 100}/mês)`);
  return { priceId: price.id, productId: product.id };
}

async function main() {
  console.log("[stripe] criando produtos VoiceStream em test mode...\n");

  const pro = await ensureProductWithPrice({
    lookupKey: "voicestream_pro_monthly_brl",
    name: "VoiceStream Pro",
    description: "2.000 minutos de transcrição/mês, espaços ilimitados, prioridade na fila.",
    amountCents: 2900,
    metadata: { plan: "pro", minutes_per_month: "2000" },
  });

  const enterprise = await ensureProductWithPrice({
    lookupKey: "voicestream_enterprise_monthly_brl",
    name: "VoiceStream Empresa",
    description: "10.000 minutos/mês, SSO, exportação avançada, suporte dedicado.",
    amountCents: 7900,
    metadata: { plan: "enterprise", minutes_per_month: "10000" },
  });

  console.log("\n[stripe] cole no .env:\n");
  console.log(`STRIPE_PRICE_PRO="${pro.priceId}"`);
  console.log(`STRIPE_PRICE_ENTERPRISE="${enterprise.priceId}"`);
}

main().catch((e) => {
  console.error("[stripe] falhou:", e.message);
  process.exit(1);
});
