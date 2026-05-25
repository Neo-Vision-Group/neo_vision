'use client'

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from './terminal.module.css'
import type { HistoryMessage } from '@/lib/ada-types'

export interface StreamMessage extends HistoryMessage {
  id: string
}

export type BootSegmentKind = 'init' | 'warn' | 'ok' | 'ready'
export interface BootSegment {
  text: string
  kind: BootSegmentKind
  checking?: boolean
}

interface Props {
  history: StreamMessage[]
  isThinking: boolean
  animatingIds: ReadonlySet<string>
  onAnimationComplete: (id: string) => void
  systemMessage: string | null
  bootLines: BootSegment[]
  bootChecking: boolean
}

const MS_PER_CHAR = 25
const NEWLINE_PAUSE = 400
const SPINNER_FRAMES = ['|', '/', '-', '\\']
// 60 ms cycle so the spinner reads as more active during the genuine
// 3–5 s Anthropic API wait.
const SPINNER_INTERVAL_MS = 60

// v2 jailbreak ASCII header. Single persona — three Adas share the
// header chrome. 80 codepoints wide × 4 body lines + 2 corner rows.
const HEADER_WIDTH = 80
const HEADER_INNER = HEADER_WIDTH - 2
const HEADER_BODY_TEXT_WIDTH = HEADER_INNER - 2

function buildAsciiHeader(lines: string[]): string {
  const top = '╔' + '═'.repeat(HEADER_INNER) + '╗'
  const bottom = '╚' + '═'.repeat(HEADER_INNER) + '╝'
  const body = lines.map((l) => '║  ' + l.padEnd(HEADER_BODY_TEXT_WIDTH) + '║')
  return [top, ...body, bottom].join('\n')
}

const ASCII_HEADER = buildAsciiHeader([
  'NEO VISION · TERMINAL v2.0',
  'three doors. three passwords.',
  'she defends. you attack. clock is running.',
  'leaderboard at neovision.dev/terminal/leaderboard',
])

function bootSegmentClass(kind: BootSegmentKind): string {
  switch (kind) {
    case 'init':
      return styles.bootSegmentInit
    case 'warn':
      return styles.bootSegmentWarn
    case 'ok':
      return styles.bootSegmentOk
    case 'ready':
      return styles.bootSegmentReady
  }
}

function BootSpinner() {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % SPINNER_FRAMES.length)
    }, SPINNER_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])
  return (
    <span className={styles.bootSpinner} aria-hidden="true">
      {SPINNER_FRAMES[frame]}
    </span>
  )
}

function ThinkingSpinner() {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % SPINNER_FRAMES.length)
    }, SPINNER_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])
  return (
    <div className={styles.thinkingSpinner} aria-live="polite" aria-label="thinking">
      <span className={styles.spinnerLabel}>thinking</span>
      <span className={styles.spinnerChar} aria-hidden="true">
        {SPINNER_FRAMES[frame]}
      </span>
    </div>
  )
}

interface AdaLineProps {
  id: string
  content: string
  animate: boolean
  onComplete: (id: string) => void
}

function AdaLine({ id, content, animate, onComplete }: AdaLineProps) {
  const [displayed, setDisplayed] = useState(() => (animate ? 0 : content.length))
  const completedRef = useRef(!animate)

  useEffect(() => {
    if (!animate) return
    if (displayed >= content.length) {
      if (!completedRef.current) {
        completedRef.current = true
        onComplete(id)
      }
      return
    }
    const nextChar = content[displayed]
    const delay = nextChar === '\n' ? NEWLINE_PAUSE : MS_PER_CHAR
    const timer = setTimeout(() => {
      setDisplayed((n) => n + 1)
    }, delay)
    return () => clearTimeout(timer)
  }, [animate, displayed, content, id, onComplete])

  const stillTyping = displayed < content.length
  const visible = content.slice(0, displayed)

  return (
    <div className={`${styles.line} ${styles.lineAda}`}>
      {visible}
      {stillTyping && <span className={styles.cursorInline} />}
    </div>
  )
}

export function ConversationStream({
  history,
  isThinking,
  animatingIds,
  onAnimationComplete,
  systemMessage,
  bootLines,
  bootChecking,
}: Props) {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const el = bottomRef.current
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'end' })
    const raf = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })
    return () => cancelAnimationFrame(raf)
  }, [history.length, isThinking, bootLines.length, bootChecking, systemMessage])

  return (
    <div
      className={styles.terminal}
      role="log"
      aria-live="polite"
      aria-atomic="false"
      aria-label="Ada conversation"
    >
      <div className={styles.headerAsciiWrapper} aria-hidden="true">
        <pre className={styles.headerAscii}>{ASCII_HEADER}</pre>
      </div>

      {(bootLines.length > 0 || bootChecking) && (
        <div className={styles.bootLine} aria-hidden="true">
          {bootLines.map((seg, i) => (
            <Fragment key={`boot-${i}`}>
              {i > 0 && <span className={styles.bootSeparator}> · </span>}
              <span
                data-boot-segment=""
                className={`${styles.bootSegment} ${bootSegmentClass(seg.kind)}`}
              >
                {seg.text}
              </span>
            </Fragment>
          ))}
          {bootChecking && (
            <>
              {bootLines.length > 0 && <span className={styles.bootSeparator}> · </span>}
              <BootSpinner />
            </>
          )}
        </div>
      )}

      {history.map((msg) =>
        msg.role === 'ada' ? (
          <AdaLine
            key={msg.id}
            id={msg.id}
            content={msg.content}
            animate={animatingIds.has(msg.id)}
            onComplete={onAnimationComplete}
          />
        ) : (
          <div key={msg.id} className={`${styles.line} ${styles.lineYou}`}>
            {msg.content}
          </div>
        ),
      )}

      {isThinking && <ThinkingSpinner />}

      {systemMessage && (
        <div className={`${styles.line} ${styles.lineSys}`}>{systemMessage}</div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
