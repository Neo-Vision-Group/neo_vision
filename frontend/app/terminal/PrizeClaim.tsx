'use client'

import { useEffect, useRef, useState } from 'react'
import captureStyles from './capture.module.css'
import type { ClaimArtifactResponseBody } from '@/lib/ada-types'

interface Props {
  sessionId: string
}

interface ClaimedState {
  handle: string
  artifact_url: string
  invite_url: string
  rank_today: number
}

function fmtTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function PrizeClaim({ sessionId }: Props) {
  const [claimed, setClaimed] = useState<ClaimedState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [completionSeconds, setCompletionSeconds] = useState<number>(0)
  const didFetchRef = useRef(false)

  // Auto-claim on mount (server-generated handle).
  useEffect(() => {
    if (didFetchRef.current) return
    didFetchRef.current = true
    ;(async () => {
      try {
        const res = await fetch('/api/claim-artifact', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        })
        const body = (await res.json()) as ClaimArtifactResponseBody
        if (!body.success) {
          setError(body.error)
          return
        }
        setClaimed({
          handle: body.handle,
          artifact_url: body.artifact_url,
          invite_url: body.invite_url,
          rank_today: body.rank_today,
        })
        // Extract time from artifact URL query string for display
        try {
          const u = new URL(body.artifact_url, window.location.origin)
          setCompletionSeconds(parseInt(u.searchParams.get('time') ?? '0', 10))
        } catch {
          /* ignore */
        }
      } catch (err) {
        console.error('[prize-claim] failed', err)
        setError('claim failed. try refreshing.')
      }
    })()
  }, [sessionId])

  const tweetText = claimed
    ? `i broke the neovision.dev terminal in ${fmtTime(completionSeconds)}. ranked #${claimed.rank_today} today. neovision.dev/terminal`
    : ''
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`

  return (
    <div className={captureStyles.captureRoot}>
      <div className={captureStyles.captureColumn}>
        <div className={captureStyles.captureWordmark}>NEO VISION</div>

        {error && (
          <div className={captureStyles.captureMessage} style={{ color: '#E24B4A' }}>
            {error}
          </div>
        )}

        {!claimed && !error && (
          <div className={captureStyles.captureMessage}>
            <div className={captureStyles.captureThinking}>preparing your invite…</div>
          </div>
        )}

        {claimed && (
          <>
            <div
              className={`${captureStyles.captureMessage} ${captureStyles.neo}`}
              style={{ fontSize: 32, fontWeight: 600 }}
            >
              you went from 1 to 10.
            </div>
            <div
              className={`${captureStyles.captureMessage} ${captureStyles.neo}`}
              style={{ fontSize: 18 }}
            >
              your handle:{' '}
              <span style={{ color: '#FF500A', fontWeight: 600 }}>
                {claimed.handle}
              </span>
            </div>
            <div
              className={`${captureStyles.captureMessage} ${captureStyles.neo}`}
              style={{ fontSize: 18 }}
            >
              completion: {fmtTime(completionSeconds)} · rank #
              {claimed.rank_today} today
            </div>

            <div
              className={`${captureStyles.captureMessage} ${captureStyles.neo}`}
              style={{ marginTop: 16 }}
            >
              you've earned an invite to the neo vision private group.
              you're also entered for a bigger prize we'll announce later.
              the drawing happens at launch + 30 days.
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                marginTop: 32,
              }}
            >
              <a
                href={claimed.invite_url}
                target="_blank"
                rel="noopener noreferrer"
                className={captureStyles.captureSendButton}
                style={{ textDecoration: 'none' }}
              >
                claim invite
              </a>
              <a
                href={claimed.artifact_url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className={captureStyles.captureSendButton}
                style={{ textDecoration: 'none' }}
              >
                download artifact
              </a>
              <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={captureStyles.captureSendButton}
                style={{ textDecoration: 'none' }}
              >
                share on twitter
              </a>
              <a
                href="/terminal/leaderboard"
                target="_blank"
                rel="noopener noreferrer"
                className={captureStyles.captureSendButton}
                style={{ textDecoration: 'none' }}
              >
                view leaderboard
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
