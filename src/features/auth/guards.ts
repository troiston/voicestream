import { redirect } from "next/navigation";

import { getSession, type AppSession } from "@/features/auth/session";

type RequireSessionOptions = {
  nextPath?: string;
};

/**
 * Garante sessão ativa. Redireciona para /login (com `next`) se não houver.
 */
export async function requireSession(
  options?: RequireSessionOptions,
): Promise<AppSession> {
  const session = await getSession();
  if (!session) {
    const q = new URLSearchParams();
    if (options?.nextPath) q.set("next", options.nextPath);
    const s = q.toString();
    redirect(s ? `/login?${s}` : "/login");
  }
  return session;
}
