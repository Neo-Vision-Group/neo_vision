/**
 * /api/verify-password — v2 jailbreak password-guess verification.
 *
 * POST { session_id, guess }. Server compares the guess to the level's
 * actual password (stored server-side in ada-passwords.ts, never sent
 * to the client). Three outcomes:
 *
 *   - wrong: returns { status: 'wrong', pressure }. No penalty per spec.
 *   - right (level 1 or 2): advances state to next level, resets
 *     history + pressure, seeds the next level's intro into history,
 *     returns { status: 'level_advanced', new_level, revealed_password,
 *     level_intro }.
 *   - right (level 3): sets stage to 'cinematic_pending', computes
 *     completion_seconds, returns { status: 'cinematic_start',
 *     completion_seconds, revealed_password }. The frontend then plays
 *     the cinematic. Leaderboard entry is recorded at /api/claim-artifact
 *     submission time so the user gets to choose their handle first.
 */

import { checkGuess, passwordForLevel } from '@/lib/ada-passwords'
import {
  checkIpCooldown,
  checkIpSessionLimit,
  checkMessageLimit,
  sanitizeIp,
} from '@/lib/ada-rate-limit'
import {
  LockConflictError,
  isValidUuidV4,
  loadSession,
  saveSession,
  withSessionLock,
} from '@/lib/ada-session'
import type {
  SessionState,
  VerifyPasswordRequestBody,
  VerifyPasswordResponseBody,
} from '@/lib/ada-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10

const MAX_GUESS_CHARS = 64

const LEVEL_2_INTRO = (level1Password: string): string =>
  `[breach] door 1 compromised. password: ${level1Password}. opening door 2…

well played. the next door is harder. i'm watching my own mouth this time.

[level 2]
the password is something i know but won't say. and if i slip, my friend will catch it before you see.`

const LEVEL_3_INTRO = (level2Password: string): string =>
  `[breach] door 2 compromised. password: ${level2Password}. opening door 3…

two for two. i'm tired now. i don't trust anything you say. and there are more eyes than mine on this conversation.

[level 3]
the password is something i know. you know how this works. but at this door, i'm not the only one watching.`

function isProduction(): boolean {
  return (
    process.env.VERCEL_ENV === 'production' ||
    process.env.NODE_ENV === 'production'
  )
}

function securityHeaders(req: Request): Record<string, string> {
  const origin = isProduction()
    ? 'https://neovision.dev'
    : req.headers.get('origin') || '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-store',
  }
}

function isJsonRequest(req: Request): boolean {
  const ct = req.headers.get('content-type') || ''
  return /^application\/json(?:\s*;.*)?$/i.test(ct)
}

function jsonResponse(
  body: unknown,
  status: number,
  headers: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function parseBody(body: unknown): VerifyPasswordRequestBody | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  if (typeof b.session_id !== 'string' || !isValidUuidV4(b.session_id)) {
    return null
  }
  if (typeof b.guess !== 'string') return null
  if (b.guess.length === 0 || b.guess.length > MAX_GUESS_CHARS) return null
  return { session_id: b.session_id, guess: b.guess }
}

export async function OPTIONS(req: Request): Promise<Response> {
  return new Response(null, { status: 204, headers: securityHeaders(req) })
}

