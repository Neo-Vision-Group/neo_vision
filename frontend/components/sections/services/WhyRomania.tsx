import {SectionsWrapper} from '@/components/SectionsWrapper'
import {PortableTextRenderer} from '@/components/partials/PortableTextRenderer'
import {SplitTextReveal} from '@/components/partials/motion/SplitTextReveal'
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

  if (!cleanData?.title && !cleanData?.body?.length && highlights.length === 0) {
    return null
  }

  return (
    <SectionsWrapper eyebrow={eyebrow}>
      <div className="flex flex-col gap-16">
        <div className="flex flex-col gap-12">
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
              className="max-w-[70ch] [&_p]:my-0 [&_p]:text-body [&_p]:text-foreground/70 [&_p]:md:text-[18px] [&_p]:md:leading-205 [&>*+*]:mt-6"
            />
          ) : null}
        </div>

        {highlights.length > 0 ? (
          <RevealOnScroll
            as="div"
            stagger={0.08}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {highlights.map((highlight, index) => (
              <article
                key={highlight._key ?? `highlight-${index}`}
                className="border dark:border-white/10 border-black/10 bg-surface p-6 md:p-8"
              >
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
            ))}
          </RevealOnScroll>
        ) : null}
      </div>
    </SectionsWrapper>
  )
}
