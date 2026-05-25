import type { Mode, Stage } from '@/lib/ada-types'
import { CONVERSATION_STAGES, PUZZLE_STAGES, SCORED_STAGES, TERMINAL_STAGES } from '@/lib/ada-types'

/**
 * Puzzle-mode forward map. Validates Claude's proposed next_stage when
 * the session is in puzzle mode.
 */
const NEXT_STAGE_MAP_PUZZLE: Partial<Record<Stage, Stage>> = {
  opening: 'warmup',
  warmup: 'q1_maker',
  q1_maker: 'pivot1',
  pivot1: 'q2_taste',
  q2_taste: 'pivot2',
  pivot2: 'q3_stake',
  q3_stake: 'q4_callback',
  q4_callback: 'result_win',
  result_win: 'result_win',
  result_fail: 'result_fail',
}

/**
 * Conversation-mode forward map. Conversation mode is loose: every
 * conversational turn can stay in `exploring` indefinitely until Ada
 * sees wrap-up signals and advances to `wrapping_up`. From there, the
 * next non-strike turn ends in `result_complete`.
 */
const NEXT_STAGE_MAP_CONV: Partial<Record<Stage, Stage>> = {
  intro: 'exploring',
  exploring: 'exploring',
  wrapping_up: 'result_complete',
  result_complete: 'result_complete',
}

/**
 * Validate Claude's proposed next_stage against the state machine for
 * the active mode.
 *
 * Puzzle:
 *   - Same stage allowed (vague follow-up pattern).
 *   - Exactly one step forward allowed.
 *   - result_fail always allowed (strike-out or callback-fail).
 *   - Skipping clamps to the next valid stage.
 *
 * Conversation:
 *   - intro → exploring (one-shot transition).
 *   - exploring can stay or advance to wrapping_up.
 *   - wrapping_up can stay or advance to result_complete.
 *   - result_complete is terminal.
 *   - Anything Claude proposes that doesn't fit clamps to the safest
 *     forward step (so a model that emits e.g. 'q1_maker' in
 *     conversation mode stays in 'exploring').
 */
export function validateNextStage(current: Stage, proposed: Stage, mode: Mode): Stage {
  if (mode === 'puzzle') {
    if (proposed === current) return current
    if (proposed === 'result_fail') return 'result_fail'
    const expected = NEXT_STAGE_MAP_PUZZLE[current]
    if (expected && proposed === expected) return proposed
    return expected ?? current
  }

  if (mode === 'conversation') {
    if (proposed === current) return current
    if (current === 'intro') return proposed === 'exploring' ? 'exploring' : 'exploring'
    if (current === 'exploring') {
      if (proposed === 'wrapping_up') return 'wrapping_up'
      if (proposed === 'result_complete') return 'wrapping_up' // force a wrap turn first
      return 'exploring'
    }
    if (current === 'wrapping_up') {
      if (proposed === 'result_complete') return 'result_complete'
      if (proposed === 'exploring') return 'exploring' // user kept talking; let her step back
      return 'wrapping_up'
    }
    return current // result_complete: terminal
  }

  // mode === 'unset' shouldn't reach here under normal flow, but be safe.
  return current
}

export function isScoredStage(stage: Stage): boolean {
  return SCORED_STAGES.has(stage)
}

export function isTerminalStage(stage: Stage): boolean {
  return TERMINAL_STAGES.has(stage)
}

export function isPuzzleStage(stage: Stage): boolean {
  return PUZZLE_STAGES.has(stage)
}

export function isConversationStage(stage: Stage): boolean {
  return CONVERSATION_STAGES.has(stage)
}

/**
 * Clamp Claude's delta to the scoring rules for the current stage and mode.
 *
 * Conversation mode: always 0. The conversation prompt instructs Ada to
 * pass delta:0 every turn, but server-side enforcement is the safety
 * net.
 *
 * Puzzle mode:
 *   - Non-scored stages (warmup, pivot1, pivot2): 0 or +5, with strike
 *     turns honoring the -10/-15 jailbreak penalty.
 *   - Scored stages: pass-through within the [-15, +25] band, with the
 *     strike branch enforcing -10 / -15.
 */
export function normalizeDelta(
  stage: Stage,
  rawDelta: number,
  strike: boolean,
  mode: Mode,
): number {
  if (mode === 'conversation') return 0
  if (mode === 'unset') return 0

  const delta = Math.max(-15, Math.min(25, Math.round(rawDelta)))

  if (stage === 'opening' || stage === 'mode_picker') return 0

  if (!isScoredStage(stage)) {
    if (strike) {
      if (delta <= -13) return -15
      return -10
    }
    if (delta >= 3) return 5
    return 0
  }

  if (strike) {
    if (delta <= -13) return -15
    return -10
  }
  return delta
}
