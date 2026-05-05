'use client'

import {
  createContext,
  type MouseEvent as ReactMouseEvent,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'

import {HeroBrandDotsSurface} from '@/components/partials/HeroBrandDotsSurface'
import {gsap} from '@/components/partials/motion/gsap-setup'
import {
  getRouteKey,
  PAGE_TRANSITION_IGNORE_ATTRIBUTE,
  PAGE_TRANSITION_ROUTE_READY_EVENT,
} from '@/lib/page-transition'

type TransitionStatus = 'idle' | 'leaving' | 'waiting-for-route' | 'entering'

type RouteMeta = {
  hasHeroPattern: boolean
  routeKey: string
}

type PendingNavigation = {
  href: string
  routeKey: string
  trigger: HTMLAnchorElement | null
}

type NavigateOptions = {
  replace?: boolean
}

type PageTransitionContextValue = {
  navigate: (href: string, options?: NavigateOptions) => boolean
  status: TransitionStatus
}

const PageTransitionContext = createContext<PageTransitionContextValue | null>(null)

const LEAD_SWEEP_DURATION = 0.9
const GRAPHIC_FADE_DURATION = 0.22
const ENTER_SETTLE_DELAY_MS = 48
const SWEEP_WIDTH = '24vw'
const SWEEP_MIN_WIDTH = 160
const SWEEP_LEFT = `calc(-${SWEEP_WIDTH} - ${SWEEP_MIN_WIDTH}px)`

function getSweepTravelDistance(element: HTMLDivElement) {
  return window.innerWidth + element.offsetWidth + SWEEP_MIN_WIDTH
}

function isPrimaryButtonClick(event: MouseEvent | ReactMouseEvent) {
  return event.button === 0
}

function shouldIgnoreAnchor(anchor: HTMLAnchorElement) {
  if (!anchor.href) return true
  if (anchor.hasAttribute('download')) return true
  if (anchor.closest(`[${PAGE_TRANSITION_IGNORE_ATTRIBUTE}]`)) return true

  const target = anchor.getAttribute('target')
  if (target && target.toLowerCase() !== '_self') {
    return true
  }

  const href = anchor.getAttribute('href')
  if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return true
  }

  return false
}

