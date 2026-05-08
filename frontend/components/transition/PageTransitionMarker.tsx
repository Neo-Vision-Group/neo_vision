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

  const dispatchRef = useRef<() => void>(null as unknown as () => void)
  dispatchRef.current = () => {
    window.dispatchEvent(
      new CustomEvent(PAGE_TRANSITION_ROUTE_READY_EVENT, {
        detail: {
          routeKey,
        },
      }),
    )
  }

  useEffect(() => {
    dispatchRef.current()

    const retryTimer = window.setTimeout(() => {
      dispatchRef.current()
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
