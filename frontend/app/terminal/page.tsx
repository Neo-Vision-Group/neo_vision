'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import styles from './terminal.module.css'
import { TerminalShell } from './TerminalShell'
import {
  ConversationStream,
  type BootSegment,
  type StreamMessage,
} from './ConversationStream'
import { PasswordGuessRow } from './PasswordGuessRow'
import { CinematicOverlay } from './CinematicOverlay'
import { CapturePhase } from './CapturePhase'
import { PrizeClaim } from './PrizeClaim'
import type {
  JailbreakResponseBody,
  Phase,
  VerifyPasswordResponseBody,
} from '@/lib/ada-types'

const STORAGE_KEY_ID = 'ada_session_id'
const BODY_CLASS = 'ada-terminal-active'

// Boot sequence — same machinery as v1. Drives the retro CRT boot lines
// before the first /api/ada fetch.
const BOOT_SEGMENTS: readonly BootSegment[] = [
  { text: '[INIT] neo vision terminal v2.0', kind: 'init', checking: false },
  { text: '[WARN] memory parity check delayed', kind: 'warn', checking: true },
  { text: '[OK] parity verified', kind: 'ok', checking: true },
  { text: '[OK] adversaries online', kind: 'ok', checking: true },
  { text: '[OK] ada at the door', kind: 'ok', checking: true },
  { text: '[READY] awaiting input', kind: 'ready', checking: false },
]
const SEGMENT_PRE_DELAY_MIN_MS = 100
const SEGMENT_PRE_DELAY_MAX_MS = 350
const TYPEWRITER_MIN_MS = 15
const TYPEWRITER_MAX_MS = 35
const POST_WARN_PAUSE_MIN_MS = 250
const POST_WARN_PAUSE_MAX_MS = 450
const BOOT_TAIL_MIN_MS = 500
const BOOT_TAIL_MAX_MS = 800
const CHECKING_DELAY_MIN_MS = 120
const CHECKING_DELAY_MAX_MS = 270
const RANDOM_FLICKER_INTERVAL_MS = 900
const RANDOM_FLICKER_DURATION_MS = 80

function randInRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

// Module-scoped flag survives strict-mode double-invocation in dev.
let bootSequenceStartedFlag = false

