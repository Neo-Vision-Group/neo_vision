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
    }, 2000)

    return () => clearInterval(interval)
  }, [isVisible, steps.length])

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
          <div className="flex flex-col gap-8 md:gap-10">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)_24px_minmax(0,1fr)_24px_minmax(0,1fr)] xl:gap-0">
              {steps.map((step, index) => (
                <StepRailItem
                  key={step._key ?? `signature2-step-${index}`}
                  index={index}
                  step={step}
                  showConnector={index < steps.length - 1}
                  isActive={isVisible && index === activeIndex}
                  isConnectorActive={isVisible && index + 1 <= activeIndex}
                />
              ))}
            </div>

            {ctaLabel && ctaHref ? (
              <div>
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
 * The draw starts from the midpoint of the LEFT (outer) edge and
 * simultaneously travels in two directions:
 *   ① Left-side top half   → upward   (transform-origin: bottom-left)
 *   ② Left-side bot half   → downward (transform-origin: top-left)
 *   ③ Top edge             → left→right, origin: left
 *   ④ Bottom edge          → left→right, origin: left       (same delay as ③)
 *   ⑤ Right-side top half  → top-right corner down to mid-right, origin: top
 *   ⑥ Right-side bot half  → bot-right corner up  to mid-right, origin: bottom
 *
 * Timing (total ~1.0 s, eased):
 *   ①②  0 ms   → 350 ms   (left vertical halves, 0.35 s)
 *   ③④  350 ms → 750 ms   (top & bottom horizontals, 0.4 s, delay 0.35 s)
 *   ⑤⑥  750 ms → 1000 ms  (right vertical halves, 0.25 s, delay 0.75 s)
 *
 * When isActive flips back to false the spans reset to scale 0 instantly (no transition).
 */
function DrawBorder({isActive, delayStart = 0, exitDelayStart = 0}: {isActive: boolean; delayStart?: number; exitDelayStart?: number}) {
  const ease = 'cubic-bezier(0.4, 0, 0.2, 1)'

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

  /*
   * Exit (erase) starts from the left side — same side as the draw start.
   * Total exit ~600 ms.
   *   ①②  0 ms   → 200 ms  (left vertical halves collapse inward)
   *   ③④  200 ms → 450 ms  (horizontals retract left→right, origin: left)
   *   ⑤⑥  450 ms → 600 ms  (right vertical halves open outward)
   */
  return (
    <>
      {/* ① left-side top half: enters growing upward (origin bottom-left), exits retracting upward away from midpoint (origin top-left) */}
      {seg({top: '0', left: '0', width: '1px', height: '50%'}, 'bottom left', 'top left', 350, 0, 200, 0, 'Y')}
      {/* ② left-side bottom half: enters growing downward (origin top-left), exits retracting downward away from midpoint (origin bottom-left) */}
      {seg({bottom: '0', left: '0', width: '1px', height: '50%'}, 'top left', 'bottom left', 350, 0, 200, 0, 'Y')}
      {/* ③ top edge: enters left→right (origin left), exits erasing left→right (origin right, scaleX(0) shrinks from left) */}
      {seg({top: '0', left: '0', width: '100%', height: '1px'}, 'left', 'right', 400, 350, 250, 200, 'X')}
      {/* ④ bottom edge: same as ③ */}
      {seg({bottom: '0', left: '0', width: '100%', height: '1px'}, 'left', 'right', 400, 350, 250, 200, 'X')}
      {/* ⑤ right-side top half: enters top-down (origin top), exits retracting upward away from midpoint (origin top) */}
      {seg({top: '0', right: '0', width: '1px', height: '50%'}, 'top', 'top', 250, 750, 150, 450, 'Y')}
      {/* ⑥ right-side bottom half: enters bottom-up (origin bottom), exits retracting downward away from midpoint (origin bottom) */}
      {seg({bottom: '0', right: '0', width: '1px', height: '50%'}, 'bottom', 'bottom', 250, 750, 150, 450, 'Y')}
    </>
  )
}

function StepRailItem({
  index,
  step,
  showConnector,
  isActive,
  isConnectorActive,
}: {
  index: number
  step: {title: string; highlighted: boolean; graphic?: string}
  showConnector: boolean
  isActive: boolean
  isConnectorActive: boolean
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
        <DrawBorder isActive={isActive} delayStart={index > 0 ? 500 : 0} exitDelayStart={exitDelayMs} />
        {hasGraphic ? (
          <>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dark:hidden">
              <div className="absolute inset-0 bg-white" />
              <Image
                src={step.graphic || ''}
                alt=""
                fill
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
                ? 'opacity 500ms ease-out 0ms'
                : `opacity 350ms ease-out ${exitDelayMs}ms`,
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
          <p className="font-betatron text-[40px] leading-[1.2] tracking-[-2.4px] text-brand md:text-5xl md:tracking-[-2.88px]">
            {String(index + 1).padStart(2, '0')}.
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
                  ? 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1) 200ms'
                  : 'none',
              }}
            />
          </div>

          {/* Vertical connector — single-column mobile only */}
          <div
            aria-hidden="true"
            className="relative mx-auto h-4 w-px overflow-hidden md:hidden"
          >
            <span className="absolute inset-0 bg-black/20 dark:bg-white/20" />
            <span
              className="absolute inset-0 bg-brand origin-top"
              style={{
                transform: isConnectorActive ? 'scaleY(1)' : 'scaleY(0)',
                transition: isConnectorActive
                  ? 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1) 200ms'
                  : 'none',
              }}
            />
          </div>
        </>
      ) : null}
    </>
  )
}
