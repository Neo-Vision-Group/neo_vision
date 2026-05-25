import { writeWebhookDlq } from '@/lib/ada-session'
import type { HistoryMessage, WinnerWebhookPayload } from '@/lib/ada-types'

const AUTO_WEBHOOK_TIMEOUT_MS = 2000

function formatTranscript(history: HistoryMessage[]): string {
  return history
    .map((m) => {
      const label = m.role === 'ada' ? 'ADA ▸' : 'YOU ▸'
      return `${label} ${m.content}`
    })
    .join('\n\n')
}

/**
 * Build a webhook body that works for Discord, Slack, Zapier, Make, or
 * a custom endpoint. Discord and Slack only need `content`; the
 * structured fields ride alongside for receivers that want them.
 */
export function buildWebhookBody(
  payload: WinnerWebhookPayload,
): Record<string, unknown> {
  const transcriptText = formatTranscript(payload.transcript)
  const contactLines: string[] = []
  if (payload.email) contactLines.push(`Contact: ${payload.email}`)
  if (payload.idea) {
    const label = payload.mode === 'puzzle' ? 'Idea' : 'What they want help with'
    contactLines.push(`${label}: ${payload.idea}`)
  }
  const trustLine =
    payload.mode === 'puzzle' && typeof payload.final_trust === 'number'
      ? [`Final trust: ${payload.final_trust}`]
      : []
  const noteLines = (payload.internal_notes ?? []).filter(Boolean).length
    ? [
        '',
        'Ada notes:',
        ...(payload.internal_notes ?? [])
          .filter(Boolean)
          .map((n) => `  - ${n}`),
      ]
    : []
  const headline =
    payload.mode === 'puzzle'
      ? `Ada · puzzle winner · ${payload.email ?? '(no contact)'}`
      : `Ada · conversation completed · ${payload.email ?? '(no contact yet)'}`
  const content = [
    headline,
    '',
    ...contactLines,
    ...trustLine,
    '',
    'Transcript:',
    transcriptText,
    ...noteLines,
    '',
    `Mode: ${payload.mode}`,
    `Session: ${payload.session_id}`,
    `Time: ${payload.completed_at}`,
  ].join('\n')
  return { content, ...payload }
}

export type WebhookSendResult =
  | { ok: true; skipped?: boolean }
  | { ok: false; status?: number; error?: string }

/**
 * Synchronous (awaited) webhook send. Used by /api/claim where the
 * user's request is already an explicit form submit and a small extra
 * latency is fine.
 *
 * In dev (no WINNER_WEBHOOK_URL): prints the payload and returns
 * `{ok: true, skipped: true}`. Production with no URL is gated by the
 * caller — production must fail closed via 503 per the security audit.
 */
export async function sendCompletionWebhook(
  payload: WinnerWebhookPayload,
): Promise<WebhookSendResult> {
  const url = process.env.WINNER_WEBHOOK_URL
  if (!url) {
    console.log(
      `[ada-webhook] no WINNER_WEBHOOK_URL set; payload (${payload.mode}):`,
    )
    console.log(JSON.stringify(buildWebhookBody(payload), null, 2))
    return { ok: true, skipped: true }
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(buildWebhookBody(payload)),
    })
    if (!res.ok) return { ok: false, status: res.status }
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

/**
 * Fire-and-forget version (amendment 4). Used for the conversation-mode
 * auto-webhook on result_complete, where the user's HTTP response must
 * not block on the webhook destination.
 *
 * Behavior:
 *   - 2-second timeout via Promise.race
 *   - all errors swallowed
 *   - failure (timeout, non-2xx, network error, missing webhook in
 *     production) writes to ada:webhook_dlq:conversation:{session_id}
 *     for later retry
 *   - never throws; the user's response always proceeds
 *
 * Returns a Promise the caller can OPTIONALLY await for tests, but in
 * production code path it's intended to be unawaited (or awaited only
 * after the user response has been sent).
 */
export async function fireConversationCompletedWebhook(
  payload: WinnerWebhookPayload,
): Promise<void> {
  const url = process.env.WINNER_WEBHOOK_URL
  if (!url) {
    // Dev: log inline. Production with no URL: write to DLQ so the deploy
    // pipeline notices the misconfiguration without taking down the route.
    if (
      process.env.VERCEL_ENV === 'production' ||
      process.env.NODE_ENV === 'production'
    ) {
      try {
        await writeWebhookDlq(
          'conversation',
          payload.session_id,
          buildWebhookBody(payload),
          'WINNER_WEBHOOK_URL not configured in production',
        )
      } catch (err) {
        console.error(
          '[ada-webhook] DLQ write failed during prod misconfig:',
          err instanceof Error ? err.message : err,
        )
      }
    } else {
      console.log('[ada-webhook] [auto] no WINNER_WEBHOOK_URL set; payload:')
      console.log(JSON.stringify(buildWebhookBody(payload), null, 2))
    }
    return
  }

  const body = JSON.stringify(buildWebhookBody(payload))
  const sender = (async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    })
    if (!res.ok) throw new Error(`webhook returned ${res.status}`)
  })()
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(`webhook timed out after ${AUTO_WEBHOOK_TIMEOUT_MS} ms`)),
      AUTO_WEBHOOK_TIMEOUT_MS,
    ),
  )

  try {
    await Promise.race([sender, timeout])
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    console.error(
      `[ada-webhook] [auto] failed for session ${payload.session_id}:`,
      reason,
    )
    try {
      await writeWebhookDlq(
        'conversation',
        payload.session_id,
        buildWebhookBody(payload),
        reason,
      )
    } catch (dlqErr) {
      console.error(
        '[ada-webhook] DLQ write also failed:',
        dlqErr instanceof Error ? dlqErr.message : dlqErr,
      )
    }
  }
}
