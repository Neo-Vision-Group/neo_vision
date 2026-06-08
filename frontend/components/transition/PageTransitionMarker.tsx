'use client'

import {Suspense, useEffect, useRef} from 'react'
import {usePathname, useSearchParams} from 'next/navigation'

import {
  getRouteKey,
  PAGE_TRANSITION_ROUTE_READY_EVENT,
} from '@/lib/page-transition'

function PageTransitionMarkerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()
  const routeKey = getRouteKey(pathname, search ? `?${search}` : '')
  const dispatchedRef = useRef<string | null>(null)

  useEffect(() => {
    // Only dispatch once per unique routeKey
    if (dispatchedRef.current === routeKey) {
      return
    }
    
    dispatchedRef.current = routeKey
    
    // Check if the current page has a hero pattern by looking for the class on any hero section
    const hasHeroPattern = document.querySelector('.has-hero-pattern') !== null
    
    window.dispatchEvent(
      new CustomEvent(PAGE_TRANSITION_ROUTE_READY_EVENT, {
        detail: {
          routeKey,
          hasHeroPattern,
        },
      }),
    )
  }, [routeKey])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
      data-route-ready-key={routeKey}
    />
  )
}

export function PageTransitionMarker() {
  return (
    <Suspense fallback={null}>
      <PageTransitionMarkerInner />
    </Suspense>
  )
}
