'use client'

import {SectionsWrapper} from '@/components/SectionsWrapper'
import {Button} from '@/components/partials/Button'
import {cn} from '@/lib/utils'
import {cleanStega, linkResolver, urlForImage} from '@/sanity/lib/utils'
import type {SanityImageSource} from '@sanity/image-url'
import {useEffect, useRef, useState} from 'react'
import Image from 'next/image'

type Signature2Step = {
  _key?: string
  title?: string
  highlighted?: boolean
  graphic?: SanityImageSource
}

export type Signature2Data = {
  eyebrow?: string
  headingFaded?: string
  headingBold?: string
  body?: string
  steps?: Signature2Step[]
  cta?: {
    buttonText?: string
    link?: {
      href?: string | null
      page?: string | null
      post?: string | null
    } | null
  }
}

export function Signature2({data}: {data?: Signature2Data}) {
  const cleanData = data ? cleanStega(data) : data
  const steps: Array<{
    _key?: string
    title: string
    highlighted: boolean
    graphic?: string
  }> =
    cleanData?.steps?.filter((step) => step.title?.trim()).map((step, index) => ({
      _key: step._key,
      title: step.title?.trim() ?? '',
      highlighted: Boolean(step.highlighted),
      graphic: step.graphic
        ? urlForImage(step.graphic).width(1600).fit('max').url()
        : undefined,
    }))
    ?? []

  const eyebrow = cleanData?.eyebrow?.trim()
  const headingFaded = cleanData?.headingFaded?.trim()
  const headingBold = cleanData?.headingBold?.trim()
  const body = cleanData?.body?.trim()
  const ctaLabel = cleanData?.cta?.buttonText?.trim()
  const ctaHref = linkResolver(cleanData?.cta?.link ?? undefined)

  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobileLayout, setIsMobileLayout] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      {threshold: 0.3}
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isVisible || steps.length === 0) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length)
    }, 3500)

    return () => clearInterval(interval)
  }, [isVisible, steps.length])

  // Detect mobile layout for border animation variant
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobileLayout(e.matches)
    }
    handleChange(mediaQuery)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  if (!headingFaded && !headingBold && !body && steps.length === 0 && !ctaLabel) {
    return null
  }

  return (
    <SectionsWrapper eyebrow={eyebrow}>
      <div ref={sectionRef} className="flex flex-col gap-12 md:gap-14 lg:gap-16">
        <div className="max-w-215 space-y-4 md:space-y-5">
          <h2 className="text-[30px] leading-[1.15] tracking-[-0.6px] text-foreground md:text-640 lg:text-5xl lg:tracking-[-1px]">
            {headingFaded ? (
              <span className="font-normal text-foreground/70">{headingFaded}</span>
            ) : null}
            {headingBold ? (
              <>
                {headingFaded ? <br /> : null}
                <span className="font-bold text-foreground">{headingBold}</span>
              </>
            ) : null}
          </h2>

          {body ? (
            <p className="max-w-205 text-body text-foreground/70 md:text-[18px]">
              {body}
            </p>
          ) : null}
        </div>

        {steps.length > 0 ? (
          <div className="flex flex-col gap-8 overflow-visible md:gap-10">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)_24px_minmax(0,1fr)_24px_minmax(0,1fr)] xl:gap-0">
              {steps.map((step, index) => (
                <StepRailItem
                  key={step._key ?? `signature2-step-${index}`}
                  index={index}
                  step={step}
                  showConnector={index < steps.length - 1}
                  isActive={isVisible && index === activeIndex}
                  isConnectorActive={isVisible && index + 1 <= activeIndex}
                  variant={isMobileLayout ? 'mobile' : 'desktop'}
                />
              ))}
            </div>

            {ctaLabel && ctaHref ? (
              <div className="-mx-6 px-6 -my-4 py-4 lg:-mx-8 lg:px-8 xl:-mx-16 xl:px-16">
                <Button href={ctaHref} variant="primary" className="min-h-12">
                  {ctaLabel}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </SectionsWrapper>
  )
}

/*
 * DrawBorder — animated perimeter trace using CSS scale transforms.
 *
 * DESKTOP (variant='desktop'):
 *   The draw starts from the midpoint of the LEFT (outer) edge and
 *   simultaneously travels in two directions:
 *     ① Left-side top half   → upward   (transform-origin: bottom-left)
 *     ② Left-side bot half   → downward (transform-origin: top-left)
 *     ③ Top edge             → left→right, origin: left
 *     ④ Bottom edge          → left→right, origin: left
 *     ⑤ Right-side top half  → top-right corner down to mid-right, origin: top
 *     ⑥ Right-side bot half  → bot-right corner up  to mid-right, origin: bottom
 *
 *   Timing (total ~1.0 s, eased):
 *     ①②  0 ms   → 350 ms   (left vertical halves, 0.35 s)
 *     ③④  350 ms → 750 ms   (top & bottom horizontals, 0.4 s, delay 0.35 s)
 *     ⑤⑥  750 ms → 1000 ms  (right vertical halves, 0.25 s, delay 0.75 s)
 *
 * MOBILE (variant='mobile'):
 *   The draw is "inverted" from desktop — top starts from center,
 *   verticals draw top-to-bottom, bottom draws last from edges inward:
 *     ③a Top-left half       → center→left, origin: right (center)
 *     ③b Top-right half      → center→right, origin: left (center)
 *     ① Left full edge       → top→bottom, origin: top
 *     ⑤ Right full edge      → top→bottom, origin: top
 *     ④a Bottom-left half    → left→center, origin: left (edges inward)
 *     ④b Bottom-right half   → right→center, origin: right (edges inward)
 *
 *   Timing (total ~1.0 s, eased):
 *     ③a③b       0 ms   → 300 ms  (top halves from center, 0.3 s)
 *     ①⑤         300 ms → 700 ms  (full verticals, 0.4 s, delay 0.3 s)
 *     ④a④b       700 ms → 1000 ms (bottom halves from edges, 0.3 s, delay 0.7 s)
 *
 * When isActive flips back to false the spans reset to scale 0 instantly (no transition).
 */
function DrawBorder({
  isActive,
  delayStart = 0,
  exitDelayStart = 0,
  variant = 'desktop',
}: {
  isActive: boolean
  delayStart?: number
  exitDelayStart?: number
  variant?: 'desktop' | 'mobile'
}) {
  const ease = 'cubic-bezier(0.4, 0, 0.2, 1)'
  const isMobile = variant === 'mobile'

  const seg = (
    pos: {top?: string; bottom?: string; left?: string; right?: string; width: string; height: string},
    enterOrigin: string,
    exitOrigin: string,
    enterDuration: number,
    enterDelay: number,
    exitDuration: number,
    exitDelay: number,
    axis: 'X' | 'Y',
  ) => (
    <span
      aria-hidden="true"
      className="absolute bg-brand"
      style={{
        top: pos.top,
        bottom: pos.bottom,
        left: pos.left,
        right: pos.right,
        width: pos.width,
        height: pos.height,
        transformOrigin: isActive ? enterOrigin : exitOrigin,
        transform: isActive ? 'scale(1)' : (axis === 'X' ? 'scaleX(0)' : 'scaleY(0)'),
        transition: isActive
          ? `transform ${enterDuration}ms ${ease} ${delayStart + enterDelay}ms`
          : `transform ${exitDuration}ms ${ease} ${exitDelayStart + exitDelay}ms`,
      }}
    />
  )

  // Desktop timing
  const dLeftEnterDelay = 0
  const dHorizEnterDelay = 525
  const dRightEnterDelay = 1125
  const dLeftExitDelay = 0
  const dHorizExitDelay = 300
  const dRightExitDelay = 675

  // Mobile timing: top first (center→edges), then verticals, then bottom last (edges→center)
  const mTopEnterDelay = 0
  const mVertEnterDelay = 300
  const mBottomEnterDelay = 700
  const mTopExitDelay = 0
  const mVertExitDelay = 200
  const mBottomExitDelay = 450

  const leftEnterDelay = isMobile ? mVertEnterDelay : dLeftEnterDelay
  const horizEnterDelay = isMobile ? mTopEnterDelay : dHorizEnterDelay
  const rightEnterDelay = isMobile ? mVertEnterDelay : dRightEnterDelay
  const leftExitDelay = isMobile ? mVertExitDelay : dLeftExitDelay
  const horizExitDelay = isMobile ? mTopExitDelay : dHorizExitDelay
  const rightExitDelay = isMobile ? mVertExitDelay : dRightExitDelay

  if (isMobile) {
    // Mobile: top (center→edges), verticals (top→bottom), bottom last (edges→center)
    return (
      <>
        {/* Top-left half: from center to left */}
        {seg({top: '0', left: '0', width: '50%', height: '1px'}, 'right', 'left', 300, mTopEnterDelay, 200, mTopExitDelay, 'X')}
        {/* Top-right half: from center to right */}
        {seg({top: '0', right: '0', width: '50%', height: '1px'}, 'left', 'right', 300, mTopEnterDelay, 200, mTopExitDelay, 'X')}
        {/* Left vertical - full top to bottom */}
        {seg({top: '0', left: '0', width: '1px', height: '100%'}, 'top', 'bottom', 400, mVertEnterDelay, 250, mVertExitDelay, 'Y')}
        {/* Right vertical - full top to bottom */}
        {seg({top: '0', right: '0', width: '1px', height: '100%'}, 'top', 'bottom', 400, mVertEnterDelay, 250, mVertExitDelay, 'Y')}
        {/* Bottom-left half: from left to center (edges inward) */}
        {seg({bottom: '0', left: '0', width: '50%', height: '1px'}, 'left', 'right', 300, mBottomEnterDelay, 150, mBottomExitDelay, 'X')}
        {/* Bottom-right half: from right to center (edges inward) */}
        {seg({bottom: '0', right: '0', width: '50%', height: '1px'}, 'right', 'left', 300, mBottomEnterDelay, 150, mBottomExitDelay, 'X')}
      </>
    )
  }

  // Desktop: original behavior (left edge split, full horizontals, right edge split)
  return (
    <>
      {/* ① left-side top half */}
      {seg({top: '0', left: '0', width: '1px', height: '50%'}, 'bottom left', 'top left', 525, dLeftEnterDelay, 300, dLeftExitDelay, 'Y')}
      {/* ② left-side bottom half */}
      {seg({bottom: '0', left: '0', width: '1px', height: '50%'}, 'top left', 'bottom left', 525, dLeftEnterDelay, 300, dLeftExitDelay, 'Y')}
      {/* ③ top edge */}
      {seg({top: '0', left: '0', width: '100%', height: '1px'}, 'left', 'right', 600, dHorizEnterDelay, 375, dHorizExitDelay, 'X')}
      {/* ④ bottom edge */}
      {seg({bottom: '0', left: '0', width: '100%', height: '1px'}, 'left', 'right', 600, dHorizEnterDelay, 375, dHorizExitDelay, 'X')}
      {/* ⑤ right-side top half */}
      {seg({top: '0', right: '0', width: '1px', height: '50%'}, 'top', 'top', 375, dRightEnterDelay, 225, dRightExitDelay, 'Y')}
      {/* ⑥ right-side bottom half */}
      {seg({bottom: '0', right: '0', width: '1px', height: '50%'}, 'bottom', 'bottom', 375, dRightEnterDelay, 225, dRightExitDelay, 'Y')}
    </>
  )
}

function StepRailItem({
  index,
  step,
  showConnector,
  isActive,
  isConnectorActive,
  variant = 'desktop',
}: {
  index: number
  step: {title: string; highlighted: boolean; graphic?: string}
  showConnector: boolean
  isActive: boolean
  isConnectorActive: boolean
  variant?: 'desktop' | 'mobile'
}) {
  const hasGraphic = step.highlighted && Boolean(step.graphic)
  const workCardHoverGraphic = '/images/graphic.webp'

  /*
   * Exit stagger: the background color fades out left-to-right in sync with
   * the DrawBorder exit sequence (left edges → horizontals → right edges).
   * index 0 (leftmost) exits first, each subsequent card is delayed by 150ms.
   * This creates the left-to-right uncoloring wave.
   */
  const exitDelayMs = index * 150

  return (
    <>
      <article
        className={cn(
          'relative isolate min-h-45 overflow-hidden border bg-surface p-8 md:min-h-45',
          'border-black/20 dark:border-white/20',
        )}
      >
        <DrawBorder isActive={isActive} delayStart={index > 0 ? 500 : 0} exitDelayStart={exitDelayMs} variant={variant} />
        {hasGraphic ? (
          <>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dark:hidden">
              <div className="absolute inset-0 bg-white" />
              <Image
                src={step.graphic || ''}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="absolute inset-0 object-cover mix-blend-difference"
                style={{
                  filter:
                    'brightness(0.8) sepia(1) saturate(3) hue-rotate(-30deg) contrast(1.1)',
                  opacity: 0.55,
                }}
              />
              <div className="absolute inset-0 bg-brand mix-blend-screen opacity-18" />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.45) 14%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.45) 86%, rgba(255,255,255,0.9) 100%),
                    linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.45) 12%, rgba(255,255,255,0) 24%, rgba(255,255,255,0) 76%, rgba(255,255,255,0.45) 88%, rgba(255,255,255,0.9) 100%)
                  `,
                }}
              />
            </div>

            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hidden dark:block">
              <div
                className="absolute inset-0"
                style={{background: 'linear-gradient(0deg, #9D2B03 0%, #9D2B03 100%)'}}
              />
              <Image
                src={step.graphic || ''}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="absolute inset-0 object-cover mix-blend-multiply"
                style={{
                  filter:
                    'brightness(0.78) sepia(1) saturate(4) hue-rotate(-25deg) contrast(1.05)',
                }}  
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(180deg, rgba(11,11,11,0.88) 0%, rgba(11,11,11,0.42) 16%, rgba(11,11,11,0) 32%, rgba(11,11,11,0) 68%, rgba(11,11,11,0.42) 84%, rgba(11,11,11,0.88) 100%),
                    linear-gradient(90deg, rgba(11,11,11,0.88) 0%, rgba(11,11,11,0.42) 12%, rgba(11,11,11,0) 24%, rgba(11,11,11,0) 76%, rgba(11,11,11,0.42) 88%, rgba(11,11,11,0.88) 100%)
                  `,
                }}
              />
            </div>
          </>
        ) : null}

        {!hasGraphic ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 overflow-hidden bg-white dark:bg-black"
            style={{
              opacity: isActive ? 1 : 0,
              transition: isActive
                ? 'opacity 750ms ease-out 0ms'
                : `opacity 525ms ease-out ${exitDelayMs}ms`,
            }}
          >
            <Image
              src={workCardHoverGraphic}
              alt=""
              fill
              className="absolute inset-0 object-cover invert dark:invert-0"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div
              className="absolute inset-0 mix-blend-screen dark:hidden"
              style={{background: '#ff4404'}}
            />
            <div
              className="absolute inset-0 dark:hidden"
              style={{
                background: 'linear-gradient(0deg, #f7f7f7 0%, rgba(247, 247, 247, 0.00) 68.19%)',
              }}
            />
            <div
              className="absolute inset-0 hidden dark:block"
              style={{
                background: `linear-gradient(0deg, #0F0F0F 0%, rgba(0, 0, 0, 0.00) 68.19%), linear-gradient(0deg, #FF4404 0%, #FF4404 100%), url(${workCardHoverGraphic}) lightgray 50% / cover no-repeat`,
                backgroundBlendMode: 'normal, color, normal',
              }}
            />
          </div>
        ) : null}

        <div className="flex h-full flex-col justify-between gap-10">
          <p className="font-clash text-[40px] leading-[1.2] tracking-[-2.4px] text-brand md:text-5xl md:tracking-[-2.88px]">
            {String(index + 1).padStart(2, '0')}
          </p>
          <h3 className="text-100 font-bold leading-[1.2] text-foreground">
            {step.title}
          </h3>
        </div>
      </article>

      {showConnector ? (
        <>
          {/* Horizontal connector — xl grid only */}
          <div
            aria-hidden="true"
            className="relative hidden h-px w-6 self-center overflow-hidden xl:block"
          >
            <span className="absolute inset-0 bg-black/20 dark:bg-white/20" />
            <span
              className="absolute inset-0 bg-brand origin-left"
              style={{
                transform: isConnectorActive ? 'scaleX(1)' : 'scaleX(0)',
                transition: isConnectorActive
                  ? 'transform 450ms cubic-bezier(0.4, 0, 0.2, 1) 300ms'
                  : 'none',
              }}
            />
          </div>

          {/* Vertical connector — single-column mobile only */}
          <div
            aria-hidden="true"
            className="relative -my-4 mx-auto h-12 w-px overflow-hidden md:hidden"
          >
            <span className="absolute inset-0 bg-black/20 dark:bg-white/20" />
            <span
              className="absolute inset-0 bg-brand origin-top"
              style={{
                transform: isConnectorActive ? 'scaleY(1)' : 'scaleY(0)',
                transition: isConnectorActive
                  ? 'transform 450ms cubic-bezier(0.4, 0, 0.2, 1) 300ms'
                  : 'none',
              }}
            />
          </div>
        </>
      ) : null}
    </>
  )
}
