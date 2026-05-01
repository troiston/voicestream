import { NextResponse, type NextRequest } from "next/server";
import archiver from "archiver";
import { PassThrough } from "node:stream";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const userId = session.user.id;

  const rl = await rateLimit(req, `lgpd:${userId}`, 5, 3600);
  if (!rl.ok) return rl.response;

  const [
    user,
    subscriptions,
    usage,
    ownedSpaces,
    spaceMemberships,
    recordings,
    transcriptions,
    transcriptionSegments,
    summaries,
    tasks,
    auditLogs,
  ] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        isDemo: true,
        deletedAt: true,
        preferences: true,
      },
    }),
    db.subscription.findMany({ where: { userId } }),
    db.usage.findMany({ where: { userId } }),
    db.space.findMany({ where: { ownerId: userId } }),
    db.spaceMember.findMany({ where: { userId }, include: { space: true } }),
    db.recording.findMany({ where: { userId } }),
    db.transcription.findMany({ where: { recording: { userId } } }),
    db.transcriptionSegment.findMany({
      where: { transcription: { recording: { userId } } },
    }),
    db.summary.findMany({ where: { recording: { userId } } }),
    db.task.findMany({
      where: { OR: [{ creatorUserId: userId }, { assigneeUserId: userId }] },
    }),
    db.auditLog.findMany({ where: { userId } }),
  ]);

  const archive = archiver("zip", { zlib: { level: 9 } });
  const passthrough = new PassThrough();
  archive.pipe(passthrough);

  const append = (name: string, data: unknown) => {
    archive.append(JSON.stringify(data, null, 2), { name });
  };

  append("user.json", user);
  append("subscriptions.json", subscriptions);
  append("usage.json", usage);
  append("spaces-owned.json", ownedSpaces);
  append("space-memberships.json", spaceMemberships);
  append("recordings.json", recordings);
  append("transcriptions.json", transcriptions);
  append("transcription-segments.json", transcriptionSegments);
  append("summaries.json", summaries);
  append("tasks.json", tasks);
  append("audit-logs.json", auditLogs);
  append("export-metadata.json", {
    exportedAt: new Date().toISOString(),
    userId,
    email: session.user.email,
  });

  archive.finalize();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      passthrough.on("data", (chunk: Buffer) => controller.enqueue(chunk));
      passthrough.on("end", () => controller.close());
      passthrough.on("error", (err) => controller.error(err));
    },
  });

  const filename = `voicestream-export-${userId}-${Date.now()}.zip`;

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
