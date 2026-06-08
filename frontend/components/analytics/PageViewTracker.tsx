'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import posthog from '@/lib/posthog-client'

interface PageViewTrackerProps {
  pageType?: 'home' | 'service' | 'portfolio' | 'insight' | 'contact' | 'about' | 'services' | 'insights' | 'caseStudies'
  pageSlug?: string
  pageTitle?: string
  hasHeroPattern?: boolean
}

export function PageViewTracker({ 
  pageType, 
  pageSlug, 
  pageTitle,
  hasHeroPattern 
}: PageViewTrackerProps) {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Get theme from document
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'

    // Capture UTM parameters
    const params = new URLSearchParams(window.location.search)
    const utmParams: Record<string, string> = {}
    
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
      const value = params.get(key)
      if (value) utmParams[key] = value
    })

    // Track page view with context
    posthog.capture('$pageview', {
      page_type: pageType || 'unknown',
      page_slug: pageSlug || pathname,
      page_title: pageTitle || document.title,
      has_hero_pattern: hasHeroPattern || false,
      theme,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      referrer: document.referrer,
      ...utmParams,
    })

    // Track campaign landing if UTM parameters present
    if (Object.keys(utmParams).length > 0) {
      posthog.capture('campaign_landing', {
        ...utmParams,
        landing_page: pathname,
        referrer: document.referrer,
      })
    }
  }, [pathname, pageType, pageSlug, pageTitle, hasHeroPattern])

  return null
}
