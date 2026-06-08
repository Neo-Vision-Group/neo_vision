'use client'

import {Suspense, useEffect} from 'react'
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

  useEffect(() => {
    const dispatch = () => {
      window.dispatchEvent(
        new CustomEvent(PAGE_TRANSITION_ROUTE_READY_EVENT, {
          detail: {
            routeKey,
          },
        }),
      )
    }

    dispatch()

    const retryTimer = window.setTimeout(() => {
      dispatch()
    }, 120)

    return () => window.clearTimeout(retryTimer)
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
