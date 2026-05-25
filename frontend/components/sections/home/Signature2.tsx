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

  return (
    <>
      <article
        className={cn(
          'relative isolate min-h-45 overflow-hidden border bg-surface p-8 md:min-h-45 transition-all duration-500 ease-out',
          isActive ? 'border-brand' : 'border-black/20 dark:border-white/20',
        )}
      >
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
            className={cn(
              'absolute inset-0 -z-10 overflow-hidden bg-white dark:bg-black transition-opacity duration-500 ease-out',
              isActive ? 'opacity-100' : 'opacity-0'
            )}
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
          <h3 className="max-w-[10ch] text-100 font-bold leading-[1.2] text-foreground">
            {step.title}
          </h3>
        </div>
      </article>

      {showConnector ? (
        <div
          aria-hidden="true"
          className={cn(
            'hidden h-px w-6 self-center xl:block transition-colors duration-500 ease-out',
            isConnectorActive ? 'bg-brand' : 'bg-black/20 dark:bg-white/20'
          )}
        />
      ) : null}
    </>
  )
}
