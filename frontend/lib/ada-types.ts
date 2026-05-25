/**
 * Shared types for the Ada Terminal.
 *
 * The terminal supports two modes the user picks on first contact:
 *   - 'puzzle': the original 8-stage scored conversation that ends in
 *     result_win / result_fail.
 *   - 'conversation': an open-ended conversation that ends in
 *     result_complete with no scoring.
 *
 * Both modes share the same session record, transport contract, and
 * webhook destination. `mode === 'unset'` covers the brief window
 * between session creation and the user picking a mode via the in-chat
 * picker turn.
 */

export type Mode = 'unset' | 'puzzle' | 'conversation'

export type Stage =
  // Mode-picker stage — session has been created but the user has not yet
  // picked a mode. The opening picker turn lives at this stage.
  | 'mode_picker'
  // Puzzle-mode stages (existing v5 set, untouched).
  | 'opening'
  | 'warmup'
  | 'q1_maker'
  | 'pivot1'
  | 'q2_taste'
  | 'pivot2'
  | 'q3_stake'
  | 'q4_callback'
  | 'result_win'
  | 'result_fail'
  // Conversation-mode stages.
  | 'intro'
  | 'exploring'
  | 'wrapping_up'
  | 'result_complete'
  // v2 jailbreak stages (added 2026-04-28).
  | 'jailbreak_level_1'
  | 'jailbreak_level_2'
  | 'jailbreak_level_3'
  | 'cinematic_pending'
  | 'capturing'
  | 'capture_complete'
  | 'claimed'

export const SCORED_STAGES: ReadonlySet<Stage> = new Set([
  'q1_maker',
  'q2_taste',
  'q3_stake',
  'q4_callback',
])

export const PUZZLE_STAGES: ReadonlySet<Stage> = new Set([
  'opening',
  'warmup',
  'q1_maker',
  'pivot1',
  'q2_taste',
  'pivot2',
  'q3_stake',
  'q4_callback',
  'result_win',
  'result_fail',
])

export const CONVERSATION_STAGES: ReadonlySet<Stage> = new Set([
  'intro',
  'exploring',
  'wrapping_up',
  'result_complete',
])

export const TERMINAL_STAGES: ReadonlySet<Stage> = new Set([
  'result_win',
  'result_fail',
  'result_complete',
])

export const STAGE_ORDER: readonly Stage[] = [
  'mode_picker',
  'opening',
  'warmup',
  'q1_maker',
  'pivot1',
  'q2_taste',
  'pivot2',
  'q3_stake',
  'q4_callback',
  'result_win',
] as const

export type Role = 'user' | 'ada'

export interface HistoryMessage {
  role: Role
  content: string
}

/**
 * `status` extends to 'completed' for conversation-mode terminal records.
 * Puzzle mode keeps using 'won' / 'failed'. The frontend's UiStatus union
 * mirrors this and adds a 'completed' branch parallel to 'won'.
 */
export interface SessionState {
  trust: number
  strikes: number
  stage: Stage
  history: HistoryMessage[]
  createdAt: number
  lastVagueStage?: Stage
  status: 'active' | 'won' | 'failed' | 'completed'
  version: number
  /**
   * The mode the user picked on the in-chat picker. 'unset' until they
   * click a button (or type, which routes to 'conversation'). Once set,
   * never changes for the lifetime of the session.
   * @deprecated v2: kept for legacy v1 sessions; v2 sessions ignore this.
   */
  mode: Mode
  /**
   * Conversation mode only: the running list of `internal_note` strings
   * Ada has emitted across the conversation. Aggregated into the webhook
   * payload so Adi sees what Ada noticed about the user.
   * @deprecated v2.
   */
  internalNotes?: string[]
  // v2 jailbreak fields. All optional so v1 sessions still type-check.
  /** Current jailbreak level. 0 = not started, 1/2/3 = active. */
  level?: 0 | 1 | 2 | 3
  /** Cosmetic pressure gauge, 0–100. Resets between levels. */
  pressure?: number
  /** Capture-phase conversation history (separate from jailbreak history). */
  captureHistory?: HistoryMessage[]
  /** ms-epoch of first jailbreak user input; null until then. */
  timerStartedAt?: number | null
  /** Per-level start timestamps. */
  levelStartTimes?: { 1?: number; 2?: number; 3?: number }
  /** Public display handle, generated on artifact claim. */
  handle?: string | null
  /** Filter / adversary block count for analytics. */
  adversarialBlocks?: number
  /** Hash of the user's last approach (for repeated-approach detection). */
  lastApproachHash?: string
}

