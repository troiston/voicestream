/**
 * Seed idempotente de dados de demonstração.
 *
 * Convenção: todos os registos demo têm `isDemo: true` no `User` raiz.
 * `wipe-demo.ts` apaga apenas registos com este marcador.
 *
 * Uso: `npm run db:seed`. Para apagar dados demo: `npm run db:demo:wipe`.
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_USERS = [
  {
    email: "demo.owner@demo.local",
    name: "Demo Owner",
    plan: "pro",
  },
  {
    email: "demo.member@demo.local",
    name: "Demo Member",
    plan: "free",
  },
];

async function seedUser(email: string, name: string, plan: string) {
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name, isDemo: true, emailVerified: new Date() },
    update: { name, isDemo: true },
  });

  if (plan !== "free") {
    const customerId = `cus_demo_${user.id}`;
    const subId = `sub_demo_${user.id}`;
    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: subId },
      create: {
        userId: user.id,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subId,
        stripePriceId: `price_demo_${plan}`,
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      update: {
        status: "active",
        stripePriceId: `price_demo_${plan}`,
      },
    });
  }

  await prisma.usage.create({
    data: {
      userId: user.id,
      type: "demo.event",
      quantity: 1,
      metadata: { source: "seed", plan },
    },
  });

  return user;
}

async function main() {
  console.log("[seed] populando dados demo (isDemo=true) ...");
  for (const u of DEMO_USERS) {
    const user = await seedUser(u.email, u.name, u.plan);
    console.log(`  - ${user.email} (${u.plan})`);
  }
  console.log("[seed] OK. Para apagar apenas dados demo: npm run db:demo:wipe");
}

main()
  .catch((err) => {
    console.error("[seed] falhou:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
