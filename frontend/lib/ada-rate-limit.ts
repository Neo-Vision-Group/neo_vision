import { getRedis } from '@/lib/ada-redis'

const SESSIONS_PER_IP_24H = process.env.NODE_ENV === 'production' ? 3 : 100
const MESSAGES_PER_SESSION = 30
const COOLDOWN_SECONDS = (Number(process.env.COOLDOWN_HOURS) || 24) * 3600
const IP_WINDOW_SECONDS = 24 * 3600
const SESSION_TTL_SECONDS = 2 * 3600

const IP_PATTERN = /^[0-9a-f:.\[\]]+$/i
// CRLF or NUL in a header value is an injection attempt — reject the whole
// thing rather than try to clean it up.
const SUSPICIOUS_HEADER = /[\r\n\0]/

export function sanitizeIp(raw: string | string[] | undefined | null): string {
  if (!raw) return '0.0.0.0'
  const joined = Array.isArray(raw) ? raw.join(',') : raw
  if (SUSPICIOUS_HEADER.test(joined)) return '0.0.0.0'
  const first = joined.split(',')[0]
  const trimmed = (first ?? '').trim()
  if (!trimmed) return '0.0.0.0'
  if (trimmed.length > 64) return '0.0.0.0'
  if (!IP_PATTERN.test(trimmed)) return '0.0.0.0'
  return trimmed
}

interface LimitResult {
  allowed: boolean
  retryAfter?: number
}

export async function checkIpCooldown(ip: string): Promise<LimitResult> {
  const redis = getRedis()
  const key = `ada:ip:${ip}:cooldown`
  const value = await redis.get(key)
  if (value === null) return { allowed: true }
  const ttl = await redis.ttl(key)
  return { allowed: false, retryAfter: ttl > 0 ? ttl : COOLDOWN_SECONDS }
}

export async function checkIpSessionLimit(
  ip: string,
  sessionId: string,
): Promise<LimitResult> {
  const redis = getRedis()
  const markerKey = `ada:ip:${ip}:session:${sessionId}`
  const seen = await redis.get(markerKey)
  if (seen !== null) return { allowed: true }

  const counterKey = `ada:ip:${ip}:sessions_24h`
  const existing = await redis.get(counterKey)
  const count = existing ? parseInt(existing as string, 10) : 0
  if (count >= SESSIONS_PER_IP_24H) {
    const ttl = await redis.ttl(counterKey)
    return { allowed: false, retryAfter: ttl > 0 ? ttl : IP_WINDOW_SECONDS }
  }

  const next = await redis.incr(counterKey)
  if (next === 1) await redis.expire(counterKey, IP_WINDOW_SECONDS)
  await redis.set(markerKey, '1', { ex: IP_WINDOW_SECONDS })
  return { allowed: true }
}

export async function checkMessageLimit(sessionId: string): Promise<LimitResult> {
  const redis = getRedis()
  const key = `ada:session:${sessionId}:messages`
  const next = await redis.incr(key)
  if (next === 1) await redis.expire(key, SESSION_TTL_SECONDS)
  if (next > MESSAGES_PER_SESSION) {
    return { allowed: false, retryAfter: SESSION_TTL_SECONDS }
  }
  return { allowed: true }
}

export async function setCooldown(ip: string): Promise<void> {
  const redis = getRedis()
  const key = `ada:ip:${ip}:cooldown`
  await redis.set(key, '1', { ex: COOLDOWN_SECONDS, nx: true })
}

export function getCooldownSeconds(): number {
  return COOLDOWN_SECONDS
}
