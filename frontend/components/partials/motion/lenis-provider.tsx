'use client'

import {useEffect, useRef, type ReactNode} from 'react'
import Lenis from 'lenis'

import {gsap, ScrollTrigger} from '@/components/partials/motion/gsap-setup'

declare global {
  interface Window {
    __lenis?: Lenis
  }
}

type LenisProviderProps = {
  children: ReactNode
}

export default function LenisProvider({children}: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Disable smooth scrolling if user prefers reduced motion
    if (prefersReducedMotion) {
      return
    }

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
    })

    lenisRef.current = lenis
    window.__lenis = lenis

    const updateScrollTrigger = () => ScrollTrigger.update()
    const tick = (time: number) => {
      lenis.raf(time * 1000)
    }

    lenis.on('scroll', updateScrollTrigger)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', updateScrollTrigger)
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
      window.__lenis = undefined
    }
  }, [])

  return <>{children}</>
}