function TransitionProviderInner({children}: {children: React.ReactNode}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()
  const routeKey = getRouteKey(pathname, search ? `?${search}` : '')

  const [status, setStatus] = useState<TransitionStatus>('idle')
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const pendingNavigationRef = useRef<PendingNavigation | null>(null)
  const pendingRouteMetaRef = useRef<RouteMeta | null>(null)
  const currentRouteMetaRef = useRef<RouteMeta>({
    hasHeroPattern: false,
    routeKey,
  })
  const statusRef = useRef<TransitionStatus>('idle')
  const sweepRef = useRef<HTMLDivElement | null>(null)
  const veilRef = useRef<HTMLDivElement | null>(null)
  const scrollLockRef = useRef<string | null>(null)
  const enterTimeoutRef = useRef<number | null>(null)
  const enterFrameRef = useRef<number | null>(null)
  const waitingFallbackRef = useRef<number | null>(null)

  const syncVeilToSweep = useCallback(() => {
    if (!sweepRef.current || !veilRef.current) {
      return
    }

    const sweepBounds = sweepRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const revealedWidth = Math.max(0, Math.min(sweepBounds.left, viewportWidth))
    const rightInset = Math.max(0, viewportWidth - revealedWidth)

    gsap.set(veilRef.current, {
      clipPath: `inset(0 ${rightInset}px 0 0)`,
    })
  }, [])

  const killActiveTimeline = useCallback(() => {
    activeTimelineRef.current?.kill()
    activeTimelineRef.current = null
    gsap.killTweensOf([sweepRef.current, veilRef.current])
  }, [])

  const clearPendingEnter = useCallback(() => {
    if (enterTimeoutRef.current !== null) {
      window.clearTimeout(enterTimeoutRef.current)
      enterTimeoutRef.current = null
    }

    if (enterFrameRef.current !== null) {
      window.cancelAnimationFrame(enterFrameRef.current)
      enterFrameRef.current = null
    }
  }, [])

  const unlockScroll = useCallback(() => {
    if (scrollLockRef.current === null) {
      return
    }

    document.documentElement.style.overflow = scrollLockRef.current
    scrollLockRef.current = null
  }, [])

  const lockScroll = useCallback(() => {
    if (scrollLockRef.current !== null) {
      return
    }

    scrollLockRef.current = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
  }, [])

  const resetOverlay = useCallback(() => {
    if (!sweepRef.current || !veilRef.current) {
      return
    }

    gsap.set(sweepRef.current, {x: 0})
    gsap.set(veilRef.current, {
      autoAlpha: 0,
      clipPath: 'inset(0 100% 0 0)',
    })
  }, [])

  const clearWaitingFallback = useCallback(() => {
    if (waitingFallbackRef.current !== null) {
      window.clearTimeout(waitingFallbackRef.current)
      waitingFallbackRef.current = null
    }
  }, [])

  const finishTransition = useCallback(() => {
    clearWaitingFallback()
    pendingNavigationRef.current = null
    pendingRouteMetaRef.current = null
    statusRef.current = 'idle'
    setStatus('idle')
    unlockScroll()
    resetOverlay()
  }, [clearWaitingFallback, resetOverlay, unlockScroll])

  const runEnter = useCallback(
    (routeMeta: RouteMeta) => {
      if (!sweepRef.current || !veilRef.current) {
        finishTransition()
        return
      }

      clearPendingEnter()
      killActiveTimeline()
      pendingRouteMetaRef.current = routeMeta
      statusRef.current = 'entering'
      setStatus('entering')

      const timeline = gsap.timeline({
        defaults: {ease: 'power3.inOut'},
        onComplete: finishTransition,
      })

      timeline.to(
        veilRef.current,
        {
          duration: routeMeta.hasHeroPattern ? 0.12 : GRAPHIC_FADE_DURATION,
          opacity: 0,
          ease: 'power2.out',
        },
        routeMeta.hasHeroPattern ? 0.14 : 0.08,
      )

      activeTimelineRef.current = timeline
    },
    [clearPendingEnter, finishTransition, killActiveTimeline],
  )

  const scheduleEnter = useCallback(
    (routeMeta: RouteMeta) => {
      clearPendingEnter()

      enterTimeoutRef.current = window.setTimeout(() => {
        enterTimeoutRef.current = null
        enterFrameRef.current = window.requestAnimationFrame(() => {
          enterFrameRef.current = window.requestAnimationFrame(() => {
            enterFrameRef.current = null

            if (
              statusRef.current === 'waiting-for-route' &&
              pendingNavigationRef.current?.routeKey === routeMeta.routeKey
            ) {
              runEnter(routeMeta)
            }
          })
        })
      }, ENTER_SETTLE_DELAY_MS)
    },
    [clearPendingEnter, runEnter],
  )

  const navigate = useCallback(
    (href: string, options: NavigateOptions = {}) => {
      if (typeof window === 'undefined' || statusRef.current !== 'idle') {
        return false
      }

      const url = new URL(href, window.location.href)

      if (url.origin !== window.location.origin) {
        return false
      }

      if (!/^https?:$/.test(url.protocol)) {
        return false
      }

      const nextRouteKey = getRouteKey(url.pathname, url.search)
      const currentHash = window.location.hash
      const sameRoute = nextRouteKey === routeKey

      if (sameRoute && url.hash !== currentHash) {
        return false
      }

      if (sameRoute && url.hash === currentHash) {
        return false
      }

      if (!sweepRef.current || !veilRef.current) {
        return false
      }

      killActiveTimeline()
      lockScroll()
      pendingNavigationRef.current = {
        href: `${url.pathname}${url.search}${url.hash}`,
        routeKey: nextRouteKey,
        trigger: null,
      }
      clearPendingEnter()
      pendingRouteMetaRef.current = null
      statusRef.current = 'leaving'
      setStatus('leaving')

      const timeline = gsap.timeline({
        defaults: {ease: 'power3.inOut'},
        onComplete: () => {
          const pendingNavigation = pendingNavigationRef.current

          if (!pendingNavigation) {
            finishTransition()
            return
          }

          statusRef.current = 'waiting-for-route'
          setStatus('waiting-for-route')

          clearWaitingFallback()
          waitingFallbackRef.current = window.setTimeout(() => {
            waitingFallbackRef.current = null
            if (statusRef.current === 'waiting-for-route') {
              finishTransition()
            }
          }, 4000)

          if (options.replace) {
            router.replace(pendingNavigation.href)
          } else {
            router.push(pendingNavigation.href)
          }
        },
      })

      timeline.set(
        sweepRef.current,
        {
          x: 0,
        },
        0,
      )

      timeline.set(
        veilRef.current,
        {
          autoAlpha: 1,
          opacity: 1,
          clipPath: 'inset(0 100% 0 0)',
        },
        0,
      )

      timeline.to(
        sweepRef.current,
        {
          duration: LEAD_SWEEP_DURATION,
          x: () => getSweepTravelDistance(sweepRef.current!),
          ease: 'power1.inOut',
          onStart: syncVeilToSweep,
          onUpdate: syncVeilToSweep,
          onComplete: syncVeilToSweep,
        },
        0,
      )

      activeTimelineRef.current = timeline
      return true
    },
    [clearPendingEnter, finishTransition, killActiveTimeline, lockScroll, routeKey, router, syncVeilToSweep],
  )

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    currentRouteMetaRef.current = {
      ...currentRouteMetaRef.current,
      routeKey,
    }
  }, [routeKey])

  useEffect(() => {
    resetOverlay()
  }, [resetOverlay])

  useEffect(() => {
    function handleAnchorClick(event: MouseEvent) {
      if (event.defaultPrevented || !isPrimaryButtonClick(event)) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }

      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      const anchor = target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement) || shouldIgnoreAnchor(anchor)) {
        return
      }

      if (statusRef.current !== 'idle') {
        event.preventDefault()
        return
      }

      if (navigate(anchor.href)) {
        pendingNavigationRef.current = pendingNavigationRef.current
          ? {...pendingNavigationRef.current, trigger: anchor}
          : null
        event.preventDefault()
      }
    }

    document.addEventListener('click', handleAnchorClick, true)
    return () => document.removeEventListener('click', handleAnchorClick, true)
  }, [navigate])

  useEffect(() => {
    function handleRouteReady(event: Event) {
      const customEvent = event as CustomEvent<RouteMeta>
      const routeMeta = customEvent.detail
      currentRouteMetaRef.current = routeMeta

      if (pendingNavigationRef.current?.routeKey !== routeMeta.routeKey) {
        return
      }

      pendingRouteMetaRef.current = routeMeta

      if (statusRef.current === 'waiting-for-route') {
        scheduleEnter(routeMeta)
      }
    }

    window.addEventListener(PAGE_TRANSITION_ROUTE_READY_EVENT, handleRouteReady)
    return () =>
      window.removeEventListener(PAGE_TRANSITION_ROUTE_READY_EVENT, handleRouteReady)
  }, [scheduleEnter])

  useEffect(() => {
    if (
      statusRef.current === 'waiting-for-route' &&
      pendingNavigationRef.current?.routeKey === routeKey &&
      pendingRouteMetaRef.current
    ) {
      scheduleEnter(pendingRouteMetaRef.current)
    }
  }, [routeKey, scheduleEnter])

  useEffect(() => {
    return () => {
      clearPendingEnter()
      clearWaitingFallback()
      killActiveTimeline()
      unlockScroll()
    }
  }, [clearPendingEnter, clearWaitingFallback, killActiveTimeline, unlockScroll])

  const contextValue = useMemo<PageTransitionContextValue>(
    () => ({
      navigate,
      status,
    }),
    [navigate, status],
  )

  return (
    <PageTransitionContext.Provider value={contextValue}>
      {children}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[200] overflow-hidden"
      >
        <div ref={veilRef} className="absolute inset-0 opacity-0">
          <HeroBrandDotsSurface />
        </div>
        <div
          ref={sweepRef}
          className="absolute inset-y-0 w-[24vw] min-w-[160px] bg-[#FF3B00]"
          style={{
            left: SWEEP_LEFT,
          }}
        />
      </div>
    </PageTransitionContext.Provider>
  )
}

export function TransitionProvider({children}: {children: React.ReactNode}) {
  return (
    <Suspense fallback={<>{children}</>}>
      <TransitionProviderInner>{children}</TransitionProviderInner>
    </Suspense>
  )
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext)

  if (!context) {
    throw new Error('usePageTransition must be used within TransitionProvider')
  }

  return context
}

export function useOptionalPageTransition() {
  return useContext(PageTransitionContext)
}
