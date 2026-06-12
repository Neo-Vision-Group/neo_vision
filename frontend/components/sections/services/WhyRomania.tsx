import {SectionsWrapper} from '@/components/SectionsWrapper'
import {PortableTextRenderer} from '@/components/partials/PortableTextRenderer'
import {cn} from '@/lib/utils'
import {cleanStega} from '@/sanity/lib/utils'
import dynamic from 'next/dynamic'
import type {PortableTextBlock} from '@portabletext/types'

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
  title?: PortableTextBlock[]
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

  if (!cleanData?.title?.length && !cleanData?.body?.length && highlights.length === 0) {
    return null
  }

  return (
    <SectionsWrapper eyebrow={eyebrow} classNameOverride="px-0 pb-24">
      <div className="flex flex-col gap-16">
        <div className="flex flex-col gap-12 px-6 lg:px-16">
          {cleanData?.title?.length ? (
            <PortableTextRenderer
              value={cleanData.title}
              className={cn(
                '[&_p]:my-0',
                '[&_p]:text-[28px]',
                '[&_p]:leading-12',
                '[&_p]:tracking-[-0.3px]',
                'md:[&_p]:text-[36px]',
                'md:[&_p]:leading-12',
                'lg:[&_p]:text-[44px]',
                'lg:[&_p]:leading-14',
                '2xl:[&_p]:text-5xl',
                '2xl:[&_p]:leading-[57.6px]',
                '2xl:[&_p]:tracking-[-1px]',
                '[&_p]:font-normal',
                '[&_p]:text-black/70 dark:[&_p]:text-[#efefefb3]',
                '[&_p:last-of-type]:font-bold [&_p:last-of-type]:text-black dark:[&_p:last-of-type]:text-white',
              )}
            />
          ) : null}

          {cleanData?.body?.length ? (
            <PortableTextRenderer
              value={cleanData.body}
              className="text-4xl leading-8 font-funnel md:text-[18px] md:leading-12"
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
                        columnIndex === 0 && 'border-b border-black/10 dark:border-white/10 md:border-b-0 md:border-r md:border-black/10 md:dark:border-white/10',
                      )}
                    >
                      <article className="group relative isolate flex flex-col gap-12 border border-black/10 bg-black/4 p-6 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-brand/40 dark:border-white/10 dark:bg-[#0F0F0F] md:p-8">
                        {highlight.stat ? (
                          <p className="font-clash text-[40px] leading-[1.2] tracking-[-2.4px] text-brand md:text-[32px] md:tracking-[-2.88px]">
                            {highlight.stat}
                          </p>
                        ) : null}
                        {highlight.description ? (
                          <p className="max-w-[22ch] text-[24px] font-bold leading-[1.2] text-foreground">
                            {highlight.description}
                          </p>
                        ) : null}
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
