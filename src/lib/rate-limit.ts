/**
 * Rate Limiting helper.
 * Uses an in-memory store in Node.js, providing an alternative to Upstash.
 */

interface RateLimitStore {
  [ip: string]: {
    requests: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // UTC timestamp when things reset
}

/**
 * Checks rate limit for a generic identifier (e.g., client's IP)
 * @param key unique discriminator (like client IP)
 * @param limit max requests allowed within window
 * @param windowMs window elapsed time in milliseconds
 */
export function rateLimit(key: string, limit: number = 30, windowMs: number = 60000): RateLimitResult {
  const now = Date.now();
  
  if (!store[key] || store[key].resetAt < now) {
    store[key] = {
      requests: 0,
      resetAt: now + windowMs
    };
  }
  
  store[key].requests += 1;
  const entry = store[key];
  
  const success = entry.requests <= limit;
  const remaining = Math.max(0, limit - entry.requests);
  
  return {
    success,
    limit,
    remaining,
    reset: entry.resetAt
  };
}

// Cleanup expired entries every 5 minutes to prevent unbounded memory growth
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const key of Object.keys(store)) {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  }
}, 5 * 60 * 1000);

// Prevent the interval from keeping the Node.js process alive on shutdown
cleanupInterval.unref();