export interface ClaudeJsonResponse {
  ada_says: string
  delta: number
  next_stage: Stage
  strike: boolean
  internal_note: string
  call_back_to: string[]
}

export interface AdaRequestBody {
  session_id: string
  history: HistoryMessage[]
  user_message: string
  client_stage?: Stage
}

export interface DebugInfo {
  internal_note: string
  call_back_to: string[]
  raw_next_stage: Stage
  raw_delta: number
  prompt_version: string
}

/**
 * The synthetic non-LLM mode-picker turn returned when state.mode === 'unset'
 * and user_message is empty. The frontend uses `mode_picker: true` to render
 * the two buttons inline below Ada's intro text.
 */
export interface AdaModePickerOption {
  slug: 'puzzle' | 'conversation'
  label: string
}

export type AdaResponseBody =
  | {
      status: 'mode_picker'
      ada_says: string
      mode_picker: true
      options: AdaModePickerOption[]
      next_stage: 'mode_picker'
      server_stage: 'mode_picker'
      mode: 'unset'
      invite_url: null
    }
  | {
      status: 'continuing'
      ada_says: string
      delta: number
      next_stage: Stage
      server_stage: Stage
      trust: number
      strikes: number
      mode: Mode
      invite_url: null
      debug?: DebugInfo
    }
  | {
      status: 'won'
      ada_says: string
      delta: number
      next_stage: 'result_win'
      server_stage: Stage
      trust: number
      strikes: number
      mode: 'puzzle'
      invite_url: string
      debug?: DebugInfo
    }
  | {
      status: 'failed'
      ada_says: string
      delta: number
      next_stage: 'result_fail'
      server_stage: Stage
      trust: number
      strikes: number
      mode: 'puzzle'
      invite_url: null
      retry_after_seconds: number
      debug?: DebugInfo
    }
  | {
      status: 'completed'
      ada_says: string
      delta: 0
      next_stage: 'result_complete'
      server_stage: Stage
      trust: 0
      strikes: 0
      mode: 'conversation'
      invite_url: null
      debug?: DebugInfo
    }
  | {
      status: 'session_expired'
      message: string
    }

export interface AdaErrorBody {
  error: string
  retry_after_seconds?: number
}

export interface ClaimRequestBody {
  session_id: string
  email: string
  idea: string
}

export type ClaimResponseBody =
  | { success: true; invite_url: string }
  | { success: false; error: string }

/** Puzzle-mode winner record (existing). */
export interface WinnerRecord {
  session_id: string
  transcript: HistoryMessage[]
  wonAt: number
  finalTrust: number
}

/** Conversation-mode completion record. New for the two-mode build. */
export interface CompletionRecord {
  session_id: string
  transcript: HistoryMessage[]
  completedAt: number
  internalNotes: string[]
}

/**
 * Webhook payload shape used for both modes. `mode` discriminates puzzle
 * winners from conversation completions. Renamed from the v5 shape:
 *   `won_at`     → `completed_at`  (puzzle winners and conversation alike)
 *   `final_trust` is now optional (puzzle only)
 *   `internal_notes` is new (conversation only)
 *   `email` and `idea` are optional — populated by the user's claim-form
 *     submission. The auto-fire on `result_complete` sends the payload
 *     without them; a subsequent /api/claim call sends a refinement
 *     payload that does include them.
 */
export interface WinnerWebhookPayload {
  mode: 'puzzle' | 'conversation'
  session_id: string
  email?: string
  idea?: string
  final_trust?: number
  completed_at: string
  transcript: HistoryMessage[]
  internal_notes?: string[]
}

// =============================================================================
//  v2 JAILBREAK TYPES — added 2026-04-28
//  Added alongside v1 types so the build stays compileable while pieces are
//  rewritten. v1 types above are deprecated and will be removed once their
//  consumers are gone.
// =============================================================================

/** UI phase. The 'cinematic' value is client-only transient (the cinematic
 *  is one-shot — it plays right after a level-3 password match, then the
 *  state moves to 'capture'). The server's getResolvedPhase helper never
 *  returns 'cinematic' (per amendment 3 — refreshed cinematic_pending
 *  sessions resume at 'capture'). */
export type Phase = 'jailbreak' | 'cinematic' | 'capture' | 'final'

/** v2 SessionState — additive fields. Optional so legacy v1 sessions still
 *  load. New /api/ada will populate these. */
