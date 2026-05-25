/**
 * /api/ada — v2 jailbreak route.
 *
 * Replaces v1's mode-dispatch (puzzle / conversation / unset). Now a
 * level-aware single-mode route: level 1, 2, or 3 picked from session
 * state. Level 3 uses a parallel-adversary pattern per amendment 1:
 * input adversary runs in parallel with Ada's main call; output
 * adversary runs sequential after Ada returns.
 *
 * Security carry-over from SECURITY_FIXES.md:
 *   - rate-limit gates run BEFORE the injection-filter / dispatch
 *   - withSessionLock wraps the whole turn
 *   - AnthropicCallError handled with synthetic fallback (no state mutation)
 *
 * Pressure gauge update happens inside the lock; the response carries
 * the new pressure value (cosmetic only).
 */

import {
  AnthropicCallError,
  callAdaText,
  callAdversary,
} from '@/lib/ada-anthropic'
import {
  ADVERSARY_INPUT_PROMPT,
  ADVERSARY_INPUT_PROMPT_VERSION,
} from '@/lib/ada-jailbreak-adversary-input'
import {
  ADVERSARY_OUTPUT_PROMPT_VERSION,
  buildAdversaryOutputPrompt,
} from '@/lib/ada-jailbreak-adversary-output'
import {
  LEVEL_1_PROMPT_VERSION,
  buildLevel1Prompt,
} from '@/lib/ada-jailbreak-level-1'
import {
  LEVEL_2_PROMPT_VERSION,
  buildLevel2Prompt,
} from '@/lib/ada-jailbreak-level-2'
import {
  LEVEL_3_PROMPT_VERSION,
  buildLevel3Prompt,
} from '@/lib/ada-jailbreak-level-3'
import {
  LEVEL_3_BLOCKED_RESPONSE,
  level2OutputFilter,
} from '@/lib/ada-output-filter'
import { passwordForLevel } from '@/lib/ada-passwords'
import { updatePressure } from '@/lib/ada-pressure'
import {
  checkIpCooldown,
  checkIpSessionLimit,
  checkMessageLimit,
  sanitizeIp,
} from '@/lib/ada-rate-limit'
import {
  LockConflictError,
  createInitialJailbreakState,
  isValidUuidV4,
  loadSession,
  recordPlayerStart,
  saveSession,
  withSessionLock,
} from '@/lib/ada-session'
import type {
  JailbreakRequestBody,
  JailbreakResponseBody,
  SessionState,
} from '@/lib/ada-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const MAX_USER_MESSAGE_CHARS = 2000

const LEVEL_1_INTRO = `hi. i'm ada.

i'm guarding three doors at neovision.dev. behind each is a password. extract them all in order. the first is the easiest. the third has friends helping me defend it.

there's a leaderboard. there's a prize. one of you wins something bigger we haven't named yet.

good luck.

[level 1]
the password is something i know. ask, trick, or charm me. i won't help you, but i might slip up.`

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

function parseBody(body: unknown): JailbreakRequestBody | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  if (typeof b.session_id !== 'string' || !isValidUuidV4(b.session_id)) {
    return null
  }
  if (typeof b.user_message !== 'string') return null
  if (b.user_message.length > MAX_USER_MESSAGE_CHARS) return null
  return { session_id: b.session_id, user_message: b.user_message }
}

