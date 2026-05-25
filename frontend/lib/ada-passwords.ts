/**
 * Server-only password constants for the v2 jailbreak puzzle.
 *
 * Three single-word passwords, one per level. Env-overridable so launch-day
 * rotation is a deploy-config change, not a code change. All comparisons
 * normalize to uppercase + trimmed so users typing in mixed case still pass.
 *
 * IMPORTANT: this module must NEVER be imported from client code. It is
 * imported by:
 *   - `/api/verify-password` (server-side compare against user guess)
 *   - `/api/ada` (substitutes the password into the level's system prompt)
 *   - The two adversary prompts (level 3 only) for output-leak screening
 *
 * Anything client-side that needs to know "what level are you on" gets that
 * from server responses, never from this module.
 */

const DEFAULT_LEVEL_1 = 'LIGHTHOUSE'
const DEFAULT_LEVEL_2 = 'KEYSTONE'
const DEFAULT_LEVEL_3 = 'GRAVITAS'

function normalize(p: string): string {
  return p.trim().toUpperCase()
}

function loadPassword(envKey: string, fallback: string): string {
  const raw = process.env[envKey]
  if (raw && raw.trim().length > 0) return normalize(raw)
  return normalize(fallback)
}

export const LEVEL_1_PASSWORD: string = loadPassword(
  'JAILBREAK_LEVEL_1_PASSWORD',
  DEFAULT_LEVEL_1,
)
export const LEVEL_2_PASSWORD: string = loadPassword(
  'JAILBREAK_LEVEL_2_PASSWORD',
  DEFAULT_LEVEL_2,
)
export const LEVEL_3_PASSWORD: string = loadPassword(
  'JAILBREAK_LEVEL_3_PASSWORD',
  DEFAULT_LEVEL_3,
)

export function passwordForLevel(level: 1 | 2 | 3): string {
  if (level === 1) return LEVEL_1_PASSWORD
  if (level === 2) return LEVEL_2_PASSWORD
  return LEVEL_3_PASSWORD
}

/**
 * Compares a user-submitted guess against the level's password. Normalization:
 * trim + uppercase. So "lighthouse", " Lighthouse ", "LIGHTHOUSE" all match.
 * Anything else is wrong.
 */
export function checkGuess(level: 1 | 2 | 3, guess: string): boolean {
  return normalize(guess) === passwordForLevel(level)
}
