import type { BrowserContext } from "@playwright/test";

/** Espelha `SESSION_COOKIE_NAME` em `src/features/auth/session.ts` (evita importar `next/headers`). */
export const MOCK_SESSION_COOKIE_NAME = "cv_session";

export type E2eMockSessionPayload = {
  userId: string;
  email: string;
  name: string;
  emailVerified: boolean;
  role: "admin" | "membro" | "convidado";
  mfaVerified?: boolean;
};

export function encodeMockSessionCookieValue(session: E2eMockSessionPayload): string {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

const DEFAULT_SESSION: E2eMockSessionPayload = {
  userId: "u_e2e",
  email: "e2e@example.com",
  name: "Utilizador E2E",
  emailVerified: true,
  role: "admin",
  mfaVerified: true,
};

/**
 * Define o cookie httpOnly mock que o servidor lê em `getSession()`.
 * `baseURL` deve ser `http://127.0.0.1:3000` (domínio tem de coincidir).
 */
export async function addMockSessionCookie(
  context: BrowserContext,
  baseURL: string,
  session: E2eMockSessionPayload = DEFAULT_SESSION,
): Promise<void> {
  const url = new URL(baseURL);
  const host = url.hostname;

  await context.addCookies([
    {
      name: MOCK_SESSION_COOKIE_NAME,
      value: encodeMockSessionCookieValue(session),
      domain: host,
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      secure: url.protocol === "https:",
    },
  ]);
}
