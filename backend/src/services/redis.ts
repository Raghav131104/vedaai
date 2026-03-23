import Redis from 'ioredis';

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {

    if (process.env.REDIS_URL) {

      //  PRODUCTION MODE
      redisClient = new Redis(process.env.REDIS_URL);

    } else {

      // LOCAL MODE
      redisClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
      });

    }

    redisClient.on('connect', () => console.log('Redis connected'));
    redisClient.on('error', (err) => console.error('Redis error:', err));
  }

  return redisClient;
}