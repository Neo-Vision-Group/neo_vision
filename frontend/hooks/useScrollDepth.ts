'use client'

import { useEffect, useRef } from 'react'
import posthog from '@/lib/posthog-client'

const MILESTONES = [25, 50, 75, 100] as const

export function useScrollDepth(page?: string) {
  const reachedMilestones = useRef<Set<number>>(new Set())
  const startTime = useRef<number>(0)

  useEffect(() => {
    // Reset on page change
    reachedMilestones.current = new Set()
    startTime.current = Date.now()

    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const scrollableHeight = documentHeight - windowHeight

      if (scrollableHeight <= 0) return

      const scrollPercentage = Math.round((scrollTop / scrollableHeight) * 100)

      MILESTONES.forEach((milestone) => {
        if (scrollPercentage >= milestone && !reachedMilestones.current.has(milestone)) {
          reachedMilestones.current.add(milestone)
          
          const timeToDepth = (Date.now() - startTime.current) / 1000

          posthog.capture('scroll_depth_reached', {
            depth_percentage: milestone,
            page: page || window.location.pathname,
            time_to_depth: timeToDepth,
          })
        }
      })
    }

    // Throttle scroll events
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    
    // Check initial scroll position
    handleScroll()

    return () => {
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [page])
}
