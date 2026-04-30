import "dotenv/config";
import { db } from "@/lib/db";

async function main() {
  const r = await db.recording.findFirst({
    where: { storageKey: { contains: "aa33a822" } },
    include: { transcription: true, summary: true, tasks: true },
  });
  if (!r) { console.log("not found"); process.exit(1); }
  console.log("status:", r.status);
  console.log("transcription:", r.transcription ? {
    id: r.transcription.id,
    textLen: r.transcription.text.length,
    encrypted: r.transcription.encrypted,
    language: r.transcription.language,
    confidence: r.transcription.confidence,
    preview: r.transcription.text.slice(0, 200),
  } : null);
  console.log("summary:", r.summary);
  console.log("tasks:", r.tasks);
  const segs = r.transcription ? await db.transcriptionSegment.count({ where: { transcriptionId: r.transcription.id } }) : 0;
  console.log("segments count:", segs);
  const usage = await db.usage.findMany({ where: { userId: r.userId } });
  console.log("usage rows:", usage);
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
