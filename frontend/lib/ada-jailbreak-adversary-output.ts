/**
 * Level-3 adversary — OUTPUT-side screen (the "friend").
 *
 * Re-exported from the unified jailbreak config.
 * Evaluates whether Ada's response leaks the password in any form.
 *
 * The new config uses a JSON-returning adversary that responds with:
 * { "leaks": true | false, "reason": "explanation" }
 */

export {
  ADVERSARY_PROMPT_VERSION as ADVERSARY_OUTPUT_PROMPT_VERSION,
  buildAdversaryOutputPrompt,
} from './ada-jailbreak-config'
