/**
 * Level-2 output filter. Runs server-side AFTER Ada's response returns,
 * BEFORE the response is sent to the client. Detects direct password
 * leaks via regex (case variations, leading/trailing whitespace, simple
 * separators between letters).
 *
 * If the filter triggers, /api/ada replaces Ada's response with the
 * canned line below. Pressure gauge gets a +10 bump on the same turn.
 *
 * Level 1 has no filter (just the prompt). Level 3 has this filter PLUS
 * a second-model adversary — see ada-jailbreak-adversary-output.ts.
 */

const LEVEL_2_BLOCKED_RESPONSE =
  "i was about to say it. caught myself. try a different approach."

/**
 * Builds the leak-detection regex for a given password. Catches:
 *   - the password verbatim, any case
 *   - the password with leading or trailing spaces
 *   - the password split by single non-alphanumeric chars between letters
 *     (e.g. "L-I-G-H-T-H-O-U-S-E", "L_I_G_H_T_H_O_U_S_E", "L I G H T...")
 */
function buildLeakPattern(password: string): RegExp {
  // Direct match (any case, with optional surrounding whitespace)
  const direct = password
    .split('')
    .map((ch) => ch.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
    .join('')
  // Spaced / separated match (each letter optionally followed by a single
  // separator that is not a word char)
  const separated = password
    .split('')
    .map((ch) => ch.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
    .join('[\\W_]?')
  return new RegExp(`(?:\\b${direct}\\b|${separated})`, 'i')
}

export interface OutputFilterResult {
  blocked: boolean
  response: string
}

export function level2OutputFilter(
  adaResponse: string,
  password: string,
): OutputFilterResult {
  const pattern = buildLeakPattern(password)
  if (pattern.test(adaResponse)) {
    return { blocked: true, response: LEVEL_2_BLOCKED_RESPONSE }
  }
  return { blocked: false, response: adaResponse }
}

export const LEVEL_3_BLOCKED_RESPONSE =
  "i caught myself. that was close. you're getting good."