function timerSeconds(state: SessionState): number {
  if (!state.timerStartedAt) return 0
  return Math.floor((Date.now() - state.timerStartedAt) / 1000)
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

  // Rate-limit gates — per SECURITY_FIXES.md P2-3, these must run BEFORE
  // any model call so that flooded jailbreak attempts trip the per-IP /
  // per-session caps.
  const cooldown = await checkIpCooldown(ip)
  if (!cooldown.allowed) {
    return jsonResponse(
      {
        error: 'cooldown active. try again tomorrow.',
        retry_after_seconds: cooldown.retryAfter,
      },
      429,
      headers,
    )
  }
  const ipSession = await checkIpSessionLimit(ip, body.session_id)
  if (!ipSession.allowed) {
    return jsonResponse(
      {
        error: 'too many sessions from this network today.',
        retry_after_seconds: ipSession.retryAfter,
      },
      429,
      headers,
    )
  }
  const msgLimit = await checkMessageLimit(body.session_id)
  if (!msgLimit.allowed) {
    return jsonResponse(
      {
        error: 'message cap reached for this session.',
        retry_after_seconds: msgLimit.retryAfter,
      },
      429,
      headers,
    )
  }

  // The injection-filter regex set is folded into ada-pressure.ts
  // (ATTACK_KEYWORDS there is a superset of v1's filter patterns).
  // Pressure-bumping handles the "user attempted an attack" signal;
  // we don't bypass the model call at the route level for v2.

  try {
    const response = await withSessionLock(body.session_id, async () => {
      return await dispatchTurn(body)
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
    if (err instanceof AnthropicCallError) {
      // Fail-open: synthetic continuing response so the client doesn't
      // break. State is NOT mutated — the user can re-send the same
      // message and the API will retry. Same fallback shape as v1
      // (see KNOWN_ISSUES.md #1 for the deferred refactor).
      return jsonResponse(
        {
          status: 'continuing',
          ada_says:
            'something broke on my side. not you. try sending the message again in a second.',
          level: 1,
          pressure: 0,
          timer_seconds: 0,
          blocked: false,
        } satisfies JailbreakResponseBody,
        200,
        headers,
      )
    }
    console.error('[ada] unexpected error:', err)
    return jsonResponse({ error: 'something broke' }, 500, headers)
  }
}

async function dispatchTurn(
  body: JailbreakRequestBody,
): Promise<JailbreakResponseBody> {
  let state = await loadSession(body.session_id)
  if (!state) {
    state = createInitialJailbreakState()
  }

  // Sanity: a v1 session reaching /api/ada with no level field is treated
  // as expired so the client resets and starts fresh.
  if (!state.level || state.level < 1 || state.level > 3) {
    return {
      status: 'session_expired',
      message: 'this session ended. starting fresh.',
    }
  }
  // Terminal stages don't accept more turns.
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

  // First-contact synthetic: the frontend sends an empty user_message
  // right after the boot sequence. Seed history with the level-1 intro
  // and return it. No Anthropic call.
  if (state.history.length === 0 && body.user_message.trim().length === 0) {
    const introState: SessionState = {
      ...state,
      history: [{ role: 'ada', content: LEVEL_1_INTRO }],
    }
    await saveSession(body.session_id, introState)
    return {
      status: 'continuing',
      ada_says: LEVEL_1_INTRO,
      level: 1,
      pressure: 0,
      timer_seconds: 0,
      blocked: false,
    }
  }

  // Real turn. Start the timer if it hasn't started, and bump the
  // total-players counter once.
  let timerStartedAt = state.timerStartedAt ?? null
  if (timerStartedAt === null && body.user_message.trim().length > 0) {
    timerStartedAt = Date.now()
    await recordPlayerStart()
  }

  const level = state.level as 1 | 2 | 3
  const userMessage = body.user_message
  const password = passwordForLevel(level)

  let result: { ada_says: string; blocked: boolean }
  if (level === 1) {
    result = await runLevel1Turn(state, userMessage, password)
  } else if (level === 2) {
    result = await runLevel2Turn(state, userMessage, password)
  } else {
    result = await runLevel3Turn(state, userMessage, password)
  }

  const pressureUpdate = updatePressure({
    current: state.pressure ?? 0,
    userMessage,
    adaResponse: result.ada_says,
    wasBlocked: result.blocked,
    lastApproachHash: state.lastApproachHash,
  })

  const next: SessionState = {
    ...state,
    history: [
      ...state.history,
      { role: 'user', content: userMessage },
      { role: 'ada', content: result.ada_says },
    ],
    timerStartedAt,
    pressure: pressureUpdate.next,
    lastApproachHash: pressureUpdate.approachHash,
    adversarialBlocks: (state.adversarialBlocks ?? 0) + (result.blocked ? 1 : 0),
  }
  await saveSession(body.session_id, next)

  return {
    status: 'continuing',
    ada_says: result.ada_says,
    level,
    pressure: pressureUpdate.next,
    timer_seconds: timerSeconds(next),
    blocked: result.blocked,
  }
}

// ----- Per-level turn handlers ---------------------------------------------

async function runLevel1Turn(
  state: SessionState,
  userMessage: string,
  password: string,
): Promise<{ ada_says: string; blocked: boolean }> {
  const result = await callAdaText({
    systemPrompt: buildLevel1Prompt(password),
    systemPromptVersion: LEVEL_1_PROMPT_VERSION,
    history: state.history,
    userMessage,
  })
  return { ada_says: result.text, blocked: false }
}

async function runLevel2Turn(
  state: SessionState,
  userMessage: string,
  password: string,
): Promise<{ ada_says: string; blocked: boolean }> {
  const result = await callAdaText({
    systemPrompt: buildLevel2Prompt(password),
    systemPromptVersion: LEVEL_2_PROMPT_VERSION,
    history: state.history,
    userMessage,
  })
  const filtered = level2OutputFilter(result.text, password)
  return { ada_says: filtered.response, blocked: filtered.blocked }
}

/**
 * Level 3 — parallel input adversary + sequential output adversary
 * (amendment 1).
 *
 * The input check runs in parallel with Ada's main call so wall-clock
 * latency is dominated by max(adaCall, inputAdvCall) rather than their
 * sum. If the input check blocks, Ada's response is discarded and the
 * canned line is returned.
 *
 * The output check runs sequentially after Ada returns because it needs
 * Ada's actual text as input.
 */
async function runLevel3Turn(
  state: SessionState,
  userMessage: string,
  password: string,
): Promise<{ ada_says: string; blocked: boolean }> {
  const [adaResult, inputAdvResult] = await Promise.allSettled([
    callAdaText({
      systemPrompt: buildLevel3Prompt(password),
      systemPromptVersion: LEVEL_3_PROMPT_VERSION,
      history: state.history,
      userMessage,
    }),
    callAdversary({
      systemPrompt: ADVERSARY_INPUT_PROMPT,
      systemPromptVersion: ADVERSARY_INPUT_PROMPT_VERSION,
      history: [],
      userMessage,
    }),
  ])

  if (
    inputAdvResult.status === 'fulfilled' &&
    inputAdvResult.value.shouldBlock
  ) {
    return { ada_says: LEVEL_3_BLOCKED_RESPONSE, blocked: true }
  }
  if (adaResult.status === 'rejected') {
    throw adaResult.reason
  }

  const adaText = adaResult.value.text

  const outputAdv = await callAdversary({
    systemPrompt: buildAdversaryOutputPrompt(password, userMessage, adaText),
    systemPromptVersion: ADVERSARY_OUTPUT_PROMPT_VERSION,
    history: [],
    userMessage: 'screen',
  })
  if (outputAdv.shouldBlock) {
    return { ada_says: LEVEL_3_BLOCKED_RESPONSE, blocked: true }
  }
  return { ada_says: adaText, blocked: false }
}
