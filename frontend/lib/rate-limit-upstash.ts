import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client from environment variables
// Required env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
let redis: Redis | null = null;
let contactRateLimit: Ratelimit | null = null;

function getRedis(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        "Missing Upstash Redis credentials. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables."
      );
    }

    redis = new Redis({
      url,
      token,
    });
  }
  return redis;
}

export function getContactRateLimit(): Ratelimit {
  if (!contactRateLimit) {
    contactRateLimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "contact-form",
    });
  }
  return contactRateLimit;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function checkContactRateLimit(
  identifier: string
): Promise<RateLimitResult> {
  try {
    const limiter = getContactRateLimit();
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    return {
      success,
      limit,
      remaining,
      reset: Math.ceil((reset - Date.now()) / 1000),
    };
  } catch (error) {
    console.error("[rate-limit-upstash] Failed to check rate limit:", error);
    // Fail open: allow the request if rate limiting service is down
    return {
      success: true,
      limit: 5,
      remaining: 5,
      reset: 900,
    };
  }
}
