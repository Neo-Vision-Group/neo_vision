'use client'

import { useEffect, useRef } from 'react'
import posthog from '@/lib/posthog-client'

interface SectionVisibilityOptions {
  sectionType: string
  sectionTitle?: string
  page?: string
  threshold?: number
}

export function useSectionVisibility(options: SectionVisibilityOptions) {
  const ref = useRef<HTMLElement>(null)
  const hasTracked = useRef(false)
  const pageLoadTime = useRef<number>(Date.now())

  useEffect(() => {
    pageLoadTime.current = Date.now()
    hasTracked.current = false
  }, [options.page])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTracked.current) {
            hasTracked.current = true

            const timeToView = (Date.now() - pageLoadTime.current) / 1000
            const scrollDepth = Math.round(
              (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            )

            posthog.capture('section_viewed', {
              section_type: options.sectionType,
              section_title: options.sectionTitle || options.sectionType,
              page: options.page || window.location.pathname,
              time_to_view: timeToView,
              scroll_depth_at_view: scrollDepth,
            })
          }
        })
      },
      {
        threshold: options.threshold || 0.5, // 50% of section must be visible
        rootMargin: '0px',
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [options.sectionType, options.sectionTitle, options.page, options.threshold])

  return ref
}
