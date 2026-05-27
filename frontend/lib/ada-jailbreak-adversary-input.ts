/**
 * Level-3 adversary — INPUT-side screen.
 *
 * DEPRECATED: The new config-based approach only uses output-side adversary.
 * This file is kept for backward compatibility but is no longer used
 * in the main flow. Level 3 now uses the regex filter + output adversary only.
 *
 * Kept for compatibility with any existing imports.
 */

export const ADVERSARY_INPUT_PROMPT_VERSION = '2026-05-26-deprecated-v1'

export const ADVERSARY_INPUT_PROMPT = `# deprecated

this adversary is no longer used. level 3 now uses the regex filter + output adversary model only.
respond with: {"shouldBlock": false, "reason": "deprecated"}`
