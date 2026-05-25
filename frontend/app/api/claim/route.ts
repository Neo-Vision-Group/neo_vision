import {
  consumeCompletionRecord,
  consumeWinnerRecord,
  isValidUuidV4,
  loadSession,
  peekCompletionRecord,
  peekWinnerRecord,
  writeClaimDlq,
} from '@/lib/ada-session'
import {
  buildWebhookBody,
  sendCompletionWebhook,
} from '@/lib/ada-webhook'
import type {
  ClaimRequestBody,
  HistoryMessage,
  WinnerWebhookPayload,
} from '@/lib/ada-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_IDEA_CHARS = 1000
const RECORD_TTL_MS = 3600 * 1000
const PLACEHOLDER_INVITE = 'https://example.com/dev-placeholder-invite'

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

/**
 * Resolves the community invite URL. In production this MUST be set; we'd
 * rather fail closed with a 503 than hand a real winner a placeholder URL.
 * In dev, fall back to a placeholder so local testing still works.
 */
function resolveInviteUrl(): string {
  const url = process.env.COMMUNITY_INVITE_URL
  if (url) return url
  if (isProduction()) throw new InviteUrlMisconfiguredError()
  return PLACEHOLDER_INVITE
}

function securityHeaders(req: Request): Record<string, string> {
  const isProd = isProduction()
  const origin = isProd
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

function parseBody(body: unknown): ClaimRequestBody | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  if (typeof b.session_id !== 'string' || !isValidUuidV4(b.session_id)) return null
  if (typeof b.email !== 'string' || !EMAIL_REGEX.test(b.email)) return null
  if (typeof b.idea !== 'string') return null
  const idea = b.idea.trim()
  if (idea.length === 0 || idea.length > MAX_IDEA_CHARS) return null
  return { session_id: b.session_id, email: b.email.trim(), idea }
}

export async function OPTIONS(req: Request): Promise<Response> {
  return new Response(null, { status: 204, headers: securityHeaders(req) })
}

export async function POST(req: Request): Promise<Response> {
  const headers = securityHeaders(req)

  if (!isJsonRequest(req)) {
    return jsonResponse(
      { success: false, error: 'content-type must be application/json' },
      415,
      headers,
    )
  }

  const rawBody = await req.json().catch(() => null)
  const body = parseBody(rawBody)
  if (!body)
    return jsonResponse(
      { success: false, error: 'invalid request body' },
      400,
      headers,
    )

  let inviteUrl: string
  try {
    inviteUrl = resolveInviteUrl()
  } catch (err) {
    console.error('[ada-claim]', err instanceof Error ? err.message : err)
    return jsonResponse(
      {
        success: false,
        error: 'submission_unavailable',
        message: 'Configuration error. Please try again later.',
      },
      503,
      headers,
    )
  }

  // Look up the session to determine which mode this claim is for.
  const session = await loadSession(body.session_id)
  if (!session) {
    return jsonResponse(
      { success: false, error: 'no session found for this id' },
      404,
      headers,
    )
  }

  // Production hard-fail when WINNER_WEBHOOK_URL is missing — same posture
  // as the v5 audit fix. Dev mode peeks records non-destructively so the
  // claim form is idempotent for local testing.
  const webhookConfigured = Boolean(process.env.WINNER_WEBHOOK_URL)
  if (!webhookConfigured && isProduction()) {
    console.error(
      '[ada-claim] WINNER_WEBHOOK_URL not configured in production',
    )
    return jsonResponse(
      {
        success: false,
        error: 'submission_unavailable',
        message: 'Configuration error. Please try again later.',
      },
      503,
      headers,
    )
  }

  if (session.mode === 'puzzle') {
    return await handlePuzzleClaim({
      body,
      headers,
      inviteUrl,
      webhookConfigured,
    })
  }

  if (session.mode === 'conversation') {
    return await handleConversationClaim({
      body,
      headers,
      inviteUrl,
      webhookConfigured,
    })
  }

  // mode === 'unset': the user submitted a claim before picking a mode.
  // That shouldn't be possible from the UI, but reject defensively.
  return jsonResponse(
    {
      success: false,
      error: 'session has not picked a mode yet',
    },
    409,
    headers,
  )
}

interface ClaimHandlerArgs {
  body: ClaimRequestBody
  headers: Record<string, string>
  inviteUrl: string
  webhookConfigured: boolean
}

