// Upstash Redis sliding-window rate limiting
const UPSTASH_URL = import.meta.env.VITE_UPSTASH_REDIS_URL as string | undefined;
const UPSTASH_TOKEN = import.meta.env.VITE_UPSTASH_REDIS_TOKEN as string | undefined;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

async function upstashCommand(command: string[]): Promise<unknown> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  const res = await fetch(`${UPSTASH_URL}/${command.map(encodeURIComponent).join('/')}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  const json = await res.json() as { result: unknown };
  return json.result;
}

export async function checkRateLimit(
  identifier: string,
  limitCount: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  // If Redis not configured, fail open
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return { allowed: true, remaining: limitCount - 1, reset: Date.now() / 1000 + windowSeconds, limit: limitCount };
  }

  const key = `rl:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSeconds;

  try {
    await upstashCommand(['ZREMRANGEBYSCORE', key, '-inf', String(windowStart)]);
    const count = (await upstashCommand(['ZCARD', key])) as number;

    if (count >= limitCount) {
      return { allowed: false, remaining: 0, reset: now + windowSeconds, limit: limitCount };
    }
    await upstashCommand(['ZADD', key, String(now), `${now}-${Math.random()}`]);
    await upstashCommand(['EXPIRE', key, String(windowSeconds * 2)]);
    return { allowed: true, remaining: limitCount - count - 1, reset: now + windowSeconds, limit: limitCount };
  } catch {
    return { allowed: true, remaining: 1, reset: now + windowSeconds, limit: limitCount };
  }
}

export const RateLimiters = {
  aiRequest: (userId: string) => checkRateLimit(`ai:user:${userId}`, 200, 86400),
  loginAttempt: (ip: string) => checkRateLimit(`login:ip:${ip}`, 10, 900),
  signupAttempt: (ip: string) => checkRateLimit(`signup:ip:${ip}`, 5, 3600),
};
