import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export type AppSession = {
  userId: string;
  email: string;
  name: string;
  emailVerified: boolean;
  role: "admin" | "membro" | "convidado";
  mfaVerified: boolean;
};

/** Retorna a sessão atual a partir do cookie do better-auth, ou null. */
export async function getSession(): Promise<AppSession | null> {
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result) return null;

  const { user, session } = result;
  return {
    userId: user.id,
    email: user.email,
    name: user.name ?? user.email,
    emailVerified: Boolean(user.emailVerified),
    role: "admin",
    mfaVerified: Boolean(
      (session as unknown as { twoFactorVerified?: boolean }).twoFactorVerified ??
        !user.twoFactorEnabled,
    ),
  };
}

/** Apaga a sessão atual (logout). */
export async function clearSession(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
}
