import Redis from "ioredis";

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    const url = process.env.REDIS_URL;

    if (!url) {
      throw new Error("REDIS_URL is missing in environment");
    }

    redisClient = new Redis(url);
  }

  return redisClient;
}