'use client'

import {useRef} from 'react'
import {useGSAP} from '@gsap/react'
import {gsap} from './gsap-setup'
import {cn} from '../../../lib/utils'

interface DrawLineProps {
  className?: string
  /**
   * The start trigger for the scroll animation. Default is "top 80%".
   */
  start?: string
  /**
   * The end trigger for the scroll animation. Default is "bottom 20%".
   */
  end?: string
  /**
   * True for scrubbing, or a number for scrub duration. Default is true.
   */
  scrub?: boolean | number
}

export function DrawLine({
  className,
  start = 'top 80%',
  end = 'bottom 20%',
  scrub = true,
}: DrawLineProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return

      const mm = gsap.matchMedia()
      mm.add(
        {
          reduced: '(prefers-reduced-motion: reduce)',
          motion: '(prefers-reduced-motion: no-preference)',
        },
        (ctx) => {
          const reduced = ctx.conditions?.reduced
          if (reduced) {
            gsap.set(el, {scaleY: 1})
            return
          }

          gsap.fromTo(
            el,
            {scaleY: 0},
            {
              scaleY: 1,
              ease: 'none',
              transformOrigin: 'top',
              scrollTrigger: {
                trigger: el.parentElement, // Use parent to avoid 0-height calculation issues
                start,
                end,
                scrub,
                invalidateOnRefresh: true,
              },
            },
          )
        },
      )
    },
    {scope: ref, dependencies: [start, end, scrub]},
  )

  return <div ref={ref} className={cn('origin-top', className)} />
}