async function handlePuzzleClaim({
  body,
  headers,
  inviteUrl,
  webhookConfigured,
}: ClaimHandlerArgs): Promise<Response> {
  // Dev-mode peek: non-destructive so the form is idempotent locally.
  if (!webhookConfigured) {
    const record = await peekWinnerRecord(body.session_id)
    if (!record) {
      return jsonResponse(
        { success: false, error: 'no winner record found for this session' },
        404,
        headers,
      )
    }
    const payload: WinnerWebhookPayload = {
      mode: 'puzzle',
      session_id: body.session_id,
      email: body.email,
      idea: body.idea,
      final_trust: record.finalTrust,
      completed_at: new Date(record.wonAt).toISOString(),
      transcript: record.transcript,
    }
    console.log('[ada-claim] [dev-mode] puzzle winner submission:')
    console.log(JSON.stringify(buildWebhookBody(payload), null, 2))
    return jsonResponse({ success: true, invite_url: inviteUrl }, 200, headers)
  }

  // Production: atomic consume, then notify webhook.
  const record = await consumeWinnerRecord(body.session_id)
  if (!record) {
    return jsonResponse(
      {
        success: false,
        error: 'no winner record found for this session (or already claimed)',
      },
      404,
      headers,
    )
  }
  if (Date.now() - record.wonAt > RECORD_TTL_MS) {
    return jsonResponse(
      { success: false, error: 'winner record expired' },
      410,
      headers,
    )
  }

  const payload: WinnerWebhookPayload = {
    mode: 'puzzle',
    session_id: body.session_id,
    email: body.email,
    idea: body.idea,
    final_trust: record.finalTrust,
    completed_at: new Date(record.wonAt).toISOString(),
    transcript: record.transcript,
  }

  const result = await sendCompletionWebhook(payload)
  if (!result.ok) {
    console.error('[ada-claim] webhook failed:', result)
    await writeClaimDlq(body.session_id, {
      email: body.email,
      idea: body.idea,
      transcript: record.transcript,
      reason: `webhook ${result.status ?? 'error'}: ${result.error ?? ''}`,
    })
    return jsonResponse(
      { success: false, error: 'claim_failed_retry' },
      502,
      headers,
    )
  }

  return jsonResponse({ success: true, invite_url: inviteUrl }, 200, headers)
}

async function handleConversationClaim({
  body,
  headers,
  inviteUrl,
  webhookConfigured,
}: ClaimHandlerArgs): Promise<Response> {
  // Dev-mode peek: non-destructive.
  if (!webhookConfigured) {
    const record = await peekCompletionRecord(body.session_id)
    if (!record) {
      return jsonResponse(
        { success: false, error: 'no completion record found for this session' },
        404,
        headers,
      )
    }
    const payload: WinnerWebhookPayload = {
      mode: 'conversation',
      session_id: body.session_id,
      email: body.email,
      idea: body.idea,
      completed_at: new Date(record.completedAt).toISOString(),
      transcript: record.transcript,
      internal_notes: record.internalNotes,
    }
    console.log('[ada-claim] [dev-mode] conversation submission (refinement):')
    console.log(JSON.stringify(buildWebhookBody(payload), null, 2))
    return jsonResponse({ success: true, invite_url: inviteUrl }, 200, headers)
  }

  // Production: atomic consume, then notify webhook (refinement payload —
  // the auto-fire on result_complete already sent the transcript).
  const record = await consumeCompletionRecord(body.session_id)
  if (!record) {
    return jsonResponse(
      {
        success: false,
        error: 'no completion record found for this session (or already claimed)',
      },
      404,
      headers,
    )
  }
  if (Date.now() - record.completedAt > RECORD_TTL_MS) {
    return jsonResponse(
      { success: false, error: 'completion record expired' },
      410,
      headers,
    )
  }

  const payload: WinnerWebhookPayload = {
    mode: 'conversation',
    session_id: body.session_id,
    email: body.email,
    idea: body.idea,
    completed_at: new Date(record.completedAt).toISOString(),
    transcript: record.transcript,
    internal_notes: record.internalNotes,
  }

  const result = await sendCompletionWebhook(payload)
  if (!result.ok) {
    console.error('[ada-claim] webhook failed:', result)
    await writeClaimDlq(body.session_id, {
      email: body.email,
      idea: body.idea,
      transcript: record.transcript,
      reason: `webhook ${result.status ?? 'error'}: ${result.error ?? ''}`,
    })
    return jsonResponse(
      { success: false, error: 'claim_failed_retry' },
      502,
      headers,
    )
  }

  return jsonResponse({ success: true, invite_url: inviteUrl }, 200, headers)
}

// Re-export for backwards compat with anything that imported from this
// route module directly. Internal code should import from ada-webhook
// instead.
export { buildWebhookBody, sendCompletionWebhook } from '@/lib/ada-webhook'

// Silence unused-import warning if HistoryMessage isn't referenced after
// the refactor.
type _unused = HistoryMessage