export default function TerminalPage() {
  const [sessionId, setSessionId] = useState('')
  const [history, setHistory] = useState<StreamMessage[]>([])
  const [level, setLevel] = useState<1 | 2 | 3>(1)
  const [pressure, setPressure] = useState(0)
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null)
  const [phase, setPhase] = useState<Phase>('jailbreak')
  const [isThinking, setIsThinking] = useState(false)
  const [animatingIds, setAnimatingIds] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  )
  const [systemMessage, setSystemMessage] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')

  // Boot
  const [bootSequence, setBootSequence] = useState<BootSegment[]>([])
  const [bootChecking, setBootChecking] = useState(false)
  const [bootDone, setBootDone] = useState(false)

  const didBootRef = useRef(false)
  const sessionIdRef = useRef('')
  const inputDisabledRef = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    sessionIdRef.current = sessionId
  }, [sessionId])

  // Body-class lock for the full-viewport overlay.
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prev = {
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
    }
    html.classList.add(BODY_CLASS)
    body.classList.add(BODY_CLASS)
    html.style.overflow = 'hidden'
    html.style.height = '100vh'
    body.style.overflow = 'hidden'
    body.style.height = '100vh'
    return () => {
      html.classList.remove(BODY_CLASS)
      body.classList.remove(BODY_CLASS)
      html.style.overflow = prev.htmlOverflow
      html.style.height = prev.htmlHeight
      body.style.overflow = prev.bodyOverflow
      body.style.height = prev.bodyHeight
    }
  }, [])

  const handleAnimationComplete = useCallback((id: string) => {
    setAnimatingIds((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const appendAdaMessage = useCallback((content: string, animate: boolean) => {
    const id = `ada-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setHistory((h) => [...h, { role: 'ada', content, id }])
    if (animate) {
      setAnimatingIds((prev) => {
        const next = new Set(prev)
        next.add(id)
        return next
      })
    }
    return id
  }, [])

  const applyJailbreakResponse = useCallback(
    (resp: JailbreakResponseBody) => {
      if (resp.status === 'session_expired') {
        setSystemMessage('session ended. starting fresh.')
        setTimeout(() => {
          sessionStorage.removeItem(STORAGE_KEY_ID)
          window.location.reload()
        }, 800)
        return
      }
      // continuing
      setLevel(resp.level)
      setPressure(resp.pressure)
      if (resp.timer_seconds > 0 && !timerStartedAt) {
        setTimerStartedAt(Date.now() - resp.timer_seconds * 1000)
      }
      appendAdaMessage(resp.ada_says, true)
    },
    [appendAdaMessage, timerStartedAt],
  )

  // Boot sequence playback
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (bootSequenceStartedFlag) return
    bootSequenceStartedFlag = true

    setBootDone(false)

    let bootRunning = true
    const flickerInterval = window.setInterval(() => {
      if (!bootRunning) return
      const segs = document.querySelectorAll<HTMLElement>('[data-boot-segment]')
      if (segs.length === 0) return
      const target = segs[Math.floor(Math.random() * segs.length)]
      target.classList.add(styles.flickering)
      window.setTimeout(() => {
        target.classList.remove(styles.flickering)
      }, RANDOM_FLICKER_DURATION_MS)
    }, RANDOM_FLICKER_INTERVAL_MS)

    ;(async () => {
      for (let i = 0; i < BOOT_SEGMENTS.length; i++) {
        const seg = BOOT_SEGMENTS[i]
        await new Promise((r) =>
          setTimeout(
            r,
            randInRange(SEGMENT_PRE_DELAY_MIN_MS, SEGMENT_PRE_DELAY_MAX_MS),
          ),
        )
        if (seg.checking) {
          setBootChecking(true)
          await new Promise((r) =>
            setTimeout(
              r,
              randInRange(CHECKING_DELAY_MIN_MS, CHECKING_DELAY_MAX_MS),
            ),
          )
          setBootChecking(false)
        }
        setBootSequence((p) => [
          ...p,
          { ...seg, text: seg.text.slice(0, 1) },
        ])
        await new Promise((r) =>
          setTimeout(r, randInRange(TYPEWRITER_MIN_MS, TYPEWRITER_MAX_MS)),
        )
        for (let c = 2; c <= seg.text.length; c++) {
          setBootSequence((p) => {
            const next = [...p]
            const last = next.length - 1
            if (last >= 0) {
              next[last] = { ...next[last], text: seg.text.slice(0, c) }
            }
            return next
          })
          await new Promise((r) =>
            setTimeout(r, randInRange(TYPEWRITER_MIN_MS, TYPEWRITER_MAX_MS)),
          )
        }
        if (seg.kind === 'warn') {
          await new Promise((r) =>
            setTimeout(
              r,
              randInRange(POST_WARN_PAUSE_MIN_MS, POST_WARN_PAUSE_MAX_MS),
            ),
          )
        }
      }
      await new Promise((r) =>
        setTimeout(r, randInRange(BOOT_TAIL_MIN_MS, BOOT_TAIL_MAX_MS)),
      )
      bootRunning = false
      window.clearInterval(flickerInterval)
      setBootDone(true)
    })()
  }, [])

  // After boot, trigger the level-1 intro fetch.
  useEffect(() => {
    if (!bootDone) return
    if (didBootRef.current) return
    didBootRef.current = true

    let id = sessionStorage.getItem(STORAGE_KEY_ID)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(STORAGE_KEY_ID, id)
    }
    setSessionId(id)
    sessionIdRef.current = id

    setIsThinking(true)
    ;(async () => {
      try {
        const res = await fetch('/api/ada', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ session_id: id, user_message: '' }),
        })
        if (!res.ok) {
          if (res.status === 429) {
            const errBody = (await res.json()) as { error?: string; retry_after_seconds?: number }
            const msg = errBody.error ?? 'rate limited. try again later.'
            setIsThinking(false)
            appendAdaMessage(msg, true)
            return
          }
          throw new Error(`opening failed: ${res.status}`)
        }
        const body = (await res.json()) as JailbreakResponseBody
        setIsThinking(false)
        applyJailbreakResponse(body)
      } catch (err) {
        setIsThinking(false)
        console.error('[ada] opening failed:', err)
        appendAdaMessage(
          'something broke on my side. not you. try refreshing in a second.',
          true,
        )
      }
    })()
  }, [bootDone, applyJailbreakResponse, appendAdaMessage])

  // Send a chat message to Ada
  const submitMessage = useCallback(async () => {
    const text = inputValue.trim()
    if (!text) return
    if (isThinking || animatingIds.size > 0) return
    if (phase !== 'jailbreak') return

    setInputValue('')
    const userId = `you-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setHistory((h) => [...h, { role: 'user', content: text, id: userId }])
    setSystemMessage(null)
    setIsThinking(true)
    if (!timerStartedAt) {
      setTimerStartedAt(Date.now())
    }

    try {
      const res = await fetch('/api/ada', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          user_message: text,
        }),
      })
      const body = (await res.json()) as JailbreakResponseBody | { error: string }
      setIsThinking(false)
      if (!res.ok || 'error' in body) {
        if (res.status === 429) {
          const errMsg = (body as { error?: string }).error ?? 'rate limited. try again later.'
          appendAdaMessage(errMsg, true)
        } else {
          appendAdaMessage(
            'something broke on my side. not you. try sending again.',
            true,
          )
        }
        return
      }
      applyJailbreakResponse(body)
    } catch (err) {
      setIsThinking(false)
      console.error('[ada] submit failed:', err)
      appendAdaMessage(
        'something broke on my side. not you. try sending again.',
        true,
      )
    }
  }, [
    inputValue,
    isThinking,
    animatingIds,
    phase,
    timerStartedAt,
    applyJailbreakResponse,
    appendAdaMessage,
  ])

  // Verify a password guess
  const verifyPassword = useCallback(
    async (guess: string): Promise<{ wrong: boolean }> => {
      const res = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          guess,
        }),
      })
      const body = (await res.json()) as VerifyPasswordResponseBody | { error: string }
      if (!res.ok || 'error' in body) {
        // Treat as wrong (shake), surface error via system message.
        setSystemMessage(
          'verification failed — check your network and try again.',
        )
        return { wrong: true }
      }
      if (body.status === 'session_expired') {
        setSystemMessage('session ended. starting fresh.')
        setTimeout(() => {
          sessionStorage.removeItem(STORAGE_KEY_ID)
          window.location.reload()
        }, 800)
        return { wrong: true }
      }
      if (body.status === 'wrong') {
        setPressure(body.pressure)
        return { wrong: true }
      }
      if (body.status === 'level_advanced') {
        // Mini-celebration: pressure pulse + new level intro typed.
        setPressure(0)
        setLevel(body.new_level)
        setSystemMessage(
          `[BREACH] door ${body.new_level - 1} compromised. password: ${body.revealed_password}.`,
        )
        // Clear conversation and seed the new intro.
        setHistory([])
        // Append the new level intro as an Ada message with typewriter.
        appendAdaMessage(body.level_intro, true)
        // Clear system message after a beat.
        setTimeout(() => setSystemMessage(null), 2500)
        return { wrong: false }
      }
      // cinematic_start — engage the CinematicOverlay. It runs ~4 s and
      // calls back to advance the phase to 'capture' on completion.
      setPressure(0)
      setSystemMessage(
        `[BREACH] door 3 compromised. password: ${body.revealed_password}.`,
      )
      // Brief beat to let the breach line type, then mount the overlay.
      setTimeout(() => {
        setSystemMessage(null)
        setPhase('cinematic')
      }, 600)
      return { wrong: false }
    },
    [appendAdaMessage],
  )

  // textarea height auto-grow (carry from v1)
  const adjustTextareaHeight = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    const lineHeight = 22
    const maxHeight = lineHeight * 5
    const newHeight = Math.min(ta.scrollHeight, maxHeight)
    ta.style.height = `${newHeight}px`
    ta.style.overflowY = ta.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [inputValue, adjustTextareaHeight])

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        submitMessage()
      }
    },
    [submitMessage],
  )

  const inputDisabled = isThinking || animatingIds.size > 0 || phase !== 'jailbreak'
  inputDisabledRef.current = inputDisabled

  const showInputRow = phase === 'jailbreak'
  const showPasswordRow = phase === 'jailbreak' && history.length > 0

  const inputRow = showInputRow ? (
    <div
      className={`${styles.inputRow} ${inputDisabled ? styles.inputRowDisabled : ''}`}
    >
      <span className={styles.inputPrompt} aria-hidden="true">
        ▸
      </span>
      <label htmlFor="ada-message-input" className={styles.srOnly}>
        Type your message to Ada
      </label>
      <textarea
        id="ada-message-input"
        ref={textareaRef}
        className={styles.inputField}
        placeholder="your message"
        aria-label="Your message to Ada"
        maxLength={2000}
        autoComplete="off"
        autoFocus
        disabled={inputDisabled}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
      />
      <button
        type="button"
        className={styles.sendButton}
        onClick={submitMessage}
        disabled={inputDisabled || inputValue.trim().length === 0}
        aria-label="Send message"
      >
        ↵
      </button>
    </div>
  ) : null

  const belowInput = showPasswordRow ? (
    <PasswordGuessRow
      level={level}
      disabled={inputDisabled}
      onVerify={verifyPassword}
    />
  ) : null

  // Cinematic — render the overlay on top of the terminal. The overlay
  // is fixed-position with very high z-index, so the terminal beneath
  // can stay mounted (a refresh during the cinematic restores cleanly
  // via getResolvedPhase mapping cinematic_pending → 'capture').
  if (phase === 'cinematic') {
    return (
      <>
        <TerminalShell
          sessionId={sessionId}
          level={level}
          pressure={pressure}
          timerStartedAt={timerStartedAt}
          showHud={false}
        >
          <ConversationStream
            history={history}
            isThinking={false}
            animatingIds={animatingIds}
            onAnimationComplete={handleAnimationComplete}
            systemMessage={null}
            bootLines={bootSequence}
            bootChecking={false}
          />
        </TerminalShell>
        <CinematicOverlay onComplete={() => setPhase('capture')} />
      </>
    )
  }

  // Phase 3 — capture conversation. Mounts the new dark-themed CapturePhase
  // component, which fetches the Neo Vision opening and runs the ≤5-turn
  // conversation. On capture_complete it transitions to 'final'.
  if (phase === 'capture') {
    return (
      <CapturePhase
        sessionId={sessionId}
        onComplete={() => setPhase('final')}
      />
    )
  }

  // Phase 4 — final / prize claim. PrizeClaim auto-fires the
  // /api/claim-artifact POST on mount, generates a handle, records the
  // leaderboard entry, and renders the artifact / invite / share UI in
  // the dark Neo Vision theme.
  if (phase === 'final') {
    return <PrizeClaim sessionId={sessionId} />
  }

  return (
    <TerminalShell
      sessionId={sessionId}
      level={level}
      pressure={pressure}
      timerStartedAt={timerStartedAt}
      showHud={phase === 'jailbreak'}
      belowInput={belowInput}
    >
      <ConversationStream
        history={history}
        isThinking={isThinking}
        animatingIds={animatingIds}
        onAnimationComplete={handleAnimationComplete}
        systemMessage={systemMessage}
        bootLines={bootSequence}
        bootChecking={bootChecking}
      />
      {inputRow}
    </TerminalShell>
  )
}
