'use client'

import { useEffect, useRef, useState } from 'react'
import cinematicStyles from './cinematic.module.css'

interface Props {
  /** Called when the cinematic finishes (parent transitions to 'capture'). */
  onComplete: () => void
}

type CinematicPhase = 'corruption' | 'collapse' | 'emergence' | 'done'

const CORRUPTION_MS = 1500
const COLLAPSE_MS = 1000
const EMERGENCE_MS = 1500

const MUTE_STORAGE_KEY = 'ada_audio_muted'

/**
 * Plays a 1.5-second white-noise burst with a soft envelope (100 ms attack,
 * 0.6 s release). Uses a one-shot AudioContext that's closed when the
 * source ends. Returns a stop function so the parent can abort early.
 */
function playStaticBurst(): () => void {
  const Ctx =
    typeof window !== 'undefined'
      ? (window.AudioContext ||
          ((window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ?? null))
      : null
  if (!Ctx) return () => {}

  let stopped = false
  let ctx: AudioContext | null = null
  try {
    ctx = new Ctx()
    const sampleRate = ctx.sampleRate
    const lengthSeconds = 1.5
    const bufferSize = Math.floor(sampleRate * lengthSeconds)
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate
      let env = 1
      if (t < 0.1) env = t / 0.1
      else if (t > 0.9) env = Math.max(0, 1 - (t - 0.9) / 0.6)
      data[i] = (Math.random() * 2 - 1) * env
    }
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const gain = ctx.createGain()
    gain.gain.value = 0.25
    src.connect(gain)
    gain.connect(ctx.destination)
    src.start()
    src.onended = () => {
      try {
        ctx?.close()
      } catch {
        /* ignore */
      }
    }
    return () => {
      if (stopped) return
      stopped = true
      try {
        src.stop()
        ctx?.close()
      } catch {
        /* ignore */
      }
    }
  } catch (err) {
    console.warn('[cinematic] audio init failed', err)
    return () => {}
  }
}

/**
 * Cinematic glitch dissolve. Three phases, total ~4 s:
 *   - corruption (1.5 s): scanline + color filter + horizontal noise bands
 *   - collapse   (1.0 s): everything fades to black
 *   - emergence  (1.5 s): white pixel grows to full screen
 *
 * Then onComplete fires and the parent transitions to phase 'capture'.
 *
 * Audio: 1.5 s white-noise burst on mount unless muted (localStorage).
 * Mute toggle in top-right corner persists the preference.
 */
export function CinematicOverlay({ onComplete }: Props) {
  const [phase, setPhase] = useState<CinematicPhase>('corruption')
  const [muted, setMuted] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.localStorage.getItem(MUTE_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  const stopAudioRef = useRef<(() => void) | null>(null)

  // Phase transitions
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('collapse'), CORRUPTION_MS)
    const t2 = setTimeout(() => setPhase('emergence'), CORRUPTION_MS + COLLAPSE_MS)
    const t3 = setTimeout(() => {
      setPhase('done')
      onComplete()
    }, CORRUPTION_MS + COLLAPSE_MS + EMERGENCE_MS)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onComplete])

  // Audio burst on mount (unless muted)
  useEffect(() => {
    if (muted) return
    stopAudioRef.current = playStaticBurst()
    return () => {
      stopAudioRef.current?.()
    }
    // muted intentionally not in deps — toggling mid-cinematic shouldn't
    // restart the audio, only future runs should respect it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleToggleMute = () => {
    setMuted((m) => {
      const next = !m
      try {
        window.localStorage.setItem(MUTE_STORAGE_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      // If toggling on mid-burst, stop the audio.
      if (next) {
        stopAudioRef.current?.()
      }
      return next
    })
  }

  if (phase === 'done') return null

  return (
    <div className={cinematicStyles.cinematicOverlay} aria-hidden="true">
      <button
        type="button"
        className={cinematicStyles.muteToggle}
        onClick={handleToggleMute}
        aria-label={muted ? 'unmute' : 'mute'}
        title={muted ? 'unmute audio' : 'mute audio'}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      {phase === 'corruption' && (
        <>
          <div className={cinematicStyles.corruptionLayer} />
          <div className={cinematicStyles.corruptionFilter} />
          <div className={cinematicStyles.corruptionBands} />
        </>
      )}
      {phase === 'collapse' && <div className={cinematicStyles.collapseLayer} />}
      {phase === 'emergence' && (
        <div className={cinematicStyles.emergeLayer}>
          <div className={cinematicStyles.emergePixel} />
        </div>
      )}
    </div>
  )
}