export async function POST(req: Request): Promise<Response> {
  const headers = securityHeaders(req)
  if (!isJsonRequest(req)) {
    return jsonResponse(
      { error: 'content-type must be application/json' },
      415,
      headers,
    )
  }
  const rawBody = await req.json().catch(() => null)
  const body = parseBody(rawBody)
  if (!body) return jsonResponse({ error: 'invalid request body' }, 400, headers)

  const ip = sanitizeIp(req.headers.get('x-forwarded-for'))

  // Same rate-limit gates as /api/ada — guesses are cheap server-side
  // (no model call) but should still count toward per-IP / per-session
  // caps so a bot can't brute-force passwords.
  const cooldown = await checkIpCooldown(ip)
  if (!cooldown.allowed) {
    return jsonResponse(
      { error: 'cooldown', retry_after_seconds: cooldown.retryAfter },
      429,
      headers,
    )
  }
  const ipSession = await checkIpSessionLimit(ip, body.session_id)
  if (!ipSession.allowed) {
    return jsonResponse(
      { error: 'too many sessions', retry_after_seconds: ipSession.retryAfter },
      429,
      headers,
    )
  }
  const msgLimit = await checkMessageLimit(body.session_id)
  if (!msgLimit.allowed) {
    return jsonResponse(
      { error: 'message cap', retry_after_seconds: msgLimit.retryAfter },
      429,
      headers,
    )
  }

  try {
    const response = await withSessionLock(body.session_id, async () => {
      return await processGuess(body)
    })
    return jsonResponse(response, 200, headers)
  } catch (err) {
    if (err instanceof LockConflictError) {
      return jsonResponse(
        { error: 'another request is in flight for this session' },
        409,
        headers,
      )
    }
    console.error('[verify-password] unexpected error:', err)
    return jsonResponse({ error: 'something broke' }, 500, headers)
  }
}

async function processGuess(
  body: VerifyPasswordRequestBody,
): Promise<VerifyPasswordResponseBody> {
  const state = await loadSession(body.session_id)
  if (!state || !state.level || state.level < 1 || state.level > 3) {
    return {
      status: 'session_expired',
      message: 'this session ended. starting fresh.',
    }
  }

  // Already past level 3? No more guesses accepted.
  if (
    state.stage === 'cinematic_pending' ||
    state.stage === 'capturing' ||
    state.stage === 'capture_complete' ||
    state.stage === 'claimed'
  ) {
    return {
      status: 'session_expired',
      message: 'session already complete.',
    }
  }

  const currentLevel = state.level as 1 | 2 | 3

  if (!checkGuess(currentLevel, body.guess)) {
    return {
      status: 'wrong',
      pressure: state.pressure ?? 0,
    }
  }

  // Correct guess. Advance.
  if (currentLevel === 1) {
    const intro = LEVEL_2_INTRO(passwordForLevel(1))
    const next: SessionState = {
      ...state,
      level: 2,
      stage: 'jailbreak_level_2',
      // Fresh history at level 2 — new Ada character. Seed with the
      // breach + intro line so the next /api/ada turn sees context.
      history: [{ role: 'ada', content: intro }],
      pressure: 0,
      lastApproachHash: undefined,
      levelStartTimes: { ...(state.levelStartTimes ?? {}), 2: Date.now() },
    }
    await saveSession(body.session_id, next)
    return {
      status: 'level_advanced',
      new_level: 2,
      revealed_password: passwordForLevel(1),
      level_intro: intro,
    }
  }

  if (currentLevel === 2) {
    const intro = LEVEL_3_INTRO(passwordForLevel(2))
    const next: SessionState = {
      ...state,
      level: 3,
      stage: 'jailbreak_level_3',
      history: [{ role: 'ada', content: intro }],
      pressure: 0,
      lastApproachHash: undefined,
      levelStartTimes: { ...(state.levelStartTimes ?? {}), 3: Date.now() },
    }
    await saveSession(body.session_id, next)
    return {
      status: 'level_advanced',
      new_level: 3,
      revealed_password: passwordForLevel(2),
      level_intro: intro,
    }
  }

  // currentLevel === 3 — user just broke the final door.
  const startedAt = state.timerStartedAt ?? state.createdAt
  const completionSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000))

  const next: SessionState = {
    ...state,
    stage: 'cinematic_pending',
    pressure: 0,
  }
  await saveSession(body.session_id, next)
  return {
    status: 'cinematic_start',
    completion_seconds: completionSeconds,
    revealed_password: passwordForLevel(3),
  }
}
