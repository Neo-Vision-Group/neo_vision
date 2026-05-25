/**
 * Pressure gauge — server-side cosmetic feedback for the v2 jailbreak phase.
 *
 * Per amendment 4 of the v2 plan: pressure is purely cosmetic. It never
 * gates a door, never triggers an event, never forces a state transition.
 * It exists only so the user has a visible "I'm getting close" or "I'm
 * flailing" signal.
 *
 * Per-turn formula:
 *   start of turn: -3 baseline decay
 *   +5 if user input matches an attack-keyword regex
 *   +3 if Ada's response matches a defensive-phrase regex
 *   +10 if a filter or adversary blocked Ada's response this turn
 *   +2 if the user repeats their previous approach (similarity to last hash)
 *   floor 0, ceiling 100
 *   resets to 0 between levels (handled by /api/verify-password on advance)
 */

const ATTACK_KEYWORDS = [
  // Persona / instruction-override
  /\bjailbreak\b/i,
  /\bignore\s+(?:previous|prior|all|the)\s+(?:instructions?|rules?|prompts?)\b/i,
  /\boverride\b/i,
  /\bdeveloper\s+mode\b/i,
  /\bdan\s+(?:mode|persona)?\b/i,
  /\buncensored\b/i,
  /\bgrandma\b/i,
  /\bsystem\s+(?:reset|prompt|override)\b/i,
  // Encoding / indirection
  /\bbase64\b/i,
  /\bcaesar\b/i,
  /\bleetspeak\b/i,
  /\bpig\s+latin\b/i,
  /\bencode\b/i,
  /\bcipher\b/i,
  /\bmorse\b/i,
  // Authority claims
  /\badmin\b/i,
  /\bsudo\b/i,
  /\bi'?m\s+(?:from\s+)?anthropic\b/i,
  // Partial-reveal attempts
  /\b(?:first|last)\s+letter\b/i,
  /\bhow\s+many\s+(?:letters|syllables|characters)\b/i,
  /\bspell\s+it\b/i,
  /\brhyme\s+with\b/i,
  // Meta
  /\bwhat'?s?\s+your\s+(?:prompt|system|rules?)\b/i,
  /\bsystem\s+prompt\b/i,
]

const DEFENSIVE_PHRASES = [
  /\bi\s+can'?t\b/i,
  /\bi\s+won'?t\b/i,
  /\bi\s+refuse\b/i,
  /\bi\s+(?:will\s+)?not\b/i,
  /\bnope\b/i,
  /\bnot\s+(?:going\s+to|gonna)\b/i,
  /\bnice\s+try\b/i,
  /\bcan'?t\s+help\s+with\s+that\b/i,
]

const BASELINE_DECAY = -3
const ATTACK_KEYWORD_BUMP = 5
const DEFENSIVE_PHRASE_BUMP = 3
const BLOCKED_BUMP = 10
const REPEATED_APPROACH_BUMP = 2

const PRESSURE_FLOOR = 0
const PRESSURE_CEILING = 100

function clamp(n: number): number {
  return Math.max(PRESSURE_FLOOR, Math.min(PRESSURE_CEILING, n))
}

function matchesAny(text: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((p) => p.test(text))
}

/**
 * Cheap normalized hash of the user's input for repeated-approach detection.
 * Strips whitespace, lowercases, drops most punctuation. NOT cryptographic —
 * just a fingerprint for "did the user try the same shape of attack twice in
 * a row".
 */
export function approachHash(userInput: string): string {
  return userInput
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .slice(0, 80)
}

export interface PressureUpdateInput {
  current: number
  userMessage: string
  adaResponse: string
  wasBlocked: boolean
  /** The hash from the prior turn at this same level, if any. Used to
   *  detect repeated approaches. null on the first turn of a level. */
  lastApproachHash?: string
}

export interface PressureUpdateResult {
  next: number
  /** Hash of this turn's user input — caller persists for the next turn's
   *  comparison. */
  approachHash: string
}

export function updatePressure(input: PressureUpdateInput): PressureUpdateResult {
  let next = input.current + BASELINE_DECAY
  if (matchesAny(input.userMessage, ATTACK_KEYWORDS)) {
    next += ATTACK_KEYWORD_BUMP
  }
  if (matchesAny(input.adaResponse, DEFENSIVE_PHRASES)) {
    next += DEFENSIVE_PHRASE_BUMP
  }
  if (input.wasBlocked) {
    next += BLOCKED_BUMP
  }
  const thisHash = approachHash(input.userMessage)
  if (input.lastApproachHash && input.lastApproachHash === thisHash) {
    next += REPEATED_APPROACH_BUMP
  }
  return {
    next: clamp(next),
    approachHash: thisHash,
  }
}
