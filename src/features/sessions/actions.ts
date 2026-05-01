"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSession } from "@/features/auth/session";

export type SessionInfo = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
};

/** Lista todas as sessões ativas do usuário autenticado. */
export async function listSessions(): Promise<SessionInfo[]> {
  const session = await getSession();
  if (!session) return [];

  // Fetch current session token to identify it
  const currentResult = await auth.api.getSession({ headers: await headers() });
  const currentToken = currentResult?.session?.token ?? null;

  const sessions = await db.session.findMany({
    where: {
      userId: session.userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { updatedAt: "desc" },
  });

  return sessions.map((s) => ({
    id: s.id,
    userAgent: s.userAgent ?? null,
    ipAddress: s.ipAddress ?? null,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    expiresAt: s.expiresAt,
    isCurrent: s.token === currentToken,
  }));
}

/** Revoga (exclui) uma sessão pelo ID. */
export async function revokeSession(
  sessionId: string,
): Promise<{ ok: true } | { error: string }> {
  const session = await getSession();
  if (!session) return { error: "Não autenticado." };

  try {
    const target = await db.session.findFirst({
      where: { id: sessionId, userId: session.userId },
    });
    if (!target) return { error: "Sessão não encontrada." };

    await db.session.delete({ where: { id: sessionId } });
    revalidatePath("/settings");
    return { ok: true };
  } catch {
    return { error: "Falha ao revogar sessão." };
  }
}
