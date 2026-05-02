import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/features/auth/session";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import {
  encryptTranscriptText,
  decryptTranscriptText,
} from "@/lib/crypto/envelope";

export async function POST(req: NextRequest) {
  // Supports user auth OR CRON_SECRET (internal sync)
  const isCron =
    env.CRON_SECRET &&
    req.headers.get("authorization") === `Bearer ${env.CRON_SECRET}`;

  let userIds: string[];
  if (isCron) {
    const targets = await db.integration.findMany({
      where: { provider: "google_calendar", status: "connected" },
      select: { userId: true },
    });
    userIds = targets.map((t) => t.userId);
  } else {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    userIds = [session.userId];
  }

  let totalSynced = 0;
  for (const userId of userIds) {
    try {
      totalSynced += await syncOne(userId);
    } catch (err) {
      console.error("[calendar-sync]", userId, err);
    }
  }
  return NextResponse.json({ users: userIds.length, synced: totalSynced });
}

async function syncOne(userId: string): Promise<number> {
  const integration = await db.integration.findUnique({
    where: { userId_provider: { userId, provider: "google_calendar" } },
  });
  if (
    !integration ||
    integration.status !== "connected" ||
    !integration.accessToken
  )
    return 0;

  let accessToken = decryptTranscriptText(integration.accessToken, userId);

  // Refresh token if expiring within 60 s
  if (
    integration.expiresAt &&
    integration.expiresAt.getTime() < Date.now() + 60_000
  ) {
    if (!integration.refreshToken) return 0;
    const refresh = decryptTranscriptText(integration.refreshToken, userId);
    const clientId =
      env.GOOGLE_CALENDAR_CLIENT_ID || env.GOOGLE_CLIENT_ID || "";
    const clientSecret =
      env.GOOGLE_CALENDAR_CLIENT_SECRET || env.GOOGLE_CLIENT_SECRET || "";
    const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refresh,
        grant_type: "refresh_token",
      }),
    });
    if (!refreshRes.ok) {
      await db.integration.update({
        where: { id: integration.id },
        data: { status: "disconnected" },
      });
      return 0;
    }
    const refreshed = (await refreshRes.json()) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!refreshed.access_token) return 0;
    accessToken = refreshed.access_token;
    await db.integration.update({
      where: { id: integration.id },
      data: {
        accessToken: encryptTranscriptText(accessToken, userId),
        expiresAt: refreshed.expires_in
          ? new Date(Date.now() + refreshed.expires_in * 1000)
          : integration.expiresAt,
      },
    });
  }

  const timeMin = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const timeMax = new Date(Date.now() + 30 * 86_400_000).toISOString();
  const url = new URL(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
  );
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("maxResults", "250");
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) {
    await db.integration.update({
      where: { id: integration.id },
      data: { status: "disconnected" },
    });
    return 0;
  }
  if (!res.ok) return 0;

  const data = (await res.json()) as {
    items?: Array<{
      id: string;
      summary?: string;
      description?: string;
      start?: { dateTime?: string; date?: string };
      end?: { dateTime?: string; date?: string };
      htmlLink?: string;
    }>;
  };
  const items = data.items ?? [];

  let synced = 0;
  for (const ev of items) {
    const startsAtRaw = ev.start?.dateTime ?? ev.start?.date;
    const endsAtRaw = ev.end?.dateTime ?? ev.end?.date;
    if (!startsAtRaw || !endsAtRaw) continue;
    await db.calendarEvent.upsert({
      where: {
        userId_source_externalId: {
          userId,
          source: "google",
          externalId: ev.id,
        },
      },
      create: {
        userId,
        source: "google",
        externalId: ev.id,
        title: ev.summary ?? "(sem título)",
        description: ev.description ?? null,
        startsAt: new Date(startsAtRaw),
        endsAt: new Date(endsAtRaw),
        htmlLink: ev.htmlLink ?? null,
        syncedAt: new Date(),
      },
      update: {
        title: ev.summary ?? "(sem título)",
        description: ev.description ?? null,
        startsAt: new Date(startsAtRaw),
        endsAt: new Date(endsAtRaw),
        htmlLink: ev.htmlLink ?? null,
        syncedAt: new Date(),
      },
    });
    synced++;
  }
  return synced;
}
