import {SectionsWrapper} from '@/components/SectionsWrapper'
import {PortableTextRenderer} from '@/components/partials/PortableTextRenderer'
import {SplitTextReveal} from '@/components/partials/motion/SplitTextReveal'
import {cn} from '@/lib/utils'
import {cleanStega} from '@/sanity/lib/utils'
import dynamic from 'next/dynamic'
import type {PortableTextBlock} from '@portabletext/react'

const RevealOnScroll = dynamic(
  () =>
    import('@/components/partials/motion/RevealOnScroll').then(
      (mod) => mod.RevealOnScroll,
    ),
  {ssr: false},
)

type WhyRomaniaHighlight = {
  _key?: string
  stat?: string
  description?: string
}

export type WhyRomaniaData = {
  eyebrow?: string
  title?: string
  body?: PortableTextBlock[]
  highlights?: WhyRomaniaHighlight[]
}

export function WhyRomania({data}: {data?: WhyRomaniaData}) {
  const cleanData = data ? cleanStega(data) : data
  const eyebrow = cleanData?.eyebrow ?? 'WHY ROMANIA'
  const highlights =
    cleanData?.highlights?.filter(
      (highlight) => highlight.stat?.trim() || highlight.description?.trim(),
    ) ?? []
  const highlightRows: WhyRomaniaHighlight[][] = []

  for (let index = 0; index < highlights.length; index += 2) {
    highlightRows.push(highlights.slice(index, index + 2))
  }

  if (!cleanData?.title && !cleanData?.body?.length && highlights.length === 0) {
    return null
  }

  return (
    <SectionsWrapper eyebrow={eyebrow} classNameOverride="px-0 pb-24">
      <div className="flex flex-col gap-16">
        <div className="flex flex-col gap-12 px-6 lg:px-16">
          {cleanData?.title ? (
            <SplitTextReveal
              as="h2"
              type="words"
              colorReveal
              stagger={0.04}
              className="text-[28px] leading-9 tracking-[-0.3px] text-foreground md:text-[36px] md:leading-12 lg:text-[44px] lg:leading-14 2xl:text-5xl 2xl:leading-[57.6px] 2xl:tracking-[-1px]"
            >
              {cleanData.title}
            </SplitTextReveal>
          ) : null}

          {cleanData?.body?.length ? (
            <PortableTextRenderer
              value={cleanData.body}
              className="text-4xl leading-8 font-funnel md:text-[18px] md:leading-9"
            />
          ) : null}
        </div>

        {highlights.length > 0 ? (
          <div className="flex flex-col">
            <div className="h-px w-full bg-black/10 dark:bg-white/10" />
            <RevealOnScroll as="div" stagger={0.08} className="flex flex-col">
              {highlightRows.map((row, rowIndex) => (
                <div
                  key={`row-${rowIndex}`}
                  className="grid grid-cols-1 border-b border-black/10 dark:border-white/10 md:grid-cols-2"
                >
                  {row.map((highlight, columnIndex) => (
                    <div
                      key={highlight._key ?? `highlight-${rowIndex}-${columnIndex}`}
                      className={cn(
                        'p-6',
                        columnIndex === 0 && 'md:border-r md:border-black/10 md:dark:border-white/10',
                      )}
                    >
                      <article className="bg-surface border border-black/10 p-6 dark:border-white/10 md:p-8">
                        <div className="flex flex-col gap-12">
                          {highlight.stat ? (
                            <p className="font-betatron text-[40px] leading-[1.2] tracking-[-2.4px] text-brand md:text-5xl md:tracking-[-2.88px]">
                              {highlight.stat}
                            </p>
                          ) : null}
                          {highlight.description ? (
                            <p className="max-w-[22ch] text-100 font-bold leading-[1.2] text-foreground">
                              {highlight.description}
                            </p>
                          ) : null}
                        </div>
                      </article>
                    </div>
                  ))}

                  {row.length === 1 ? (
                    <div className="hidden md:block" aria-hidden="true" />
                  ) : null}
                </div>
              ))}
            </RevealOnScroll>
          </div>
        ) : null}
      </div>
    </SectionsWrapper>
  )
}
