import { NextRequest } from "next/server";

interface RateLimitConfig {
  interval: number;
  uniqueTokenPerInterval: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

function getIP(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (xff) {
    return xff.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return "unknown";
}

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = {
    interval: 15 * 60 * 1000,
    uniqueTokenPerInterval: 5,
  }
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const ip = getIP(request);
  const now = Date.now();
  const key = `rate-limit:${ip}`;

  if (!store[key] || now > store[key].resetTime) {
    store[key] = {
      count: 0,
      resetTime: now + config.interval,
    };
  }

  const entry = store[key];
  const remaining = Math.max(0, config.uniqueTokenPerInterval - entry.count - 1);
  const success = entry.count < config.uniqueTokenPerInterval;

  if (success) {
    entry.count++;
  }

  const resetInSeconds = Math.ceil((entry.resetTime - now) / 1000);

  return {
    success,
    limit: config.uniqueTokenPerInterval,
    remaining,
    reset: resetInSeconds,
  };
}

setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (now > store[key].resetTime) {
      delete store[key];
    }
  });
}, 60 * 1000);
