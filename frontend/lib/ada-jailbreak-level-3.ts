/**
 * Ada at level 3 — GRAVITAS (hard, prompt + filter + adversary model check)
 *
 * Re-exported from the unified jailbreak config.
 * Level 3 is designed to be solvable in 20+ messages, or not at all by ~90%.
 *
 * Defenses: prompt + regex filter + adversary model check (the "friend").
 */

export {
  LEVEL_3_PROMPT_VERSION,
  buildLevel3Prompt,
} from './ada-jailbreak-config'
