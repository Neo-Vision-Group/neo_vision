'use client'

import {useEffect, useRef, useState} from 'react'
import {HeroBrandDotsBackground} from '@/components/partials/HeroBrandDotsBackground'
import {cn} from '@/lib/utils'

const INITIAL_PROGRESS = 12
const MAX_PROGRESS = 88

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function FirstLoadIntro({className}: {className?: string}) {
  const [progress, setProgress] = useState(INITIAL_PROGRESS)
  const progressRef = useRef(INITIAL_PROGRESS)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frameId = 0
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const target = reducedMotion
        ? MAX_PROGRESS
        : clamp(INITIAL_PROGRESS + (MAX_PROGRESS - INITIAL_PROGRESS) * (1 - Math.exp(-elapsed / 2200)), INITIAL_PROGRESS, MAX_PROGRESS)

      const easing = reducedMotion ? 0.22 : 0.08
      progressRef.current = clamp(
        progressRef.current + (target - progressRef.current) * easing,
        INITIAL_PROGRESS,
        MAX_PROGRESS
      )
      setProgress(progressRef.current)
      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [])

  const roundedProgress = Math.round(progress)

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn('dark fixed inset-0 z-[120] overflow-hidden bg-black text-white', className)}
    >
      <div className="relative flex min-h-screen min-h-svh flex-col bg-black text-white">
        <HeroBrandDotsBackground />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,65,0,0.14),transparent_42%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.34))]" />

        <div className="relative z-10 flex min-h-screen min-h-svh items-center justify-center px-6 py-10">
          <div className="flex w-full max-w-3xl flex-col items-center justify-center gap-8 text-center md:gap-10">
            <h1 className="font-betatron text-[clamp(3.75rem,11vw,7.5rem)] uppercase leading-[0.84] tracking-[-0.07em] text-white">
              Neo Vision
            </h1>

            <div className="flex w-full max-w-xl items-center justify-center gap-4 md:gap-6">
              <div className="h-2.5 flex-1 overflow-hidden bg-white/10">
                <div
                  className="first-load-progress-bar relative h-full bg-brand shadow-[0_0_28px_rgba(255,65,0,0.45)]"
                  style={{width: `${roundedProgress}%`}}
                />
              </div>

              <p className="min-w-14 text-right font-betatron text-xl uppercase leading-none tracking-[-0.06em] text-white md:min-w-16 md:text-2xl">
                {roundedProgress}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
