import { Redis } from '@upstash/redis'

export interface SortedSetEntry {
  handle: string
  score_seconds: number
}

export interface RedisClient {
  get<T = string>(key: string): Promise<T | null>
  set(
    key: string,
    value: string,
    opts?: { ex?: number; nx?: boolean },
  ): Promise<'OK' | null>
  del(key: string): Promise<number>
  incr(key: string): Promise<number>
  expire(key: string, seconds: number): Promise<number>
  ttl(key: string): Promise<number>
  getdel<T = string>(key: string): Promise<T | null>
  setJson<T>(key: string, value: T, opts?: { ex?: number }): Promise<'OK'>
  getJson<T>(key: string): Promise<T | null>
  /** Add a member with a numeric score to a sorted set. Idempotent — second
   *  zadd with the same member overwrites the score. */
  zadd(key: string, entry: { score: number; member: string }): Promise<number>
  /** Range-fetch sorted-set entries by ascending score. start/stop are
   *  zero-based inclusive indexes (Redis ZRANGE semantics). withScores
   *  is implicit — the caller always gets {handle, score_seconds}. */
  zrange(
    key: string,
    start: number,
    stop: number,
    opts?: { withScores?: boolean },
  ): Promise<SortedSetEntry[]>
}

class UpstashClient implements RedisClient {
  constructor(private readonly client: Redis) {}

  async get<T = string>(key: string): Promise<T | null> {
    return (await this.client.get<T>(key)) ?? null
  }

  async set(
    key: string,
    value: string,
    opts?: { ex?: number; nx?: boolean },
  ): Promise<'OK' | null> {
    const args: Record<string, unknown> = {}
    if (opts?.ex) args.ex = opts.ex
    if (opts?.nx) args.nx = true
    const res = await this.client.set(key, value, args as never)
    return res === 'OK' ? 'OK' : null
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key)
  }

  async incr(key: string): Promise<number> {
    return await this.client.incr(key)
  }

  async expire(key: string, seconds: number): Promise<number> {
    const res = await this.client.expire(key, seconds)
    return typeof res === 'number' ? res : res ? 1 : 0
  }

  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key)
  }

  async getdel<T = string>(key: string): Promise<T | null> {
    const maybe = (
      this.client as unknown as { getdel?: (k: string) => Promise<T | null> }
    ).getdel
    if (typeof maybe === 'function') {
      return (await maybe.call(this.client, key)) ?? null
    }
    const value = await this.client.get<T>(key)
    await this.client.del(key)
    return value ?? null
  }

  async setJson<T>(key: string, value: T, opts?: { ex?: number }): Promise<'OK'> {
    const payload = JSON.stringify(value)
    const args: Record<string, unknown> = {}
    if (opts?.ex) args.ex = opts.ex
    await this.client.set(key, payload, args as never)
    return 'OK'
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.client.get<string | T>(key)
    if (raw == null) return null
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw) as T
      } catch {
        return null
      }
    }
    return raw as T
  }

  async zadd(
    key: string,
    entry: { score: number; member: string },
  ): Promise<number> {
    const result = await this.client.zadd(key, {
      score: entry.score,
      member: entry.member,
    })
    return typeof result === 'number' ? result : 0
  }

  async zrange(
    key: string,
    start: number,
    stop: number,
    _opts?: { withScores?: boolean },
  ): Promise<SortedSetEntry[]> {
    // Upstash zrange withScores returns interleaved [member, score, ...]
    // as strings. We always request scores so the caller can sort by them
    // even though Redis already returns sorted.
    const raw = (await this.client.zrange(key, start, stop, {
      withScores: true,
    })) as unknown as Array<string | number>
    const out: SortedSetEntry[] = []
    for (let i = 0; i < raw.length; i += 2) {
      const member = String(raw[i])
      const scoreVal = raw[i + 1]
      const score =
        typeof scoreVal === 'number'
          ? scoreVal
          : parseFloat(String(scoreVal ?? '0')) || 0
      out.push({ handle: member, score_seconds: score })
    }
    return out
  }
}

/**
 * In-memory fallback used whenever the Upstash env vars are missing. Single
 * process, dev only. Warns on first use so it's obvious we aren't persisting.
 */
