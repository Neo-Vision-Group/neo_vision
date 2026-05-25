/**
 * /api/og?handle=...&time=...&rank=... — generates the PNG completion
 * artifact via Next's `next/og` ImageResponse.
 *
 * Edge runtime so the response streams without booting a Node process.
 * Params are passed in the query string (no Redis lookup) so the URL is
 * shareable, cacheable, and survives session-TTL expiration.
 *
 * Output: 1200×630 PNG (OG-image dimensions). Brand: black background,
 * orange "1 → 10", handle + completion time + rank below.
 */

import { ImageResponse } from 'next/og'

export const runtime = 'edge'

function fmtTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const handle = url.searchParams.get('handle') || 'anon'
  const timeRaw = parseInt(url.searchParams.get('time') ?? '0', 10)
  const rankRaw = parseInt(url.searchParams.get('rank') ?? '0', 10)
  const completionSeconds = Number.isFinite(timeRaw) ? timeRaw : 0
  const rankToday = Number.isFinite(rankRaw) ? rankRaw : 0

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0A0A08',
          color: '#FF500A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: 64,
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: '0.32em',
            color: 'rgba(245, 243, 238, 0.55)',
            marginBottom: 32,
          }}
        >
          NEO VISION
        </div>
        <div
          style={{
            fontSize: 144,
            fontWeight: 700,
            color: '#FF500A',
            lineHeight: 1,
            letterSpacing: '0.04em',
          }}
        >
          1 → 10
        </div>
        <div
          style={{
            fontSize: 48,
            color: '#F5F3EE',
            marginTop: 56,
            letterSpacing: '0.04em',
          }}
        >
          {handle}
        </div>
        <div
          style={{
            fontSize: 36,
            color: 'rgba(245, 243, 238, 0.7)',
            marginTop: 24,
          }}
        >
          completed in {fmtTime(completionSeconds)}
        </div>
        <div
          style={{
            fontSize: 24,
            color: 'rgba(245, 243, 238, 0.5)',
            marginTop: 16,
          }}
        >
          rank #{rankToday} today
        </div>
        <div
          style={{
            fontSize: 20,
            color: 'rgba(245, 243, 238, 0.4)',
            marginTop: 56,
          }}
        >
          neovision.dev/terminal
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
