import { Queue } from "bullmq";
import { redisConnection } from "./redis";

export type TranscribeJobData = {
  recordingId: string;
};

export const transcribeQueue = new Queue<TranscribeJobData>("transcribe", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      age: 7 * 24 * 3600, // 7 days
      count: 1000,
    },
    removeOnFail: {
      age: 30 * 24 * 3600, // 30 days
    },
  },
});

/**
 * Enqueue a transcription job for the given recording.
 * Uses recordingId as the jobId for idempotency — re-enqueueing the same
 * recordingId is safe and will not create duplicate jobs.
 */
export async function enqueueTranscribe(recordingId: string): Promise<void> {
  await transcribeQueue.add(
    "transcribe",
    { recordingId },
    { jobId: recordingId }
  );
}