class InMemoryClient implements RedisClient {
  private readonly store = new Map<string, { value: string; expiresAt: number | null }>()
  private warned = false

  private warnOnce() {
    if (this.warned) return
    this.warned = true
    console.warn(
      '[ada] Using in-memory Redis stub. Set UPSTASH_REDIS_REST_URL and _TOKEN for real persistence. State will be lost on restart.',
    )
  }

  private resolve(key: string): string | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (entry.expiresAt !== null && entry.expiresAt < Date.now()) {
      this.store.delete(key)
      return null
    }
    return entry.value
  }

  async get<T = string>(key: string): Promise<T | null> {
    this.warnOnce()
    const value = this.resolve(key)
    if (value === null) return null
    return value as unknown as T
  }

  async set(
    key: string,
    value: string,
    opts?: { ex?: number; nx?: boolean },
  ): Promise<'OK' | null> {
    this.warnOnce()
    if (opts?.nx && this.resolve(key) !== null) return null
    const expiresAt = opts?.ex ? Date.now() + opts.ex * 1000 : null
    this.store.set(key, { value, expiresAt })
    return 'OK'
  }

  async del(key: string): Promise<number> {
    this.warnOnce()
    return this.store.delete(key) ? 1 : 0
  }

  async incr(key: string): Promise<number> {
    this.warnOnce()
    const existing = this.resolve(key)
    const next = (existing ? parseInt(existing, 10) : 0) + 1
    const entry = this.store.get(key)
    this.store.set(key, {
      value: String(next),
      expiresAt: entry?.expiresAt ?? null,
    })
    return next
  }

  async expire(key: string, seconds: number): Promise<number> {
    this.warnOnce()
    const entry = this.store.get(key)
    if (!entry) return 0
    entry.expiresAt = Date.now() + seconds * 1000
    this.store.set(key, entry)
    return 1
  }

  async ttl(key: string): Promise<number> {
    this.warnOnce()
    const entry = this.store.get(key)
    if (!entry) return -2
    if (entry.expiresAt === null) return -1
    const remaining = Math.ceil((entry.expiresAt - Date.now()) / 1000)
    return remaining > 0 ? remaining : -2
  }

  async getdel<T = string>(key: string): Promise<T | null> {
    this.warnOnce()
    const value = this.resolve(key)
    this.store.delete(key)
    if (value === null) return null
    return value as unknown as T
  }

  async setJson<T>(key: string, value: T, opts?: { ex?: number }): Promise<'OK'> {
    await this.set(key, JSON.stringify(value), opts)
    return 'OK'
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get<string>(key)
    if (raw === null) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  // Sorted-set fallback. Map<key, Array<{score, member}>> kept sorted by
  // ascending score. zadd is idempotent (same member overwrites).
  private readonly sortedSets = new Map<
    string,
    Array<{ score: number; member: string }>
  >()

  async zadd(
    key: string,
    entry: { score: number; member: string },
  ): Promise<number> {
    this.warnOnce()
    let arr = this.sortedSets.get(key) ?? []
    const existingIdx = arr.findIndex((e) => e.member === entry.member)
    const isNew = existingIdx < 0
    if (existingIdx >= 0) arr.splice(existingIdx, 1)
    arr.push({ score: entry.score, member: entry.member })
    arr.sort((a, b) => a.score - b.score)
    this.sortedSets.set(key, arr)
    return isNew ? 1 : 0
  }

  async zrange(
    key: string,
    start: number,
    stop: number,
    _opts?: { withScores?: boolean },
  ): Promise<SortedSetEntry[]> {
    this.warnOnce()
    const arr = this.sortedSets.get(key) ?? []
    const sliced = arr.slice(start, stop + 1)
    return sliced.map((e) => ({ handle: e.member, score_seconds: e.score }))
  }
}

let _client: RedisClient | null = null

export function getRedis(): RedisClient {
  if (_client) return _client

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (url && token) {
    _client = new UpstashClient(new Redis({ url, token }))
  } else {
    _client = new InMemoryClient()
  }
  return _client
}

export function isProductionRedis(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  )
}
