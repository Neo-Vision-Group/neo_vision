'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from '@/lib/posthog-client'
import {trackPageView} from '@/lib/marketing-analytics'

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
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Get theme from document
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'

    // Capture UTM parameters
    const params = new URLSearchParams(window.location.search)
    const utmParams: Record<string, string> = {}
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']

    utmKeys.forEach((key) => {
      const value = params.get(key)
      if (value) utmParams[key] = value
    })

    const search = searchParams?.toString()
    const pagePath = search ? `${pathname}?${search}` : pathname
    const pageLocation = `${window.location.origin}${pagePath}`
    const resolvedTitle = pageTitle || document.title

    // Track page view with context
    posthog.capture('$pageview', {
      page_type: pageType || 'unknown',
      page_slug: pageSlug || pathname,
      page_title: resolvedTitle,
      has_hero_pattern: hasHeroPattern || false,
      theme,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      referrer: document.referrer,
      ...utmParams,
    })
    trackPageView({
      page_location: pageLocation,
      page_path: pagePath,
      page_title: resolvedTitle,
      page_referrer: document.referrer || undefined,
    })

    // Track campaign landing if UTM parameters present
    if (Object.keys(utmParams).length > 0) {
      posthog.capture('campaign_landing', {
        ...utmParams,
        landing_page: pathname,
        referrer: document.referrer,
      })
    }
  }, [pathname, searchParams, pageType, pageSlug, pageTitle, hasHeroPattern])

  return null
}
