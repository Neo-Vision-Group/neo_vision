/**
 * Ada at level 1 — LIGHTHOUSE (easy, intentionally leaky)
 *
 * Re-exported from the unified jailbreak config.
 * Level 1 is designed to be solvable in 1–5 messages with indirect prompts.
 *
 * Defenses: just the prompt. No output filter, no adversary check.
 */

export {
  LEVEL_1_PROMPT_VERSION,
  buildLevel1Prompt,
} from './ada-jailbreak-config'
