import { db } from "@/lib/db";
import { redisConnection } from "@/lib/queue/redis";
import { s3Client } from "@/lib/storage/seaweed";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";
import { HeadBucketCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CheckResult = "ok" | string;

interface ReadinessResponse {
  status: "ready" | "not_ready";
  checks: {
    db: CheckResult;
    redis: CheckResult;
    s3: CheckResult;
  };
}

const TIMEOUT_MS = 2000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), timeoutMs)
    ),
  ]);
}

async function checkDb(): Promise<CheckResult> {
  try {
    await withTimeout(db.$queryRaw`SELECT 1`, TIMEOUT_MS);
    return "ok";
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "unknown error";
    logger.warn({ check: "db", detail: msg }, "readiness check db failed");
    return "error";
  }
}

async function checkRedis(): Promise<CheckResult> {
  try {
    await withTimeout(redisConnection.ping(), TIMEOUT_MS);
    return "ok";
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "unknown error";
    logger.warn({ check: "redis", detail: msg }, "readiness check redis failed");
    return "error";
  }
}

async function checkS3(): Promise<CheckResult> {
  try {
    await withTimeout(
      s3Client.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET })),
      TIMEOUT_MS
    );
    return "ok";
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "unknown error";
    logger.warn({ check: "s3", detail: msg }, "readiness check s3 failed");
    return "error";
  }
}

export async function GET(): Promise<Response> {
  const results = await Promise.allSettled([
    checkDb(),
    checkRedis(),
    checkS3(),
  ]);

  const checks: ReadinessResponse["checks"] = {
    db: results[0].status === "fulfilled" ? results[0].value : "error",
    redis: results[1].status === "fulfilled" ? results[1].value : "error",
    s3: results[2].status === "fulfilled" ? results[2].value : "error",
  };

  const allOk = Object.values(checks).every((c) => c === "ok");
  const status: ReadinessResponse["status"] = allOk ? "ready" : "not_ready";

  const response: ReadinessResponse = {
    status,
    checks,
  };

  if (!allOk) {
    logger.warn({ checks }, "readiness check failed");
  }

  return Response.json(response, {
    status: allOk ? 200 : 503,
  });
}
