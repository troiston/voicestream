import { cookies } from "next/headers";

import type { UserRole } from "@/types/team";

export const SESSION_COOKIE_NAME = "cv_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

export type MockSession = {
  userId: string;
  email: string;
  name: string;
  emailVerified: boolean;
  role: UserRole;
  mfaVerified?: boolean;
};

function encode(data: MockSession): string {
  return Buffer.from(JSON.stringify(data), "utf8").toString("base64url");
}

function decode(raw: string): MockSession | null {
  try {
    const str = Buffer.from(raw, "base64url").toString("utf8");
    const parsed: unknown = JSON.parse(str);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "userId" in parsed &&
      "email" in parsed &&
      "name" in parsed &&
      typeof (parsed as MockSession).userId === "string" &&
      typeof (parsed as MockSession).email === "string" &&
      typeof (parsed as MockSession).name === "string" &&
      typeof (parsed as MockSession).emailVerified === "boolean"
    ) {
      return {
        ...(parsed as MockSession),
        role: (parsed as MockSession).role ?? "admin",
        mfaVerified: (parsed as MockSession).mfaVerified,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<MockSession | null> {
  const c = (await cookies()).get(SESSION_COOKIE_NAME);
  if (!c?.value) {
    return null;
  }
  return decode(c.value);
}

export async function setSession(session: MockSession): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, encode(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

export async function updateSession(patch: Partial<MockSession>): Promise<MockSession | null> {
  const cur = await getSession();
  if (!cur) {
    return null;
  }
  const next = { ...cur, ...patch };
  await setSession(next);
  return next;
}
