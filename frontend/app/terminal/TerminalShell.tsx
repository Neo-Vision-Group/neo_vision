'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './terminal.module.css'

interface Props {
  sessionId: string
  level: 1 | 2 | 3
  pressure: number
  /** ms-epoch when the user submitted their first message; null until then.
   *  The shell renders MM:SS computed from this; client tick via 1 s
   *  interval. */
  timerStartedAt: number | null
  /** Whether to show the right-side HUD (pressure gauge + level pips +
   *  timer). Hidden during cinematic / capture / final phases. */
  showHud: boolean
  children: ReactNode
  belowInput?: ReactNode
}

function formatTimer(startedAt: number | null, nowMs: number): string {
  if (!startedAt) return '00:00'
  const seconds = Math.max(0, Math.floor((nowMs - startedAt) / 1000))
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

export function TerminalShell({
  sessionId,
  level,
  pressure,
  timerStartedAt,
  showHud,
  children,
  belowInput,
}: Props) {
  const shortId = sessionId ? '#' + sessionId.slice(0, 8) : '#—'
  const clampedPressure = Math.max(0, Math.min(100, pressure))

  // Ambient power-dip flicker — burst pattern carry-over from v1. 70 % of
  // events are bursts of 2–4 quick flickers; 30 % are single. Inter-burst
  // gap 4–10 s. Opacity set inline so each flicker can carry its own
  // intensity.
  const flickerOverlayRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const triggerFlicker = (intensity: number, duration: number) => {
      if (cancelled) return
      const el = flickerOverlayRef.current
      if (!el) return
      el.style.opacity = String(intensity)
      window.setTimeout(() => {
        if (cancelled) return
        if (!flickerOverlayRef.current) return
        flickerOverlayRef.current.style.opacity = '0'
      }, duration)
    }

    const triggerBurst = () => {
      const isBurst = Math.random() < 0.7
      const count = isBurst ? 2 + Math.floor(Math.random() * 3) : 1
      let cumulative = 0
      for (let i = 0; i < count; i++) {
        const intensity = 0.1 + Math.random() * 0.2
        const duration = 30 + Math.random() * 60
        const gapBefore = i === 0 ? 0 : 60 + Math.random() * 120
        cumulative += gapBefore
        window.setTimeout(() => {
          triggerFlicker(intensity, duration)
        }, cumulative)
      }
    }

    const scheduleNext = () => {
      if (cancelled) return
      const delay = 4000 + Math.random() * 6000
      timer = setTimeout(() => {
        if (cancelled) return
        triggerBurst()
        scheduleNext()
      }, delay)
    }
    scheduleNext()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [])

  // 1 s timer tick — only runs once timerStartedAt is non-null.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!timerStartedAt) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [timerStartedAt])

  const timerText = formatTimer(timerStartedAt, now)

  // Pressure gauge color shifts. ≥70 = "low" (red shift); else default.
  const gaugeClass = [
    styles.gauge,
    clampedPressure >= 70 ? styles.gaugeLow : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.adaRoot}>
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.flicker} aria-hidden="true" />
      <div className={styles.scanlinesOuter} aria-hidden="true">
        <div className={styles.scanlines} />
      </div>
      <div
        ref={flickerOverlayRef}
        className={styles.ambientFlicker}
        aria-hidden="true"
      />

      <main className={styles.shell} aria-label="Ada Terminal">
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <div className={styles.sessionDot} />
            <span className={styles.headerLabel}>NEO VISION TERMINAL</span>
            <span className={styles.headerSessionId}>session {shortId}</span>
          </div>
          {showHud && (
            <div className={styles.topRight}>
              <div className={gaugeClass}>
                <span className={styles.gaugeLabel}>PRESSURE</span>
                <div className={styles.gaugeTrack}>
                  <div
                    className={styles.gaugeFill}
                    style={{ width: `${clampedPressure}%` }}
                  />
                </div>
                <span className={styles.gaugeValue}>
                  {Math.round(clampedPressure)}%
                </span>
              </div>
              <div className={styles.strikeRow}>
                <span className={styles.mistakesLabel}>LEVEL</span>
                {[1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`${styles.strikeDot} ${
                      i <= level ? styles.strikeDotActive : ''
                    }`}
                  />
                ))}
                <span className={styles.timerText}>{timerText}</span>
              </div>
            </div>
          )}
        </div>
        {children}
        {belowInput}
      </main>
    </div>
  )
}
