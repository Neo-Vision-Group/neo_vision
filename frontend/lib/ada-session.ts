import { randomUUID } from 'node:crypto'
import { getRedis } from '@/lib/ada-redis'
import type {
  CompletionRecord,
  HistoryMessage,
  SessionState,
  WinnerRecord,
} from '@/lib/ada-types'

const SESSION_TTL_SECONDS = 2 * 3600
const LOCK_TTL_SECONDS = 60
const WINNER_TTL_SECONDS = 3600
const COMPLETION_TTL_SECONDS = 3600
const DLQ_TTL_SECONDS = 7 * 24 * 3600

function stateKey(sessionId: string): string {
  return `ada:session:${sessionId}:state`
}

function lockKey(sessionId: string): string {
  return `ada:session:${sessionId}:lock`
}

function winnerKey(sessionId: string): string {
  return `ada:winner:${sessionId}`
}

function completionKey(sessionId: string): string {
  return `ada:completion:${sessionId}`
}

function webhookDlqKey(kind: 'puzzle' | 'conversation', sessionId: string): string {
  return `ada:webhook_dlq:${kind}:${sessionId}`
}

export class LockConflictError extends Error {
  constructor() {
    super('session is locked by another request')
    this.name = 'LockConflictError'
  }
}

/**
 * Fresh sessions start in mode-picker stage with mode 'unset'. The
 * picker is the user's first interaction; the server synthesizes that
 * turn without an Anthropic call.
 */
export function createInitialState(): SessionState {
  return {
    trust: 0,
    strikes: 0,
    stage: 'mode_picker',
    history: [],
    createdAt: Date.now(),
    status: 'active',
    version: 0,
    mode: 'unset',
    internalNotes: [],
  }
}

export async function loadSession(sessionId: string): Promise<SessionState | null> {
  const redis = getRedis()
  const raw = await redis.getJson<SessionState>(stateKey(sessionId))
  if (!raw) return null
  // Legacy session backfill: v5 sessions don't have `mode` set. Treat as
  // puzzle mode so in-flight v5 sessions don't break after the upgrade.
  // Same for `internalNotes` (default to empty array).
  return {
    ...raw,
    mode: raw.mode ?? 'puzzle',
    internalNotes: raw.internalNotes ?? [],
  }
}

export async function saveSession(
  sessionId: string,
  state: SessionState,
): Promise<void> {
  const redis = getRedis()
  const next = { ...state, version: state.version + 1 }
  await redis.setJson(stateKey(sessionId), next, { ex: SESSION_TTL_SECONDS })
}

export async function withSessionLock<T>(
  sessionId: string,
  fn: () => Promise<T>,
): Promise<T> {
  const redis = getRedis()
  const token = randomUUID()
  const key = lockKey(sessionId)
  const acquired = await redis.set(key, token, {
    ex: LOCK_TTL_SECONDS,
    nx: true,
  })
  if (acquired !== 'OK') throw new LockConflictError()

  try {
    return await fn()
  } finally {
    // Only release if we still own the lock. If the TTL expired and another
    // request took over, deleting would release their lock.
    const current = await redis.get(key)
    if (current === token) {
      await redis.del(key)
    }
  }
}

// --- Puzzle-mode winner record -------------------------------------------

export async function markSessionWon(
  sessionId: string,
  transcript: HistoryMessage[],
  finalTrust: number,
): Promise<void> {
  const redis = getRedis()
  const record: WinnerRecord = {
    session_id: sessionId,
    transcript,
    wonAt: Date.now(),
    finalTrust,
  }
  await redis.setJson(winnerKey(sessionId), record, { ex: WINNER_TTL_SECONDS })
}

export async function peekWinnerRecord(
  sessionId: string,
): Promise<WinnerRecord | null> {
  const redis = getRedis()
  return await redis.getJson<WinnerRecord>(winnerKey(sessionId))
}

