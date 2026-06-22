'use client'

import {useEffect, useState} from 'react'
import {HeroBrandDotsBackground} from '@/components/partials/HeroBrandDotsBackground'
import {cn} from '@/lib/utils'
import {INTRO_SESSION_KEY} from '@/lib/intro'

const INITIAL_PROGRESS = 12
const CRAWL_TARGET = 88
const MIN_DURATION = 3000
const SETTLE_DURATION = 800
const FADE_DURATION = 600

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi)
}

export function FirstLoadIntro({className}: {className?: string}) {
  const [visible, setVisible] = useState(true)
  const [opacity, setOpacity] = useState(1)
  const [progress, setProgress] = useState(INITIAL_PROGRESS)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(INTRO_SESSION_KEY) === '1') {
        setVisible(false)
        return
      }
    } catch {
      // ignore
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let tickRaf = 0
    let settleRaf = 0
    let minTimer = 0
    let fallbackTimer = 0
    let dismissed = false
    let pageReady = false
    let minElapsed = false

    const progressRef = {current: INITIAL_PROGRESS}
    const mountedAt = performance.now()

    const finish = () => {
      setProgress(100)
      window.setTimeout(() => {
        setOpacity(0)
        window.setTimeout(() => setVisible(false), FADE_DURATION)
      }, 120)
    }

    const settle = () => {
      window.cancelAnimationFrame(tickRaf)
      if (reducedMotion) {
        finish()
        return
      }
      const start = performance.now()
      const from = progressRef.current
      const step = (now: number) => {
        const t = Math.min((now - start) / SETTLE_DURATION, 1)
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        progressRef.current = clamp(from + (100 - from) * eased, from, 100)
        setProgress(progressRef.current)
        if (t < 1) {
          settleRaf = window.requestAnimationFrame(step)
        } else {
          finish()
        }
      }
      settleRaf = window.requestAnimationFrame(step)
    }

    const tryDismiss = () => {
      if (dismissed) return
      if (!pageReady || !minElapsed) return
      dismissed = true
      window.clearTimeout(fallbackTimer)
      window.clearTimeout(minTimer)
      settle()
    }

    const onPageReady = () => {
      pageReady = true
      tryDismiss()
    }

    const onMinElapsed = () => {
      minElapsed = true
      tryDismiss()
    }

    const start = performance.now()
    let lastUpdate = 0
    const tick = (now: number) => {
      if (dismissed) return
      const elapsed = now - start
      const target = reducedMotion
        ? CRAWL_TARGET
        : clamp(
            INITIAL_PROGRESS + (CRAWL_TARGET - INITIAL_PROGRESS) * (1 - Math.exp(-elapsed / 2800)),
            INITIAL_PROGRESS,
            CRAWL_TARGET,
          )
      progressRef.current = clamp(
        progressRef.current + (target - progressRef.current) * 0.05,
        INITIAL_PROGRESS,
        CRAWL_TARGET,
      )
      if (now - lastUpdate > 50) {
        setProgress(progressRef.current)
        lastUpdate = now
      }
      tickRaf = window.requestAnimationFrame(tick)
    }

    tickRaf = window.requestAnimationFrame(tick)

    if (document.readyState === 'complete') {
      pageReady = true
    } else {
      window.addEventListener('load', onPageReady, {once: true})
    }

    const elapsed = performance.now() - mountedAt
    const remaining = Math.max(0, MIN_DURATION - elapsed)
    minTimer = window.setTimeout(onMinElapsed, remaining)
    fallbackTimer = window.setTimeout(() => {
      pageReady = true
      minElapsed = true
      tryDismiss()
    }, 10000)

    tryDismiss()

    return () => {
      dismissed = true
      window.cancelAnimationFrame(tickRaf)
      window.cancelAnimationFrame(settleRaf)
      window.clearTimeout(minTimer)
      window.clearTimeout(fallbackTimer)
      window.removeEventListener('load', onPageReady)
    }
  }, [])

  if (!visible) return null

  const pct = Math.round(progress)

  return (
    <div
      aria-busy={pct < 100}
      aria-live="polite"
      className={cn('fixed inset-0 z-120 overflow-hidden bg-background text-foreground', className)}
      style={{
        opacity,
        transition: opacity < 1 ? `opacity ${FADE_DURATION}ms cubic-bezier(0.4,0,0.2,1)` : undefined,
      }}
    >
      <HeroBrandDotsBackground />

      <div className="relative z-10 flex min-h-svh items-center justify-center px-6 py-10">
        <div className="flex w-full max-w-3xl flex-col items-center justify-center gap-8 text-center md:gap-10">
          <h1
            className="uppercase leading-[0.84] text-foreground"
            style={{
              fontFamily: 'var(--font-betatron)',
              fontSize: 'clamp(3.75rem, 11vw, 7.5rem)',
            }}
          >
            Neo Vision
          </h1>

          <div className="flex w-full max-w-xl items-center justify-center gap-4 md:gap-6">
            <div className="relative h-1 flex-1 overflow-hidden bg-foreground/10">
              <div
                className="absolute inset-y-0 left-0 bg-brand"
                style={{
                  width: `${pct}%`,
                  boxShadow: '0 0 20px 2px rgba(255,65,0,0.45)',
                  transition: 'width 300ms cubic-bezier(0.25,0.46,0.45,0.94)',
                  willChange: 'width',
                }}
              />
            </div>

            <p
              className="min-w-14 text-right uppercase leading-none tracking-[-0.06em] text-foreground md:min-w-16"
              style={{
                fontFamily: 'var(--font-clash)',
                fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
              }}
            >
              {pct}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FirstLoadIntroGate({className}: {className?: string}) {
  return <FirstLoadIntro className={className} />
}
