import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { encryptTranscriptText } from "@/lib/crypto/envelope";

const STATE_COOKIE = "__cv_oauth_state";
const VERIFIER_COOKIE = "__cv_oauth_pkce_verifier";

function fail(reason: string): NextResponse {
  return NextResponse.redirect(
    `${env.NEXT_PUBLIC_APP_URL}/integrations?status=error&provider=google_calendar&reason=${encodeURIComponent(reason)}`,
  );
}

export async function GET(request: NextRequest) {
  const session = await requireSession();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const jar = await cookies();
  const cookieState = jar.get(STATE_COOKIE)?.value;
  const codeVerifier = jar.get(VERIFIER_COOKIE)?.value;

  jar.delete(STATE_COOKIE);
  jar.delete(VERIFIER_COOKIE);

  if (!code || !state || !cookieState || state !== cookieState) {
    return fail("invalid_state");
  }
  if (!codeVerifier) return fail("missing_verifier");

  const clientId =
    env.GOOGLE_CALENDAR_CLIENT_ID ?? env.GOOGLE_CLIENT_ID ?? "";
  const clientSecret =
    env.GOOGLE_CALENDAR_CLIENT_SECRET ?? env.GOOGLE_CLIENT_SECRET ?? "";
  if (!clientId || !clientSecret) return fail("oauth_not_configured");

  let tokenRes: Response;
  try {
    tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`,
        grant_type: "authorization_code",
        code_verifier: codeVerifier,
      }),
    });
  } catch {
    return fail("token_exchange_failed");
  }

  if (!tokenRes.ok) return fail("token_exchange_failed");

  const tokens = (await tokenRes.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  };

  if (!tokens.access_token) return fail("no_access_token");

  const accessTokenEnc = encryptTranscriptText(
    tokens.access_token,
    session.userId,
  );
  const refreshTokenEnc = tokens.refresh_token
    ? encryptTranscriptText(tokens.refresh_token, session.userId)
    : null;
  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000)
    : null;

  const integration = await db.integration.upsert({
    where: {
      userId_provider: {
        userId: session.userId,
        provider: "google_calendar",
      },
    },
    update: {
      status: "connected",
      accessToken: accessTokenEnc,
      refreshToken: refreshTokenEnc,
      expiresAt,
      connectedAt: new Date(),
      metadata: { scope: tokens.scope ?? null },
    },
    create: {
      userId: session.userId,
      provider: "google_calendar",
      status: "connected",
      accessToken: accessTokenEnc,
      refreshToken: refreshTokenEnc,
      expiresAt,
      connectedAt: new Date(),
      metadata: { scope: tokens.scope ?? null },
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.userId,
      action: "integration.connected",
      entityType: "Integration",
      entityId: integration.id,
    },
  });

  return NextResponse.redirect(
    `${env.NEXT_PUBLIC_APP_URL}/integrations?status=connected&provider=google_calendar`,
  );
}
