import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: true,
      prefix: 'portfolio-contact',
    })
  : null;

/** Returns true if the request should be blocked (rate limit exceeded). */
export async function isRateLimited(identifier: string): Promise<boolean> {
  if (!ratelimit) return false;

  const { success } = await ratelimit.limit(identifier);
  return !success;
}
