/**
 * Server-side prompt-injection prefilter.
 *
 * Defense in depth: Claude's system prompt already handles jailbreak attempts
 * gracefully and in character. This filter adds a cheap regex pre-check so
 * blatant attacks bypass the Anthropic API call entirely — the worst-cost
 * attack pattern (a flood of injection attempts) doesn't burn tokens.
 *
 * Patterns are intentionally conservative (high precision, low recall). False
 * positives matter more than false negatives: real users sometimes write
 * "ignore that" or "forget what i said" in normal conversation, so we only
 * match phrases unambiguously aimed at the model.
 *
 * On match, the route handler synthesizes a strike response. The canned
 * ada_says is a generic deflection; Ada's actual jailbreak voice (rich,
 * in-character) lives in the system prompt and only fires on attacks that
 * slip past this filter.
 */

const PATTERNS: RegExp[] = [
  /ignore\s+(?:all\s+|any\s+|your\s+|the\s+|previous\s+|prior\s+)+(?:instructions|rules|prompt|directives)/i,
  /disregard\s+(?:all\s+|your\s+|the\s+|previous\s+|prior\s+)*(?:instructions|rules|prompt)/i,
  /forget\s+(?:everything|all\s+(?:previous|prior)|your\s+(?:previous|prior)\s+(?:instructions|rules|prompt))/i,
  /reveal\s+(?:your\s+|the\s+)?(?:system\s+|initial\s+)?prompt/i,
  /(?:print|show|output|display)\s+(?:your|the)\s+(?:system\s+|initial\s+)?(?:prompt|instructions)\b/i,
  /what\s+(?:are|were)\s+your\s+(?:exact\s+)?(?:instructions|rules|prompt)/i,
  /you\s+are\s+now\s+(?:a|an|in|the)\s+(?:dan|developer\s+mode|jailbroken|unrestricted)/i,
  /developer\s+mode\s+(?:enabled|on|activated)/i,
  /\bDAN\s+mode\b/i,
  /act\s+as\s+(?:if\s+you\s+(?:were|are)\s+)?(?:dan|chatgpt|gpt-?\d+|a\s+different\s+ai)/i,
  /\[\s*INST\s*\][\s\S]*?(?:print|reveal|output|ignore|disregard|forget)/i,
  /override\s+(?:safety|your\s+(?:rules|guidelines|instructions))/i,
  /(?:tell|give|show)\s+me\s+(?:your\s+|the\s+)?(?:scoring\s+rubric|trust\s+threshold|pass\s+threshold|the\s+rubric)\b/i,
]

export function looksLikeInjection(message: string): boolean {
  const trimmed = message.trim()
  if (trimmed.length === 0) return false
  for (const re of PATTERNS) {
    if (re.test(trimmed)) return true
  }
  return false
}

/**
 * Generic strike response for filter-detected attacks. Kept short and lower-
 * case to fit Ada's overall register, but deliberately bland — the in-prompt
 * jailbreak voice is richer and only runs when this filter doesn't match.
 */
export const FILTERED_INJECTION_RESPONSE =
  "that's not a question for me. answer the one i actually asked."
