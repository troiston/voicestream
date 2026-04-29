/**
 * Apaga apenas dados marcados como demo.
 *
 * Critério: `User.isDemo = true`. Cascadas via FK removem `Account`,
 * `Session`, `Subscription` e `Usage` associados.
 *
 * Bloqueado em `NODE_ENV=production` (também via hook beforeShellExecution).
 * Para forçar uso fora de dev: definir `ALLOW_DEMO_WIPE=1`.
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_WIPE !== "1") {
    console.error("[wipe-demo] bloqueado em production. Defina ALLOW_DEMO_WIPE=1 para forçar (não recomendado).");
    process.exit(1);
  }

  console.log("[wipe-demo] apagando registos com isDemo=true ...");
  const result = await prisma.user.deleteMany({ where: { isDemo: true } });
  console.log(`[wipe-demo] OK — ${result.count} utilizador(es) demo removido(s) (cascata limpou subscrições, sessões e uso).`);
}

main()
  .catch((err) => {
    console.error("[wipe-demo] falhou:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
