'use client'

import {useEffect, useRef, type ReactNode} from 'react'
import Lenis from 'lenis'

import {gsap, ScrollTrigger} from '@/components/partials/motion/gsap-setup'

type LenisProviderProps = {
  children: ReactNode
}

export default function LenisProvider({children}: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
    })

    lenisRef.current = lenis

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
    }
  }, [])

  return <>{children}</>
}
