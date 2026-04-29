"use strict";
// Worker BullMQ — executar com `tsx src/workers/transcribe.ts`.
// Em produção via Dockerfile.worker.

import { Worker, type Job } from "bullmq";
import { redisConnection, redisSubscriber } from "@/lib/queue/redis";
import { type TranscribeJobData } from "@/lib/queue/index";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { transcribeFromStorageKey } from "@/lib/transcription/deepgram";
import { summarizeAndExtract } from "@/lib/llm/anthropic";

const QUEUE_NAME = "transcribe";

const worker = new Worker<TranscribeJobData>(QUEUE_NAME, async (job: Job<TranscribeJobData>) => {
  const { recordingId } = job.data;
  console.log(`[transcribe-worker] start ${recordingId}`);

  const recording = await db.recording.findUnique({ where: { id: recordingId } });
  if (!recording) throw new Error(`Recording ${recordingId} not found`);

  // Idempotência: se já summarized, pular (retry/duplicado)
  if (recording.status === "summarized") {
    console.log(`[transcribe-worker] already summarized, skipping ${recordingId}`);
    return { skipped: true };
  }

  // 1) Marca como processing
  await db.recording.update({ where: { id: recordingId }, data: { status: "processing", errorMessage: null } });

  try {
    // 2) Deepgram
    const t = await transcribeFromStorageKey(recording.storageKey, { language: recording.language });

    // 3) Persist Transcription + segments (transação)
    await db.$transaction(async (tx) => {
      // Idempotência: apaga transcription anterior (retry parcial)
      await tx.transcription.deleteMany({ where: { recordingId } });

      const trans = await tx.transcription.create({
        data: {
          recordingId,
          provider: "deepgram",
          language: t.language,
          text: t.text,
          confidence: t.confidence,
          rawJson: t.rawJson as Prisma.InputJsonValue,
        },
      });

      if (t.segments.length > 0) {
        await tx.transcriptionSegment.createMany({
          data: t.segments.map((s) => ({
            transcriptionId: trans.id,
            speaker: s.speaker,
            startMs: s.startMs,
            endMs: s.endMs,
            text: s.text,
            confidence: s.confidence,
          })),
        });
      }

      await tx.recording.update({ where: { id: recordingId }, data: { status: "transcribed" } });
    });

    // 4) Anthropic — summary + tasks
    const summary = await summarizeAndExtract(t.text, { language: t.language });

    // 5) Persist Summary + Tasks (transação)
    await db.$transaction(async (tx) => {
      const trans = await tx.transcription.findUniqueOrThrow({ where: { recordingId }, select: { id: true } });

      // Idempotência: limpar Summary e Tasks anteriores do mesmo recording
      await tx.summary.deleteMany({ where: { recordingId } });
      await tx.task.deleteMany({ where: { recordingId } });

      await tx.summary.create({
        data: {
          recordingId,
          transcriptionId: trans.id,
          abstract: summary.abstract,
          decisions: summary.decisions,
          nextSteps: summary.nextSteps,
          llmModel: summary.model,
          tokensInput: summary.tokensInput,
          tokensOutput: summary.tokensOutput,
        },
      });

      if (summary.tasks.length > 0) {
        await tx.task.createMany({
          data: summary.tasks.map((task) => ({
            spaceId: recording.spaceId,
            recordingId,
            creatorUserId: recording.userId,
            title: task.title.slice(0, 200),
            description: task.description,
            priority: task.priority,
            dueAt: task.dueAt ? new Date(task.dueAt) : null,
          })),
        });
      }

      await tx.recording.update({ where: { id: recordingId }, data: { status: "summarized" } });
    });

    // 6) AuditLog (best-effort)
    await db.auditLog.create({
      data: {
        userId: recording.userId,
        action: "recording.transcribed",
        entityType: "Recording",
        entityId: recordingId,
        metadata: { tokensInput: summary.tokensInput, tokensOutput: summary.tokensOutput, model: summary.model },
      },
    }).catch((e) => console.warn("[transcribe-worker] audit log failed", e));

    console.log(`[transcribe-worker] done ${recordingId}`);
    return { ok: true, summaryId: recordingId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db.recording.update({ where: { id: recordingId }, data: { status: "failed", errorMessage: message.slice(0, 1000) } });
    throw err; // BullMQ aplica retry conforme defaultJobOptions
  }
}, { connection: redisConnection, concurrency: 2 });

worker.on("completed", (job: Job) => {
  console.log("[transcribe-worker] completed job", job.id);
});

worker.on("failed", (job: Job | undefined, err: Error) => {
  console.error("[transcribe-worker] failed job", job?.id, err.message);
});

worker.on("error", (err: Error) => {
  console.error("[transcribe-worker] worker error", err.message);
});

async function shutdown(): Promise<void> {
  console.log("[transcribe-worker] shutting down...");
  await worker.close();
  await redisConnection.quit();
  await redisSubscriber.quit();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown());
process.on("SIGINT", () => void shutdown());

console.log("[transcribe-worker] started, listening on queue:", QUEUE_NAME);
