/**
 * Orchestrator that selects between the puzzle and conversation prompts
 * based on the session's mode. Existing imports of `ADA_SYSTEM_PROMPT`
 * and `PROMPT_VERSION` keep working — `ADA_SYSTEM_PROMPT` aliases the
 * puzzle prompt for back-compat, and `PROMPT_VERSION` returns the puzzle
 * version. Anywhere mode-aware (the route handler, the Anthropic
 * caller), prefer `getSystemPrompt(mode)`.
 */

import {
  ADA_PUZZLE_PROMPT,
  PROMPT_VERSION as PUZZLE_VERSION,
} from './ada-system-prompt-puzzle'
import {
  ADA_CONVERSATION_PROMPT,
  PROMPT_VERSION as CONVERSATION_VERSION,
} from './ada-system-prompt-conversation'
import type { Mode } from './ada-types'

export interface SystemPromptResult {
  prompt: string
  version: string
}

/**
 * Select the system prompt for a given mode. Throws on `'unset'` because
 * the mode-picker turn is synthesized server-side without an Anthropic
 * call — the Anthropic path should never be invoked while mode is unset.
 */
export function getSystemPrompt(mode: Mode): SystemPromptResult {
  if (mode === 'puzzle') return { prompt: ADA_PUZZLE_PROMPT, version: PUZZLE_VERSION }
  if (mode === 'conversation')
    return { prompt: ADA_CONVERSATION_PROMPT, version: CONVERSATION_VERSION }
  throw new Error(
    'getSystemPrompt called with mode === "unset". Mode must be set before fetching the system prompt.',
  )
}

/** Back-compat re-exports. Prefer the mode-aware accessor in new code. */
export const ADA_SYSTEM_PROMPT = ADA_PUZZLE_PROMPT
export const PROMPT_VERSION = PUZZLE_VERSION
