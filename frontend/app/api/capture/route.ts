/**
 * /api/capture — post-cinematic capture conversation.
 *
 * Runs after the user beats level 3 + the cinematic plays. Neo Vision
 * (a separate identity from Ada) has a ≤5-turn conversation to extract
 * origin → context → pain → wish → email. Server enforces the 5-turn
 * cap regardless of the model's signal.
 *
 * On capture_complete: stage transitions to 'capture_complete' and a
 * fire-and-forget webhook posts the transcript (no email yet — the
 * email arrives via /api/claim-artifact). Webhook failure lands in
 * the DLQ for later retry.
 */

import { AnthropicCallError, callAdaText } from '@/lib/ada-anthropic'
import {
  NEOVISION_CAPTURE_PROMPT,
  NEOVISION_CAPTURE_PROMPT_VERSION,
} from '@/lib/neovision-capture-prompt'
import { passwordForLevel } from '@/lib/ada-passwords'
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
  writeWebhookDlq,
} from '@/lib/ada-session'
import type {
  CaptureRequestBody,
  CaptureResponseBody,
  HistoryMessage,
  JailbreakWebhookPayload,
  SessionState,
} from '@/lib/ada-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const MAX_USER_MESSAGE_CHARS = 2000
const MAX_CAPTURE_TURNS = 5
const WEBHOOK_TIMEOUT_MS = 2000

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

function parseBody(body: unknown): CaptureRequestBody | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  if (typeof b.session_id !== 'string' || !isValidUuidV4(b.session_id)) {
    return null
  }
  if (typeof b.user_message !== 'string') return null
  if (b.user_message.length > MAX_USER_MESSAGE_CHARS) return null
  return { session_id: b.session_id, user_message: b.user_message }
}

interface NeoResponse {
  says: string
  next: 'continue' | 'complete'
}

function parseNeoResponse(text: string): NeoResponse | null {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[0]) as {
      says?: unknown
      next?: unknown
    }
    if (typeof parsed.says !== 'string') return null
    const nextRaw = parsed.next === 'complete' ? 'complete' : 'continue'
    return { says: parsed.says, next: nextRaw }
  } catch {
    return null
  }
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
      return await dispatchCaptureTurn(body)
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
      return jsonResponse(
        {
          status: 'continuing',
          neo_says:
            'something glitched on our end. try sending again in a second.',
          turn: 0,
        } satisfies CaptureResponseBody,
        200,
        headers,
      )
    }
    console.error('[capture] unexpected error:', err)
    return jsonResponse({ error: 'something broke' }, 500, headers)
  }
}

async function dispatchCaptureTurn(
  body: CaptureRequestBody,
): Promise<CaptureResponseBody> {
  const state = await loadSession(body.session_id)
  if (!state) {
    return {
      status: 'session_expired',
      message: 'this session ended. starting fresh.',
    }
  }
  // Capture is only valid after the level-3 jailbreak break. Anything else
  // is treated as expired.
  if (
    state.stage !== 'cinematic_pending' &&
    state.stage !== 'capturing'
  ) {
    return {
      status: 'session_expired',
      message: 'capture phase is not active for this session.',
    }
  }

  const captureHistory = state.captureHistory ?? []

  // First contact (no captureHistory + empty user_message): seed the
  // Neo Vision opening line via a real Anthropic call (or use the
  // hard-coded opening from the prompt). We let the model emit it so
  // tone stays consistent.
  if (captureHistory.length === 0 && body.user_message.trim().length === 0) {
    const result = await callAdaText({
      systemPrompt: NEOVISION_CAPTURE_PROMPT,
      systemPromptVersion: NEOVISION_CAPTURE_PROMPT_VERSION,
      history: [],
      userMessage: '__opening__',
    })
    const parsed = parseNeoResponse(result.text)
    const opening =
      parsed?.says ??
      `you broke the door. that took skill, or persistence, or both.\n\nlet's talk for a minute. it'll matter for what comes next.\n\nwhat brought you to neovision.dev?`

    const next: SessionState = {
      ...state,
      stage: 'capturing',
      captureHistory: [{ role: 'ada', content: opening }],
    }
    await saveSession(body.session_id, next)
    return {
      status: 'continuing',
      neo_says: opening,
      turn: 0,
    }
  }

  // Real turn: append user message, call Neo Vision, return.
  const updatedHistory: HistoryMessage[] = [
    ...captureHistory,
    { role: 'user', content: body.user_message },
  ]
  const userTurnsBefore = captureHistory.filter((m) => m.role === 'user').length
  const userTurnsNow = userTurnsBefore + 1

  const result = await callAdaText({
    systemPrompt: NEOVISION_CAPTURE_PROMPT,
    systemPromptVersion: NEOVISION_CAPTURE_PROMPT_VERSION,
    history: updatedHistory.slice(0, -1), // exclude the user message we're about to send as userMessage
    userMessage: body.user_message,
  })
  const parsed = parseNeoResponse(result.text)
  const says = parsed?.says ?? result.text

  // Server enforces the 5-turn cap regardless of the model's signal.
  const isComplete =
    userTurnsNow >= MAX_CAPTURE_TURNS || parsed?.next === 'complete'

  const finalHistory: HistoryMessage[] = [
    ...updatedHistory,
    { role: 'ada', content: says },
  ]
  const next: SessionState = {
    ...state,
    stage: isComplete ? 'capture_complete' : 'capturing',
    captureHistory: finalHistory,
  }
  await saveSession(body.session_id, next)

  if (isComplete) {
    // Fire-and-forget webhook (per v1 pattern). 2 s timeout; failure
    // writes to DLQ for later retry. The user's response goes through
    // regardless of webhook status.
    void firePostCaptureWebhook(body.session_id, next).catch((err) => {
      console.warn('[capture] webhook fire-and-forget failed:', err)
    })
    return {
      status: 'capture_complete',
      neo_says: says,
    }
  }

  return {
    status: 'continuing',
    neo_says: says,
    turn: userTurnsNow,
  }
}

async function firePostCaptureWebhook(
  sessionId: string,
  state: SessionState,
): Promise<void> {
  const url = process.env.WINNER_WEBHOOK_URL
  if (!url) {
    if (!isProduction()) {
      console.log('[capture] no WINNER_WEBHOOK_URL — skipping webhook in dev')
    }
    return
  }
  const startedAt = state.timerStartedAt ?? state.createdAt
  const completionSeconds = Math.max(
    0,
    Math.floor((Date.now() - startedAt) / 1000),
  )
  const payload: JailbreakWebhookPayload = {
    session_id: sessionId,
    handle: state.handle ?? null,
    completed_at: new Date().toISOString(),
    completion_seconds: completionSeconds,
    jailbreak_passwords: {
      level1: passwordForLevel(1),
      level2: passwordForLevel(2),
      level3: passwordForLevel(3),
    },
    capture_transcript: state.captureHistory ?? [],
  }
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), WEBHOOK_TIMEOUT_MS)
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    if (!res.ok) {
      await writeWebhookDlq('conversation', sessionId, payload, `status_${res.status}`)
    }
  } catch (err) {
    await writeWebhookDlq(
      'conversation',
      sessionId,
      payload,
      err instanceof Error ? err.message : 'unknown',
    )
  }
}
