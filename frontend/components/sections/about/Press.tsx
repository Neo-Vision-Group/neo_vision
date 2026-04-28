"use client";

import {SectionsWrapper} from '@/components/SectionsWrapper'
import {Button} from '@/components/partials/Button'
import {cleanStega} from '@/sanity/lib/utils'
import dynamic from 'next/dynamic'

const RevealOnScroll = dynamic(
  () =>
    import('@/components/partials/motion/RevealOnScroll').then(
      (mod) => mod.RevealOnScroll,
    ),
  {ssr: false},
)

export type PressData = {
  eyebrow?: string | null
  heading?: string | null
  cardTitle?: string | null
  cardBody?: string | null
  ctaLabel?: string | null
  file?: {
    asset?: {
      url?: string | null
      originalFilename?: string | null
    } | null
  } | null
}

export function Press({data}: {data?: PressData}) {
  const cleanData = data ? cleanStega(data) : data
  const eyebrow = cleanData?.eyebrow ?? 'PRESS & MEDIA'
  const heading = cleanData?.heading ?? "How we're different."
  const cardTitle = cleanData?.cardTitle ?? 'Press Kit'
  const cardBody =
    cleanData?.cardBody ??
    'Brand assets, company boilerplate, founder bio, key statistics, and media contact.'
  const downloadUrl = cleanData?.file?.asset?.url ?? null
  const fileName = cleanData?.file?.asset?.originalFilename ?? 'press-kit'
  const ctaLabel = cleanData?.ctaLabel ?? 'Download press kit'

  if (!heading && !cardTitle && !cardBody) {
    return null
  }

  return (
    <SectionsWrapper eyebrow={eyebrow}>
      <RevealOnScroll as="div" stagger={0.08} className="flex flex-col gap-12 md:gap-16">
        {heading ? (
          <div className="px-0 md:px-6 lg:px-12">
            <h2 className="max-w-[12ch] text-[28px] leading-[1.2] tracking-[-0.4px] text-foreground md:text-[40px] lg:text-5xl lg:tracking-[-1px]">
              {heading}
            </h2>
          </div>
        ) : null}

        <div className="px-0 md:px-3">
          <article className="border border-brand bg-surface p-8 md:p-12">
            <div className="flex flex-col items-start gap-8">
              <div className="flex max-w-[640px] flex-col gap-3">
                {cardTitle ? (
                  <h3 className="text-[28px] leading-[1.2] tracking-[-0.4px] text-foreground md:text-deco-h4 md:tracking-[-1px]">
                    {cardTitle}
                  </h3>
                ) : null}

                {cardBody ? (
                  <p className="text-[18px] leading-normal text-foreground/70">
                    {cardBody}
                  </p>
                ) : null}
              </div>

              {downloadUrl ? (
                <Button
                  href={downloadUrl}
                  download={fileName}
                  className="w-fit"
                >
                  {ctaLabel}
                </Button>
              ) : null}
            </div>
          </article>
        </div>
      </RevealOnScroll>
    </SectionsWrapper>
  )
}
