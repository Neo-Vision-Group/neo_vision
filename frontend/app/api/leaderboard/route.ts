/**
 * /api/leaderboard — public read of today + all-time top 10/100, plus
 * total players + winners + last-winner timestamp. No auth, no rate
 * limit (cheap Redis read). Cache-Control: no-store so the page always
 * shows fresh state.
 */

import { readLeaderboard } from '@/lib/ada-session'
import type { LeaderboardResponseBody } from '@/lib/ada-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function isProduction(): boolean {
  return (
    process.env.VERCEL_ENV === 'production' ||
    process.env.NODE_ENV === 'production'
  )
}

function corsHeaders(req: Request): Record<string, string> {
  const origin = isProduction()
    ? 'https://neovision.dev'
    : req.headers.get('origin') || '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    Vary: 'Origin',
    'Cache-Control': 'no-store',
  }
}

export async function OPTIONS(req: Request): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders(req) })
}

export async function GET(req: Request): Promise<Response> {
  const headers = corsHeaders(req)
  try {
    const snapshot = await readLeaderboard()
    const body: LeaderboardResponseBody = {
      today: snapshot.today.map((e, i) => ({
        handle: e.handle,
        score_seconds: e.score_seconds,
        ts: i, // placeholder — score is the actual ordering key
      })),
      all_time: snapshot.all_time.map((e, i) => ({
        handle: e.handle,
        score_seconds: e.score_seconds,
        ts: i,
      })),
      total_players: snapshot.total_players,
      total_winners: snapshot.total_winners,
      last_winner_at: snapshot.last_winner_at,
    }
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[leaderboard] read failed:', err)
    return new Response(JSON.stringify({ error: 'leaderboard_unavailable' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }
}
