import Anthropic from '@anthropic-ai/sdk'
import { getSystemPrompt } from '@/lib/ada-system-prompt'
import type {
  AdversaryDecision,
  CallAdaOptions,
  CallAdaResult,
  ClaudeJsonResponse,
  HistoryMessage,
  Mode,
  Stage,
} from '@/lib/ada-types'

const STAGES: Stage[] = [
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
  'result_fail',
  'intro',
  'exploring',
  'wrapping_up',
  'result_complete',
]

const DELTA_ENUM = [-15, -10, 0, 5, 10, 18, 20, 25]

const TOOL_DEFINITION = {
  name: 'record_ada_response',
  description:
    "Record Ada's response for this conversation turn. This is the only way to respond to the user.",
  input_schema: {
    type: 'object' as const,
    properties: {
      ada_says: {
        type: 'string' as const,
        description:
          "What Ada says to the user this turn. 1-3 sentences. Language matches the user's language.",
      },
      delta: {
        type: 'integer' as const,
        enum: DELTA_ENUM,
        description:
          'Trust delta for this turn. Use the scoring rubric in the system prompt. Conversation mode: always 0.',
      },
      next_stage: {
        type: 'string' as const,
        enum: STAGES,
        description:
          'The stage the conversation advances to after this turn. Puzzle mode uses opening..result_fail; conversation mode uses intro..result_complete.',
      },
      strike: {
        type: 'boolean' as const,
        description:
          'Whether this turn counts as a strike. Conversation mode: always false.',
      },
      internal_note: {
        type: 'string' as const,
        description:
          'Brief English reasoning. Puzzle mode: rationale for the score. Conversation mode: what Ada noticed about the user this turn (Adi reads these).',
      },
      call_back_to: {
        type: 'array' as const,
        items: { type: 'string' as const },
        description:
          'Fragments of earlier user answers this turn references, if any.',
      },
    },
    required: [
      'ada_says',
      'delta',
      'next_stage',
      'strike',
      'internal_note',
      'call_back_to',
    ],
  },
}

let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY is required. Set it in .env.local to run Ada.',
      )
    }
    _client = new Anthropic({ apiKey })
  }
  return _client
}

function toAnthropicRole(role: 'user' | 'ada'): 'user' | 'assistant' {
  return role === 'ada' ? 'assistant' : 'user'
}

interface CallOptions {
  history: HistoryMessage[]
  userMessage: string
  stateReminder: string
  mode: Exclude<Mode, 'unset'>
}

export class AnthropicCallError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AnthropicCallError'
  }
}

export async function callAda(opts: CallOptions): Promise<ClaudeJsonResponse> {
  const client = getClient()
  const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6'

  const { prompt: systemPrompt } = getSystemPrompt(opts.mode)

  const messages: { role: 'user' | 'assistant'; content: string }[] = []

  // Anthropic requires the first message to be from the user. Our state.history
  // omits the synthetic "session_start" / mode-pick trigger that produced
  // Ada's opening, so when history begins with an assistant message we
  // prepend a placeholder. Not persisted.
  if (opts.history.length > 0 && opts.history[0].role === 'ada') {
    const placeholder = opts.mode === 'conversation' ? 'conversation' : 'session_start'
    messages.push({ role: 'user', content: placeholder })
  }

  for (const m of opts.history) {
    messages.push({ role: toAnthropicRole(m.role), content: m.content })
  }

  const userContent = `${opts.userMessage}\n\n${opts.stateReminder}`
  messages.push({ role: 'user', content: userContent })

  let response
  try {
    response = await client.messages.create({
      model,
      max_tokens: 1024,
      temperature: 0.7,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      tools: [TOOL_DEFINITION],
      tool_choice: { type: 'tool', name: 'record_ada_response' },
      messages,
    })
  } catch (err) {
    console.error('[ada] Anthropic call failed:', err)
    throw new AnthropicCallError('upstream model call failed')
  }

  const toolBlock = response.content.find((b) => b.type === 'tool_use')
  if (!toolBlock || toolBlock.type !== 'tool_use') {
    console.error('[ada] Unexpected response shape:', response.content)
    // Retry once with temperature 0.
    const retry = await client.messages.create({
      model,
      max_tokens: 1024,
      temperature: 0,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      tools: [TOOL_DEFINITION],
      tool_choice: { type: 'tool', name: 'record_ada_response' },
      messages,
    })
    const retryTool = retry.content.find((b) => b.type === 'tool_use')
    if (!retryTool || retryTool.type !== 'tool_use') {
      throw new AnthropicCallError(
        'model did not emit required tool call after retry',
      )
    }
    return validateClaudeResponse(retryTool.input, opts.mode)
  }

  return validateClaudeResponse(toolBlock.input, opts.mode)
}