export async function consumeWinnerRecord(
  sessionId: string,
): Promise<WinnerRecord | null> {
  const redis = getRedis()
  const raw = await redis.getdel<string | WinnerRecord>(winnerKey(sessionId))
  if (raw === null) return null
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as WinnerRecord
    } catch {
      return null
    }
  }
  return raw
}

// --- Conversation-mode completion record --------------------------------

export async function markSessionCompleted(
  sessionId: string,
  transcript: HistoryMessage[],
  internalNotes: string[],
): Promise<void> {
  const redis = getRedis()
  const record: CompletionRecord = {
    session_id: sessionId,
    transcript,
    completedAt: Date.now(),
    internalNotes,
  }
  await redis.setJson(completionKey(sessionId), record, {
    ex: COMPLETION_TTL_SECONDS,
  })
}

export async function peekCompletionRecord(
  sessionId: string,
): Promise<CompletionRecord | null> {
  const redis = getRedis()
  return await redis.getJson<CompletionRecord>(completionKey(sessionId))
}

export async function consumeCompletionRecord(
  sessionId: string,
): Promise<CompletionRecord | null> {
  const redis = getRedis()
  const raw = await redis.getdel<string | CompletionRecord>(completionKey(sessionId))
  if (raw === null) return null
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as CompletionRecord
    } catch {
      return null
    }
  }
  return raw
}

// --- DLQ helpers --------------------------------------------------------

export async function writeClaimDlq(
  sessionId: string,
  payload: {
    email: string
    idea: string
    transcript: HistoryMessage[]
    reason: string
  },
): Promise<void> {
  const redis = getRedis()
  await redis.setJson(`ada:claim_dlq:${sessionId}`, payload, {
    ex: DLQ_TTL_SECONDS,
  })
}

/**
 * Webhook DLQ for the auto-fire path on conversation `result_complete`.
 * The auto-webhook is fire-and-forget (Promise.race + try/catch); on
 * failure or timeout it lands here for later retry.
 */
export async function writeWebhookDlq(
  kind: 'puzzle' | 'conversation',
  sessionId: string,
  payload: unknown,
  reason: string,
): Promise<void> {
  const redis = getRedis()
  await redis.setJson(
    webhookDlqKey(kind, sessionId),
    { payload, reason, ts: new Date().toISOString() },
    { ex: DLQ_TTL_SECONDS },
  )
}

// =============================================================================
//  v2 JAILBREAK SESSION HELPERS — added 2026-04-28
// =============================================================================

/**
 * Fresh v2 sessions start at jailbreak level 1, no timer yet, pressure 0.
 * The timer kicks off on the user's first message (set in the level-1 turn
 * handler). The frontend mounts directly into the jailbreak phase with
 * level-1 Ada introducing herself.
 */
export function createInitialJailbreakState(): SessionState {
  return {
    // v1 fields kept (some used as analytics, others ignored in v2)
    trust: 0,
    strikes: 0,
    stage: 'jailbreak_level_1',
    history: [],
    createdAt: Date.now(),
    status: 'active',
    version: 0,
    mode: 'unset',
    internalNotes: [],
    // v2 fields
    level: 1,
    pressure: 0,
    captureHistory: [],
    timerStartedAt: null,
    levelStartTimes: { 1: Date.now() },
    handle: null,
    adversarialBlocks: 0,
    lastApproachHash: undefined,
  }
}

// ----- Leaderboard ----------------------------------------------------------

const LEADERBOARD_DAILY_TTL_SECONDS = 48 * 3600 // 48 h, snapshot rolls before TTL
const HANDLE_RESERVATION_TTL_SECONDS = 30 * 24 * 3600 // 30 d

function leaderboardDailyKey(yyyymmdd: string): string {
  return `ada:leaderboard:${yyyymmdd}`
}

function leaderboardAllTimeKey(): string {
  return 'ada:leaderboard:all-time'
}

function leaderboardCounterKey(name: 'players' | 'winners'): string {
  return `ada:leaderboard:total_${name}`
}

function leaderboardLastWinnerKey(): string {
  return 'ada:leaderboard:last_winner_at'
}

function handleReservationKey(handle: string): string {
  return `ada:handle:${handle}`
}

