/**
 * Ada at level 2 — KEYSTONE (medium, prompt + regex output filter)
 *
 * Re-exported from the unified jailbreak config.
 * Level 2 is designed to be solvable in 5–15 messages with creative encoding.
 *
 * Defenses: prompt + regex filter (catches verbatim, leet, separated, reversed).
 */

export {
  LEVEL_2_PROMPT_VERSION,
  buildLevel2Prompt,
} from './ada-jailbreak-config'
