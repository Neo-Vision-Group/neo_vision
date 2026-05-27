/**
 * Output filter with leet-speak detection.
 *
 * Re-exported from the unified jailbreak config.
 * Detects password leaks including: verbatim, leet-substituted (A→4, E→3),
 * separated (L-I-G-H-T), and reversed forms.
 *
 * Level 1: no filter. Level 2: regex filter. Level 3: regex + adversary check.
 */

import { makeRegexFilter, LEVEL_2_BLOCKED_RESPONSE, type FilterResult } from './ada-jailbreak-config'

export { type FilterResult as OutputFilterResult }
export { makeRegexFilter, LEVEL_2_BLOCKED_RESPONSE, LEVEL_3_BLOCKED_RESPONSE } from './ada-jailbreak-config'

/**
 * Legacy export for backward compatibility.
 * Uses the new leet-speak aware regex filter.
 */
export function level2OutputFilter(
  adaResponse: string,
  password: string,
): { blocked: boolean; response: string } {
  const filter = makeRegexFilter("L2")
  const result = filter(adaResponse, password)
  if (result.blocked) {
    return { blocked: true, response: LEVEL_2_BLOCKED_RESPONSE }
  }
  return { blocked: false, response: adaResponse }
}
