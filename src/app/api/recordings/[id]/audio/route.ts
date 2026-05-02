import { NextRequest } from "next/server";

import { getSession } from "@/features/auth/session";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { decryptAudio, isAudioEncryptionMeta } from "@/lib/crypto/envelope";
import { getObjectBytes } from "@/lib/storage/seaweed";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const rl = await rateLimit(req, `recording-audio:${session.userId}`, 60, 60);
  if (!rl.ok) return rl.response;

  const { id } = await params;
  const recording = await db.recording.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      spaceId: true,
      storageKey: true,
      mimeType: true,
      encryptionMeta: true,
    },
  });
  if (!recording) return new Response("Not found", { status: 404 });

  const isOwner = recording.userId === session.userId;
  if (!isOwner) {
    const member = await db.spaceMember.findFirst({
      where: { spaceId: recording.spaceId, userId: session.userId, status: "active" },
      select: { id: true },
    });
    if (!member) return new Response("Forbidden", { status: 403 });
  }

  const bytes = await getObjectBytes({ key: recording.storageKey });
  const body = isAudioEncryptionMeta(recording.encryptionMeta)
    ? decryptAudio(bytes, recording.encryptionMeta)
    : bytes;

    return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": recording.mimeType,
      "Cache-Control": "private, max-age=60",
    },
  });
}
