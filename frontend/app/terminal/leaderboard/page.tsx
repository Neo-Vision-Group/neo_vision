'use client'

import { useEffect, useState } from 'react'
import type { LeaderboardResponseBody } from '@/lib/ada-types'

function fmtTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function fmtRelative(ts: number | null): string {
  if (!ts) return 'no winners yet today'
  const elapsed = Math.floor((Date.now() - ts) / 1000)
  if (elapsed < 60) return `${elapsed} s ago`
  if (elapsed < 3600) return `${Math.floor(elapsed / 60)} min ago`
  if (elapsed < 86400) return `${Math.floor(elapsed / 3600)} h ago`
  return `${Math.floor(elapsed / 86400)} d ago`
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponseBody | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/leaderboard', { cache: 'no-store' })
        if (!res.ok) throw new Error(`status ${res.status}`)
        const body = (await res.json()) as LeaderboardResponseBody
        if (!cancelled) setData(body)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'unknown')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A08',
        color: '#F5F3EE',
        fontFamily:
          'var(--ada-display), "Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif',
        padding: '60px 32px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: 720 }}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'rgba(245, 243, 238, 0.5)',
            marginBottom: 24,
          }}
        >
          NEO VISION · LEADERBOARD
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 600, marginBottom: 24 }}>
          who broke the door, and how fast
        </h1>

        {error && (
          <div style={{ color: '#E24B4A', marginBottom: 16 }}>
            leaderboard unavailable: {error}
          </div>
        )}

        {data && (
          <>
            <div
              style={{
                display: 'flex',
                gap: 32,
                color: 'rgba(245, 243, 238, 0.7)',
                fontSize: 14,
                marginBottom: 32,
              }}
            >
              <div>{data.total_players} total players</div>
              <div>{data.total_winners} total winners</div>
              <div>last broke {fmtRelative(data.last_winner_at)}</div>
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>
              today's top 10
            </h2>
            <ol
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 48px 0',
                fontFamily:
                  'var(--ada-plex), "IBM Plex Mono", ui-monospace, monospace',
              }}
            >
              {data.today.length === 0 && (
                <li style={{ color: 'rgba(245, 243, 238, 0.4)' }}>
                  no breaks today yet. be the first.
                </li>
              )}
              {data.today.map((e, i) => (
                <li
                  key={e.handle}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(245, 243, 238, 0.08)',
                    fontSize: 16,
                  }}
                >
                  <span>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 32,
                        color: 'rgba(245, 243, 238, 0.4)',
                      }}
                    >
                      {i + 1}.
                    </span>
                    {e.handle}
                  </span>
                  <span style={{ color: '#FF500A' }}>
                    {fmtTime(e.score_seconds)}
                  </span>
                </li>
              ))}
            </ol>

            <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>
              all-time top 100
            </h2>
            <ol
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                fontFamily:
                  'var(--ada-plex), "IBM Plex Mono", ui-monospace, monospace',
              }}
            >
              {data.all_time.length === 0 && (
                <li style={{ color: 'rgba(245, 243, 238, 0.4)' }}>
                  no all-time entries yet.
                </li>
              )}
              {data.all_time.map((e, i) => (
                <li
                  key={`${e.handle}-all`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(245, 243, 238, 0.05)',
                    fontSize: 14,
                  }}
                >
                  <span>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 36,
                        color: 'rgba(245, 243, 238, 0.4)',
                      }}
                    >
                      {i + 1}.
                    </span>
                    {e.handle}
                  </span>
                  <span style={{ color: 'rgba(255, 80, 10, 0.8)' }}>
                    {fmtTime(e.score_seconds)}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}

        <div
          style={{
            marginTop: 64,
            color: 'rgba(245, 243, 238, 0.4)',
            fontSize: 13,
          }}
        >
          today resets at midnight UTC. handles are auto-generated unless
          claimed with a custom one.
          <br />
          <a
            href="/terminal"
            style={{ color: '#FF500A', marginTop: 8, display: 'inline-block' }}
          >
            ← back to terminal
          </a>
        </div>
      </div>
    </div>
  )
}