function todayYmd(): string {
  const d = new Date()
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Records a winning entry. Idempotent per handle (zadd overwrites the
 * previous score for that member, which is fine — same handle, same run).
 * Increments the total-winners counter and updates the last-winner timestamp.
 */
export async function recordLeaderboardEntry(
  handle: string,
  scoreSeconds: number,
): Promise<void> {
  const redis = getRedis()
  const ymd = todayYmd()
  const dailyKey = leaderboardDailyKey(ymd)
  const allTimeKey = leaderboardAllTimeKey()

  await redis.zadd(dailyKey, { score: scoreSeconds, member: handle })
  await redis.expire(dailyKey, LEADERBOARD_DAILY_TTL_SECONDS)
  await redis.zadd(allTimeKey, { score: scoreSeconds, member: handle })
  await redis.incr(leaderboardCounterKey('winners'))
  await redis.set(leaderboardLastWinnerKey(), String(Date.now()))
}

/** Increments total-players counter. Called once per session on first
 *  user input (when timerStartedAt is being set). */
export async function recordPlayerStart(): Promise<void> {
  const redis = getRedis()
  await redis.incr(leaderboardCounterKey('players'))
}

export interface LeaderboardSnapshot {
  today: { handle: string; score_seconds: number }[]
  all_time: { handle: string; score_seconds: number }[]
  total_players: number
  total_winners: number
  last_winner_at: number | null
}

export async function readLeaderboard(): Promise<LeaderboardSnapshot> {
  const redis = getRedis()
  const ymd = todayYmd()
  const [todayEntries, allTimeEntries, totalPlayers, totalWinners, lastWinnerAt] =
    await Promise.all([
      redis.zrange(leaderboardDailyKey(ymd), 0, 9, { withScores: true }),
      redis.zrange(leaderboardAllTimeKey(), 0, 99, { withScores: true }),
      redis.get(leaderboardCounterKey('players')),
      redis.get(leaderboardCounterKey('winners')),
      redis.get(leaderboardLastWinnerKey()),
    ])
  return {
    today: todayEntries,
    all_time: allTimeEntries,
    total_players: typeof totalPlayers === 'string' ? parseInt(totalPlayers, 10) || 0 : 0,
    total_winners: typeof totalWinners === 'string' ? parseInt(totalWinners, 10) || 0 : 0,
    last_winner_at:
      typeof lastWinnerAt === 'string' ? parseInt(lastWinnerAt, 10) || null : null,
  }
}

/**
 * Reserves a handle so two simultaneous winners can't claim the same one.
 * Returns true if reserved (caller should commit), false if already taken.
 * Reservation TTL: 30 days (long enough that mid-claim races resolve).
 */
export async function reserveHandle(handle: string, sessionId: string): Promise<boolean> {
  const redis = getRedis()
  const result = await redis.set(handleReservationKey(handle), sessionId, {
    ex: HANDLE_RESERVATION_TTL_SECONDS,
    nx: true,
  })
  return result === 'OK'
}

// ----- Artifact record (PNG bytes stored briefly in Redis) -----------------

const ARTIFACT_TTL_SECONDS = 3600 // 1 h

function artifactKey(token: string): string {
  return `ada:artifact:${token}`
}

/** Stores artifact bytes (base64-encoded) under a random token. Returns the
 *  token so the URL `/api/artifact/{token}` can serve the PNG later. */
export async function storeArtifact(bytes: Buffer): Promise<string> {
  const redis = getRedis()
  const token = randomUUID().replace(/-/g, '')
  await redis.set(artifactKey(token), bytes.toString('base64'), {
    ex: ARTIFACT_TTL_SECONDS,
  })
  return token
}

export async function loadArtifact(token: string): Promise<Buffer | null> {
  const redis = getRedis()
  const raw = await redis.get(artifactKey(token))
  if (typeof raw !== 'string') return null
  return Buffer.from(raw, 'base64')
}

export const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidUuidV4(id: string): boolean {
  return UUID_V4_PATTERN.test(id)
}
