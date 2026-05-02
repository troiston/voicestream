"use strict";
// Worker BullMQ — executar com `tsx src/workers/transcribe.ts`.
// Em produção via Dockerfile.worker.

import "dotenv/config";
import { Worker, type Job } from "bullmq";
import { redisConnection, redisSubscriber } from "@/lib/queue/redis";
import { type TranscribeJobData } from "@/lib/queue/index";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { transcribeFromStorageKey } from "@/lib/transcription/deepgram";
import { summarizeAndExtract } from "@/lib/llm/anthropic";
import { encryptTranscriptText } from "@/lib/crypto/envelope";
import { normalizeSuggestedTasks } from "@/lib/recordings/suggested-tasks";

const QUEUE_NAME = "transcribe";

type SummaryCreateWithSuggestedTasks = {
  create(args: {
    data: {
      recordingId: string;
      transcriptionId: string;
      abstract: string;
      decisions: string[];
      nextSteps: string[];
      suggestedTasks: unknown;
      llmModel: string;
      tokensInput?: number;
      tokensOutput?: number;
    };
  }): Promise<unknown>;
};

const worker = new Worker<TranscribeJobData>(QUEUE_NAME, async (job: Job<TranscribeJobData>) => {
  const { recordingId } = job.data;
  console.log(`[transcribe-worker] start ${recordingId}`);

  const recording = await db.recording.findUnique({
    where: { id: recordingId },
    include: { space: { select: { kind: true } } },
  });
  if (!recording) throw new Error(`Recording ${recordingId} not found`);

  const isSensitiveSpace = recording.space.kind === "saude" || recording.space.kind === "financas";

  // Idempotência: se já summarized, pular (retry/duplicado)
  if (recording.status === "summarized") {
    console.log(`[transcribe-worker] already summarized, skipping ${recordingId}`);
    return { skipped: true };
  }

  // 1) Marca como processing
  await db.recording.update({ where: { id: recordingId }, data: { status: "processing", errorMessage: null } });

  try {
    // 2) Deepgram
    const t = await transcribeFromStorageKey(recording.storageKey, {
      language: recording.language,
      encryptionMeta: recording.encryptionMeta ?? undefined,
    });

    // 3) Persist Transcription + segments (transação)
    await db.$transaction(async (tx) => {
      // Idempotência: apaga transcription anterior (retry parcial)
      await tx.transcription.deleteMany({ where: { recordingId } });

      const storedText = isSensitiveSpace
        ? encryptTranscriptText(t.text, recording.userId)
        : t.text;

      const trans = await tx.transcription.create({
        data: {
          recordingId,
          provider: "deepgram",
          language: t.language,
          text: storedText,
          confidence: t.confidence,
          rawJson: isSensitiveSpace ? Prisma.JsonNull : (t.rawJson as Prisma.InputJsonValue),
          encrypted: isSensitiveSpace,
        },
      });

      if (t.segments.length > 0) {
        await tx.transcriptionSegment.createMany({
          data: t.segments.map((s) => ({
            transcriptionId: trans.id,
            speaker: s.speaker,
            startMs: s.startMs,
            endMs: s.endMs,
            text: isSensitiveSpace
              ? encryptTranscriptText(s.text, recording.userId)
              : s.text,
            confidence: s.confidence,
            encrypted: isSensitiveSpace,
          })),
        });
      }

      await tx.recording.update({ where: { id: recordingId }, data: { status: "transcribed" } });
    });

    // 4) Anthropic — summary + suggested tasks
    const summary = await summarizeAndExtract(t.text, { language: t.language });

    // 5) Persist Summary + task suggestions (transação)
    await db.$transaction(async (tx) => {
      const trans = await tx.transcription.findUniqueOrThrow({ where: { recordingId }, select: { id: true } });

      // Idempotência: limpar Summary anterior do mesmo recording.
      // Tarefas reais são criadas só após confirmação humana na UI.
      await tx.summary.deleteMany({ where: { recordingId } });

      const [space, members] = await Promise.all([
        tx.space.findUnique({
          where: { id: recording.spaceId },
          select: { name: true },
        }),
        tx.spaceMember.findMany({
          where: { spaceId: recording.spaceId, status: "active" },
          include: { user: { select: { id: true, name: true } } },
        }),
      ]);

      const knownMembers = [
        { id: recording.userId, name: "Autor da gravação" },
        ...members
          .filter((member) => member.user.name)
          .map((member) => ({ id: member.user.id, name: member.user.name as string })),
      ];

      const suggestedTasks = normalizeSuggestedTasks(
        summary.tasks.map((task) => ({
          what: task.what || task.title,
          why: task.why,
          who: task.who,
          when: task.when ?? task.dueAt,
          where: task.where,
          how: task.how,
          howMuch: task.howMuch,
          transcriptQuote: task.transcriptQuote,
          priority: task.priority,
        })),
        { spaceName: space?.name ?? "VoiceStream", knownMembers },
      );

      await (tx.summary as unknown as SummaryCreateWithSuggestedTasks).create({
        data: {
          recordingId,
          transcriptionId: trans.id,
          abstract: summary.abstract,
          decisions: summary.decisions,
          nextSteps: summary.nextSteps,
          suggestedTasks,
          llmModel: summary.model,
          tokensInput: summary.tokensInput,
          tokensOutput: summary.tokensOutput,
        },
      });

      await tx.recording.update({ where: { id: recordingId }, data: { status: "summarized" } });
    });

    // 6) Track usage (best-effort)
    await db.usage.create({
      data: {
        userId: recording.userId,
        type: "minutes_transcribed",
        quantity: Math.ceil(recording.durationSec / 60),
        metadata: {
          recordingId,
          spaceId: recording.spaceId,
          model: summary.model,
        },
      },
    }).catch((e) => console.warn("[transcribe-worker] usage tracking failed", e));

    // 7) AuditLog (best-effort)
    await db.auditLog.create({
      data: {
        userId: recording.userId,
        action: "recording.transcribed",
        entityType: "Recording",
        entityId: recordingId,
        metadata: {
          tokensInput: summary.tokensInput,
          tokensOutput: summary.tokensOutput,
          model: summary.model,
          suggestedTasks: summary.tasks.length,
        },
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
