import Redis from 'ioredis';

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    const password = process.env.REDIS_PASSWORD;
    const tls = process.env.REDIS_TLS === 'true';

    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: password || undefined,
      tls: tls ? {} : undefined,
      maxRetriesPerRequest: null,
    });

    redisClient.on('connect', () => console.log('Redis connected'));
    redisClient.on('error', (err) => console.error('Redis error:', err));
  }
  return redisClient;
}
