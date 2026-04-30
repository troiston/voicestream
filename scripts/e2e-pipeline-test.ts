import "dotenv/config";
import { db } from "@/lib/db";
import { enqueueTranscribe } from "@/lib/queue";
import { putObjectBytes } from "@/lib/storage/seaweed";
import { randomUUID } from "node:crypto";

async function main() {
  const user = await db.user.findFirst({ where: { email: "demo@voicestream.app" } });
  if (!user) throw new Error("no demo user — run npm run db:seed");
  const space = await db.space.findFirst({ where: { ownerId: user.id } });
  if (!space) throw new Error("no demo space");

  console.log("user:", user.id, "space:", space.id, "kind:", space.kind);

  console.log("loading sample audio from /tmp/sample.wav...");
  const { readFile } = await import("node:fs/promises");
  const audioBuffer = await readFile("/tmp/sample.wav");
  console.log("audio bytes:", audioBuffer.length);

  const storageKey = `recordings/${user.id}/${randomUUID()}.wav`;
  await putObjectBytes({ key: storageKey, body: audioBuffer, contentType: "audio/wav" });
  console.log("uploaded to:", storageKey);

  const recording = await db.recording.create({
    data: {
      userId: user.id,
      spaceId: space.id,
      storageKey,
      durationSec: 38,
      status: "uploaded",
      capturedAt: new Date(),
    },
  });
  console.log("recording:", recording.id);

  await enqueueTranscribe(recording.id);
  console.log("enqueued — polling status...");

  const start = Date.now();
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const r = await db.recording.findUnique({
      where: { id: recording.id },
      include: {
        transcription: { include: { _count: { select: { segments: true } } } },
        summary: true,
        tasks: true,
      },
    });
    if (!r) continue;
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(
      `[${elapsed}s] status=${r.status}` +
        (r.transcription ? ` transcript=${r.transcription.text.length}ch segments=${r.transcription._count.segments}` : "") +
        (r.summary ? ` summary=${r.summary.decisions.length}d/${r.summary.nextSteps.length}n` : "") +
        ` tasks=${r.tasks.length}`,
    );
    if (r.status === "summarized" || r.status === "failed") {
      const usage = await db.usage.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
      console.log("usage:", usage ? `${usage.quantity} ${usage.type}` : "none");
      const audit = await db.auditLog.count({ where: { userId: user.id, entityId: recording.id } });
      console.log("audit log entries for recording:", audit);
      console.log("FINAL:", r.status);
      process.exit(r.status === "summarized" ? 0 : 1);
    }
  }
  console.log("TIMEOUT — status never reached done");
  process.exit(2);
}

main().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
});
