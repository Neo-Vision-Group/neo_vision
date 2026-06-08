"use client";

import {SectionsWrapper} from '@/components/SectionsWrapper'
import {Button} from '@/components/partials/Button'
import {cleanStega} from '@/sanity/lib/utils'
import dynamic from 'next/dynamic'
import posthog from '@/lib/posthog-client'

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

  const handleDownload = async () => {
    if (!downloadUrl) return

    posthog.capture('press_kit_downloaded', {
      file_name: fileName,
      file_url: downloadUrl,
    })

    try {
      const response = await fetch(downloadUrl)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Download failed:', error)
      window.open(downloadUrl, '_blank')
    }
  }

  if (!heading && !cardTitle && !cardBody) {
    return null
  }

  return (
    <SectionsWrapper eyebrow={eyebrow}>
      <RevealOnScroll as="div" stagger={0.08} className="flex flex-col gap-12 md:gap-16">
        {heading ? (
          <div>
            <h2 className="text-[28px] leading-[1.2] tracking-[-0.4px] text-foreground md:text-[40px] lg:text-5xl lg:tracking-[-1px]">
              {heading}
            </h2>
          </div>
        ) : null}

        <div>
          <article className="group border border-brand bg-white-light dark:bg-black p-8 md:p-12 transition-all duration-300 ease-out hover:border-brand/70 hover:-translate-y-0.5">
            <div className="flex flex-col items-start gap-8">
              <div className="flex flex-col gap-3">
                {cardTitle ? (
                  <h3 className="text-[28px] leading-[1.2] tracking-[-0.4px] text-foreground md:text-4xl md:tracking-[-1px]">
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
                  onClick={handleDownload}
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
