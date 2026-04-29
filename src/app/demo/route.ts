import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const DEMO_EMAIL = "demo@cloudvoice.app";
const DEMO_NAME = "Demo Enterprise";
const DEMO_PASSWORD = "demo-cloudvoice-2026";

/**
 * Login automático para conta de demonstração.
 * Disponível apenas em DEV — em produção retorna 404.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") notFound();

  const existing = await db.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!existing) {
    await auth.api.signUpEmail({
      body: { email: DEMO_EMAIL, password: DEMO_PASSWORD, name: DEMO_NAME },
      headers: await headers(),
    });
    await db.user.update({
      where: { email: DEMO_EMAIL },
      data: { isDemo: true, emailVerified: true },
    });
  }

  await auth.api.signInEmail({
    body: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
    headers: await headers(),
  });

  redirect("/dashboard");
}
