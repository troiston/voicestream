import { NextResponse } from "next/server";
import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import { redisConnection } from "@/lib/queue/redis";
import { logger } from "@/lib/logger";

const limiters = new Map<string, RateLimiterRedis>();

function getLimiter(points: number, durationSec: number): RateLimiterRedis {
  const key = `${points}:${durationSec}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new RateLimiterRedis({
      storeClient: redisConnection,
      keyPrefix: `rl:${key}`,
      points,
      duration: durationSec,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

export async function rateLimit(
  _req: Request,
  key: string,
  points: number,
  durationSec: number,
): Promise<RateLimitResult> {
  const limiter = getLimiter(points, durationSec);
  try {
    await limiter.consume(key, 1);
    return { ok: true };
  } catch (err) {
    if (err instanceof RateLimiterRes) {
      const retryAfter = Math.ceil(err.msBeforeNext / 1000) || durationSec;
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Too many requests" },
          {
            status: 429,
            headers: {
              "Retry-After": String(retryAfter),
              "X-RateLimit-Limit": String(points),
              "X-RateLimit-Remaining": String(err.remainingPoints ?? 0),
            },
          },
        ),
      };
    }
    logger.error({ err, key }, "rate-limit redis error");
    return { ok: true };
  }
}
