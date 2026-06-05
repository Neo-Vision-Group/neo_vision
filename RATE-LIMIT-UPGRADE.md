# Rate Limiter Upgrade Required

## Current Issue

The existing rate limiter (`frontend/lib/rate-limit.ts`) uses an **in-memory store** that does not work reliably in production on Vercel:

```typescript
const store: RateLimitStore = {};
```

### Why This Fails in Production

- **Serverless/Edge Functions**: Each invocation may run on a different instance
- **No Shared State**: The in-memory `store` is isolated per-instance
- **Ineffective Limiting**: A user can bypass limits by hitting different instances

## Recommended Solutions

### Option 1: Upstash Redis (Recommended)

**Pros:**
- Purpose-built for serverless
- Global edge network
- Free tier: 10K requests/day
- Official Vercel integration

**Setup:**
```bash
npm install @upstash/redis @upstash/ratelimit
```

**Implementation:**
```typescript
// lib/rate-limit-upstash.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const contactRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "contact-form",
});

// Usage in api/contact/route.ts
const identifier = getIP(request);
const { success, limit, remaining, reset } = await contactRateLimit.limit(identifier);
```

**Environment Variables:**
```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Option 2: Vercel KV

**Pros:**
- Native Vercel integration
- Built on Upstash
- Simple setup

**Setup:**
```bash
npm install @vercel/kv
```

### Option 3: Vercel Rate Limiting (Enterprise)

If you have Vercel Pro/Enterprise, use built-in protection:
```typescript
import { rateLimit } from '@vercel/edge';
```

## Migration Checklist

- [ ] Choose solution (recommend Upstash)
- [ ] Create Upstash account & database
- [ ] Add environment variables to Vercel
- [ ] Install dependencies
- [ ] Replace `lib/rate-limit.ts` with new implementation
- [ ] Update `api/contact/route.ts` import
- [ ] Test rate limiting in production
- [ ] Monitor Upstash dashboard for usage
- [ ] Update `DEPLOYMENT-SECURITY-CHECKLIST.md`

## Testing

After deployment, verify:
```bash
# Should succeed 5 times, then return 429
for i in {1..6}; do
  curl -X POST https://your-domain.com/api/contact \
    -H "Content-Type: application/json" \
    -H "x-csrf-token: YOUR_TOKEN" \
    -d '{"name":"Test","email":"test@example.com","message":"Testing rate limit"}'
  echo ""
done
```

## Current Workaround

Until upgraded, the existing rate limiter provides **some** protection but is not production-grade. Consider:
- Monitoring Sanity for spam submissions
- Adding Cloudflare rate limiting at the edge
- Implementing Turnstile/hCaptcha as additional protection
