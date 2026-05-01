import { NextResponse } from "next/server";

import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";

export async function POST() {
  const session = await requireSession();

  await db.integration.updateMany({
    where: { userId: session.userId, provider: "google_calendar" },
    data: {
      status: "disconnected",
      accessToken: null,
      refreshToken: null,
      connectedAt: null,
      expiresAt: null,
    },
  });

  return NextResponse.json({ ok: true });
}
