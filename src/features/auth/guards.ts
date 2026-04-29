import { redirect } from "next/navigation";

import { getSession, type MockSession } from "@/features/auth/session";

type RequireSessionOptions = {
  nextPath?: string;
};

/**
 * Garante sessão mock. Redireciona para /login (com `next`) se não houver cookie.
 */
export async function requireSession(
  options?: RequireSessionOptions,
): Promise<MockSession> {
  const session = await getSession();
  if (!session) {
    const q = new URLSearchParams();
    if (options?.nextPath) {
      q.set("next", options.nextPath);
    }
    const s = q.toString();
    redirect(s ? `/login?${s}` : "/login");
  }
  return session;
}
