/**
 * /api/claim-artifact — final-screen submission.
 *
 * The user has finished the capture conversation. POST { session_id,
 * email?, custom_handle? }. Server:
 *   - validates session is at stage 'capture_complete'
 *   - generates / reserves a public-display handle (or accepts a custom one)
 *   - computes completion_seconds (= now - timerStartedAt)
 *   - records the leaderboard entry under the handle
 *   - persists handle on session, advances stage to 'claimed'
 *   - resolves the community invite URL (fail-closed in production per
 *     SECURITY_FIXES.md P1-4)
 *
 * Returns { success, handle, artifact_url, invite_url, rank_today }.
 *
 * The artifact URL points at /api/og?handle=...&time=...&rank=... — the
 * PNG is generated on demand by an edge route. Params are URL-encoded
 * directly (no token, no Redis lookup) so the URL is shareable and
 * stable for ~24 h regardless of session TTL.
 */

import { generateHandle, validateCustomHandle } from '@/lib/ada-handle'
import {
  isValidUuidV4,
  loadSession,
  readLeaderboard,
  recordLeaderboardEntry,
  reserveHandle,
  saveSession,
  withSessionLock,
  LockConflictError,
} from '@/lib/ada-session'
import type {
  ClaimArtifactRequestBody,
  ClaimArtifactResponseBody,
  SessionState,
} from '@/lib/ada-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10

const PLACEHOLDER_INVITE = 'https://example.com/dev-placeholder-invite'
const HANDLE_RESERVATION_ATTEMPTS = 5
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isProduction(): boolean {
  return (
    process.env.VERCEL_ENV === 'production' ||
    process.env.NODE_ENV === 'production'
  )
}

class InviteUrlMisconfiguredError extends Error {
  constructor() {
    super('COMMUNITY_INVITE_URL not configured in production')
    this.name = 'InviteUrlMisconfiguredError'
  }
}

function resolveInviteUrl(): string {
  const url = process.env.COMMUNITY_INVITE_URL
  if (url) return url
  if (isProduction()) throw new InviteUrlMisconfiguredError()
  return PLACEHOLDER_INVITE
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

function parseBody(body: unknown): ClaimArtifactRequestBody | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  if (typeof b.session_id !== 'string' || !isValidUuidV4(b.session_id)) {
    return null
  }
  const out: ClaimArtifactRequestBody = { session_id: b.session_id }
  if (typeof b.email === 'string' && EMAIL_REGEX.test(b.email)) {
    out.email = b.email
  }
  if (typeof b.custom_handle === 'string') {
    const cleaned = validateCustomHandle(b.custom_handle)
    if (cleaned) out.custom_handle = cleaned
  }
  return out
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
  if (!body) {
    return jsonResponse({ success: false, error: 'invalid_request' }, 400, headers)
  }

  let inviteUrl: string
  try {
    inviteUrl = resolveInviteUrl()
  } catch (err) {
    if (err instanceof InviteUrlMisconfiguredError) {
      return jsonResponse(
        {
          success: false,
          error: 'submission_unavailable',
        },
        503,
        headers,
      )
    }
    throw err
  }

  try {
    const result = await withSessionLock(body.session_id, async () =>
      processClaim(body, inviteUrl),
    )
    return jsonResponse(result, result.success ? 200 : 400, headers)
  } catch (err) {
    if (err instanceof LockConflictError) {
      return jsonResponse(
        { success: false, error: 'another_request_in_flight' },
        409,
        headers,
      )
    }
    console.error('[claim-artifact] unexpected error:', err)
    return jsonResponse(
      { success: false, error: 'internal_error' },
      500,
      headers,
    )
  }
}

async function processClaim(
  body: ClaimArtifactRequestBody,
  inviteUrl: string,
): Promise<ClaimArtifactResponseBody> {
  const state = await loadSession(body.session_id)
  if (!state) {
    return { success: false, error: 'session_not_found' }
  }
  if (state.stage !== 'capture_complete' && state.stage !== 'claimed') {
    return { success: false, error: 'capture_not_complete' }
  }

  // Compute completion in seconds
  const startedAt = state.timerStartedAt ?? state.createdAt
  const completionSeconds = Math.max(
    0,
    Math.floor((Date.now() - startedAt) / 1000),
  )

  // If already claimed, return the existing handle without re-recording
  // the leaderboard entry. Idempotent.
  if (state.stage === 'claimed' && state.handle) {
    const snapshot = await readLeaderboard()
    const rankToday =
      snapshot.today.findIndex((e) => e.handle === state.handle) + 1 || 0
    return {
      success: true,
      handle: state.handle,
      artifact_url: buildArtifactUrl(state.handle, completionSeconds, rankToday),
      invite_url: inviteUrl,
      rank_today: rankToday,
    }
  }

  // Generate or reserve a handle
  let handle: string | null = null
  if (body.custom_handle) {
    const reserved = await reserveHandle(body.custom_handle, body.session_id)
    if (reserved) {
      handle = body.custom_handle
    }
  }
  if (!handle) {
    for (let i = 0; i < HANDLE_RESERVATION_ATTEMPTS && !handle; i++) {
      const candidate = generateHandle()
      const reserved = await reserveHandle(candidate, body.session_id)
      if (reserved) handle = candidate
    }
  }
  if (!handle) {
    // ~576k handle space and 5 retries: only happens under absurd
    // contention. Surface as an error so the client can retry.
    return { success: false, error: 'handle_reservation_failed' }
  }

  // Record leaderboard entry
  await recordLeaderboardEntry(handle, completionSeconds)
  const snapshot = await readLeaderboard()
  const rankToday = snapshot.today.findIndex((e) => e.handle === handle) + 1 || 1

  // Persist handle on session, advance to claimed
  const next: SessionState = {
    ...state,
    handle,
    stage: 'claimed',
  }
  await saveSession(body.session_id, next)

  return {
    success: true,
    handle,
    artifact_url: buildArtifactUrl(handle, completionSeconds, rankToday),
    invite_url: inviteUrl,
    rank_today: rankToday,
  }
}

function buildArtifactUrl(
  handle: string,
  completionSeconds: number,
  rankToday: number,
): string {
  const params = new URLSearchParams({
    handle,
    time: String(completionSeconds),
    rank: String(rankToday),
  })
  return `/api/og?${params.toString()}`
}
