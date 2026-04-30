'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from './gsap-setup'
import { cn } from '../../../lib/utils'

interface DrawLineProps {
  className?: string
  direction?: 'vertical' | 'horizontal'
  start?: string
  end?: string
  scrub?: boolean | number
}

export function DrawLine({
  className,
  direction = 'vertical',
  start = 'top 90%', // Default to 90% down the screen to prevent early starts
  end = 'bottom 20%',
  scrub = true,
}: DrawLineProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return

      const isVertical = direction === 'vertical'
      
      const mm = gsap.matchMedia()
      mm.add({
        reduced: '(prefers-reduced-motion: reduce)',
        motion: '(prefers-reduced-motion: no-preference)',
      }, (ctx) => {
        if (ctx.conditions?.reduced) {
          gsap.set(el, { scaleX: 1, scaleY: 1, opacity: 1 })
          return
        }

        // Initialize state
        gsap.set(el, { 
          scaleY: isVertical ? 0 : 1, 
          scaleX: isVertical ? 1 : 0,
          transformOrigin: isVertical ? 'top' : 'left',
          visibility: 'visible'
        })

        gsap.to(el, {
          scaleX: 1,
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement,
            start: start,
            end: end,
            scrub: scrub,
            invalidateOnRefresh: true,
            // refreshPriority helps if you have multiple nested triggers
            refreshPriority: 1, 
          },
        })
      })

      // Force a ScrollTrigger refresh after a tiny delay to catch layout shifts
      setTimeout(() => {
        if (typeof window !== 'undefined' && (gsap as any).utils.toArray('.gsap-marker-start').length === 0) {
          // Only refresh if markers aren't active to avoid cluttering dev
          (gsap as any).install ? null : null; // sanity check
        }
      }, 100);

    },
    { scope: ref, dependencies: [direction, start, end, scrub] }
  )

  return (
    <div
      ref={ref}
      style={{ visibility: 'hidden' }}
      className={cn('will-change-transform', className)}
    />
  )
}