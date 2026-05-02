import { NextRequest } from "next/server";
import { getSession } from "@/features/auth/session";
import { db } from "@/lib/db";
import { enqueueTranscribe } from "@/lib/queue/index";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;

  const recording = await db.recording.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      status: true,
      spaceId: true,
      space: {
        select: {
          ownerId: true,
          members: { where: { status: "active" }, select: { userId: true } },
        },
      },
    },
  });

  if (!recording) return new Response("Not found", { status: 404 });

  const isOwner = recording.space.ownerId === session.userId;
  const isMember = recording.space.members.some((m) => m.userId === session.userId);
  if (!isOwner && !isMember) return new Response("Forbidden", { status: 403 });

  if (recording.status !== "failed") {
    return new Response(
      JSON.stringify({ error: "Apenas gravações com status 'failed' podem ser reenfileiradas." }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  await db.recording.update({
    where: { id },
    data: { status: "uploaded", errorMessage: null },
  });

  await enqueueTranscribe(id);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