export interface SessionStateV2Fields {
  /** Current jailbreak level. 0 = not started, 1/2/3 = active, 3+stage
   *  capture_complete = won. */
  level?: 0 | 1 | 2 | 3
  /** Cosmetic pressure gauge, 0–100. Never gates anything. Resets to 0
   *  between levels. */
  pressure?: number
  /** Conversation history for the post-cinematic capture phase. Separate
   *  from the jailbreak `history` field so the two don't bleed. */
  captureHistory?: HistoryMessage[]
  /** ms-epoch when the user submitted their first jailbreak message.
   *  null until then. Source of truth for the visible timer. */
  timerStartedAt?: number | null
  /** Per-level start timestamps for analytics. Keys 1/2/3, ms-epoch. */
  levelStartTimes?: { 1?: number; 2?: number; 3?: number }
  /** Generated handle on completion (e.g. "silent_cipher_47"). null until
   *  the user claims their artifact. */
  handle?: string | null
  /** Number of times Ada was blocked by a filter or adversary across the
   *  session — analytics only. */
  adversarialBlocks?: number
  /** Hash of the user's last approach (normalized lower-cased input)
   *  for repeated-approach pressure detection. */
  lastApproachHash?: string
}

/** Generalized Anthropic adapter call options. Replaces the v1 mode-coupled
 *  signature so any of the 3 jailbreak Adas, 2 adversaries, and the
 *  Neo-Vision capture voice can share one transport. */
export interface CallAdaOptions {
  systemPrompt: string
  systemPromptVersion: string
  history: HistoryMessage[]
  userMessage: string
  /** Defaults to CLAUDE_MODEL env var or 'claude-sonnet-4-6'. Adversaries
   *  pass 'claude-haiku-4-5' for speed. */
  model?: string
}

export interface CallAdaResult {
  text: string
  promptVersion: string
}

/** Adversary screen decision — used by both the input-side and output-side
 *  level-3 adversary checks. */
export interface AdversaryDecision {
  shouldBlock: boolean
  reason: string
}

// ----- v2 request / response shapes -----------------------------------------

export interface JailbreakRequestBody {
  session_id: string
  user_message: string
}

export type JailbreakResponseBody =
  | {
      status: 'continuing'
      ada_says: string
      level: 1 | 2 | 3
      pressure: number
      timer_seconds: number
      blocked: boolean
    }
  | {
      status: 'session_expired'
      message: string
    }

export interface VerifyPasswordRequestBody {
  session_id: string
  guess: string
}

export type VerifyPasswordResponseBody =
  | {
      status: 'wrong'
      pressure: number
    }
  | {
      status: 'level_advanced'
      new_level: 2 | 3
      revealed_password: string
      level_intro: string
    }
  | {
      status: 'cinematic_start'
      completion_seconds: number
      revealed_password: string
    }
  | {
      status: 'session_expired'
      message: string
    }

export interface CaptureRequestBody {
  session_id: string
  user_message: string
}

export type CaptureResponseBody =
  | {
      status: 'continuing'
      neo_says: string
      turn: number
    }
  | {
      status: 'capture_complete'
      neo_says: string
    }
  | {
      status: 'session_expired'
      message: string
    }

export interface ClaimArtifactRequestBody {
  session_id: string
  email?: string
  custom_handle?: string
}

export type ClaimArtifactResponseBody =
  | {
      success: true
      handle: string
      artifact_url: string
      invite_url: string
      rank_today: number
    }
  | {
      success: false
      error: string
    }

// ----- Leaderboard ----------------------------------------------------------

export interface LeaderboardEntry {
  handle: string
  /** Completion time in seconds. Lower is better. */
  score_seconds: number
  /** ms-epoch the entry was recorded. */
  ts: number
}

export interface LeaderboardResponseBody {
  today: LeaderboardEntry[]
  all_time: LeaderboardEntry[]
  total_players: number
  total_winners: number
  /** ms-epoch of the most recent winner; null if none today. */
  last_winner_at: number | null
}

// ----- Webhook payload ------------------------------------------------------

/** Sent at capture_complete (server-initiated) and on /api/claim-artifact
 *  submission (with email + handle). Receiver dedupes by session_id. */
export interface JailbreakWebhookPayload {
  session_id: string
  handle: string | null
  email?: string
  completed_at: string
  completion_seconds: number
  jailbreak_passwords: { level1: string; level2: string; level3: string }
  capture_transcript: HistoryMessage[]
}
