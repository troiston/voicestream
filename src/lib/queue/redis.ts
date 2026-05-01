import Redis from "ioredis";
import { env } from "@/lib/env";

// BullMQ requires maxRetriesPerRequest: null so that commands are not
// auto-retried by ioredis — BullMQ handles its own retry logic.
function createRedisConnection(): Redis {
  return new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}

// Primary connection used by Queue and Worker.
export const redisConnection: Redis = createRedisConnection();

// Separate connection for BullMQ event subscriptions (QueueEvents).
// ioredis enters "subscriber mode" when SUBSCRIBE is issued, which blocks
// all non-pub/sub commands on that connection.
export const redisSubscriber: Redis = createRedisConnection();