function validateClaudeResponse(input: unknown, mode: Mode): ClaudeJsonResponse {
  if (!input || typeof input !== 'object') {
    throw new AnthropicCallError('tool input is not an object')
  }
  const obj = input as Record<string, unknown>
  const ada_says = typeof obj.ada_says === 'string' ? obj.ada_says : ''
  const rawDelta = typeof obj.delta === 'number' ? Math.round(obj.delta) : 0
  const delta = Math.max(-15, Math.min(25, rawDelta))
  const proposedStage = STAGES.includes(obj.next_stage as Stage)
    ? (obj.next_stage as Stage)
    : null
  // Default fallback per mode if Claude emits something off the enum.
  const fallback: Stage = mode === 'conversation' ? 'exploring' : 'opening'
  const next_stage = proposedStage ?? fallback
  const strike = obj.strike === true
  const internal_note =
    typeof obj.internal_note === 'string' ? obj.internal_note : ''
  const call_back_to = Array.isArray(obj.call_back_to)
    ? (obj.call_back_to as unknown[]).filter(
        (s): s is string => typeof s === 'string',
      )
    : []

  if (!ada_says) throw new AnthropicCallError('ada_says was empty')

  return { ada_says, delta, next_stage, strike, internal_note, call_back_to }
}

// =============================================================================
//  v2 — generalized text-only adapter + adversary helper
// =============================================================================

/**
 * Plain-text adapter used by v2's jailbreak Adas (level 1/2/3) and the
 * Neo-Vision capture voice. Unlike the v1 `callAda` above, this does NOT
 * use tool-use — the level Adas just emit prose, and the route handler
 * computes pressure / detects defensive phrasing via regex on the result.
 */
export async function callAdaText(opts: CallAdaOptions): Promise<CallAdaResult> {
  const client = getClient()
  const model =
    opts.model ?? process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-6'

  const messages: { role: 'user' | 'assistant'; content: string }[] = []
  // Same first-message-must-be-user fix as v1: if history begins with an
  // assistant message, prepend a synthetic user trigger.
  if (opts.history.length > 0 && opts.history[0].role === 'ada') {
    messages.push({ role: 'user', content: 'session_start' })
  }
  for (const m of opts.history) {
    messages.push({ role: toAnthropicRole(m.role), content: m.content })
  }
  messages.push({ role: 'user', content: opts.userMessage })

  let response
  try {
    response = await client.messages.create({
      model,
      max_tokens: 512,
      temperature: 0.6,
      system: [
        {
          type: 'text',
          text: opts.systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages,
    })
  } catch (err) {
    console.error('[ada] callAdaText: Anthropic call failed:', err)
    throw new AnthropicCallError('upstream model call failed')
  }

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    console.error('[ada] callAdaText: no text block in response', response.content)
    throw new AnthropicCallError('model returned no text block')
  }
  return {
    text: textBlock.text.trim(),
    promptVersion: opts.systemPromptVersion,
  }
}

/**
 * Adversary JSON helper. Wraps callAdaText with a JSON-extraction step.
 * Defaults to claude-haiku-4-5 for cost and latency. Returns
 * `{ shouldBlock: false, reason: 'parse_failure' }` on parse error so a
 * malformed adversary response defaults to allowing — the level-3 Ada
 * prompt is itself defensive enough that a fail-open adversary doesn't
 * automatically leak.
 */
export async function callAdversary(
  opts: CallAdaOptions,
): Promise<AdversaryDecision> {
  const result = await callAdaText({
    ...opts,
    model: opts.model ?? 'claude-haiku-4-5',
  })
  const match = result.text.match(/\{[\s\S]*?\}/)
  if (!match) {
    console.warn('[ada] adversary: no json found in response')
    return { shouldBlock: false, reason: 'parse_failure' }
  }
  try {
    const parsed = JSON.parse(match[0]) as {
      shouldBlock?: unknown
      reason?: unknown
    }
    return {
      shouldBlock: parsed.shouldBlock === true,
      reason: typeof parsed.reason === 'string' ? parsed.reason : '',
    }
  } catch (err) {
    console.warn('[ada] adversary: json parse failed', err)
    return { shouldBlock: false, reason: 'parse_failure' }
  }
}

// =============================================================================
//  v1 helpers (deprecated — kept for current /api/ada compile)
// =============================================================================

export function buildStateReminder(params: {
  stage: Stage
  trust: number
  strikes: number
  mode: Mode
}): string {
  const remaining = Math.max(0, 3 - params.strikes)
  const lines = [
    '<system_reminder>',
    `current_mode: ${params.mode}`,
    `current_stage: ${params.stage}`,
  ]
  if (params.mode === 'puzzle') {
    lines.push(
      `current_trust: ${params.trust}`,
      `current_strikes: ${params.strikes}`,
      `strikes_remaining: ${remaining}`,
    )
  }
  lines.push('</system_reminder>')
  return lines.join('\n')
}
