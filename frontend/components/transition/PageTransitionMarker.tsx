'use client'

import {useEffect} from 'react'
import {usePathname, useSearchParams} from 'next/navigation'

import {
  getRouteKey,
  PAGE_TRANSITION_ROUTE_READY_EVENT,
} from '@/lib/page-transition'

type PageTransitionMarkerProps = {
  hasHeroPattern?: boolean
}

export function PageTransitionMarker({
  hasHeroPattern = false,
}: PageTransitionMarkerProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()
  const routeKey = getRouteKey(pathname, search ? `?${search}` : '')

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(PAGE_TRANSITION_ROUTE_READY_EVENT, {
        detail: {
          hasHeroPattern,
          routeKey,
        },
      }),
    )
  }, [hasHeroPattern, routeKey])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
      data-route-has-hero-pattern={hasHeroPattern ? 'true' : 'false'}
      data-route-ready-key={routeKey}
    />
  )
}
