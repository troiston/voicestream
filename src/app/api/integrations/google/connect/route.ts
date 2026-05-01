import { randomBytes, createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { requireSession } from "@/features/auth/guards";
import { env } from "@/lib/env";

const STATE_COOKIE = "__cv_oauth_state";
const VERIFIER_COOKIE = "__cv_oauth_pkce_verifier";
const COOKIE_MAX_AGE = 600;

function clientId(): string | null {
  return env.GOOGLE_CALENDAR_CLIENT_ID ?? env.GOOGLE_CLIENT_ID ?? null;
}

export async function GET() {
  await requireSession();

  const id = clientId();
  if (!id) {
    return NextResponse.json(
      { error: "Google OAuth não configurado." },
      { status: 503 },
    );
  }

  const state = randomBytes(32).toString("hex");
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");

  const redirectUri = `${env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: id,
    redirect_uri: redirectUri,
    scope:
      "https://www.googleapis.com/auth/calendar.events.readonly openid email",
    access_type: "offline",
    prompt: "consent",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  const jar = await cookies();
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
  jar.set(STATE_COOKIE, state, cookieOpts);
  jar.set(VERIFIER_COOKIE, verifier, cookieOpts);

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
}
