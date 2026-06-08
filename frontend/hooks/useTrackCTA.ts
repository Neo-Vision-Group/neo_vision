'use client'

import { useCallback } from 'react'
import posthog from '@/lib/posthog-client'

interface CTATrackingProps {
  ctaText: string
  ctaType?: 'primary' | 'secondary' | 'tertiary'
  section?: string
  destination?: string
  page?: string
}

export function useTrackCTA() {
  const trackCTAClick = useCallback((props: CTATrackingProps) => {
    const scrollDepth = typeof window !== 'undefined' 
      ? Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)
      : 0

    posthog.capture('cta_clicked', {
      cta_text: props.ctaText,
      cta_type: props.ctaType || 'primary',
      section: props.section || 'unknown',
      destination: props.destination || '',
      page: props.page || (typeof window !== 'undefined' ? window.location.pathname : ''),
      scroll_depth: scrollDepth,
    })
  }, [])

  return { trackCTAClick }
}
