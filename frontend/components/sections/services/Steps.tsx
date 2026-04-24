import {SectionsWrapper} from '@/components/SectionsWrapper'
import {cleanStega} from '@/sanity/lib/utils'
import {cn} from '@/lib/utils'
import dynamic from 'next/dynamic'

const RevealOnScroll = dynamic(
  () =>
    import('@/components/partials/motion/RevealOnScroll').then(
      (mod) => mod.RevealOnScroll,
    ),
  {ssr: false},
)

type StepItem = {
  _key?: string
  title?: string
  duration?: string
  body?: string
}

export type StepsData = {
  eyebrow?: string
  intro?: string
  highlight?: string
  items?: StepItem[]
  visualAlt?: string
  visual?: {
    asset?: {
      url?: string
    }
  }
}

function formatIndex(index: number) {
  return String(index + 1).padStart(2, '0')
}

export function Steps({data}: {data?: StepsData}) {
  const cleanData = data ? cleanStega(data) : undefined
  const eyebrow = cleanData?.eyebrow ?? 'HOW WE BUILD IT'
  const intro = cleanData?.intro ?? 'From brief to launch in'
  const highlight = cleanData?.highlight ?? '6-14 weeks.'
  const items =
    cleanData?.items?.filter(
      (item) => item?.title?.trim() || item?.duration?.trim() || item?.body?.trim(),
    ) ?? []
  const visualUrl = cleanData?.visual?.asset?.url

  if (items.length === 0) {
    return null
  }

  return (
    <SectionsWrapper eyebrow={eyebrow} id="steps">
      <div className="flex flex-col gap-12 md:gap-16">
        <div className="max-w-[900px]">
          <h2 className="font-funnel text-[32px] leading-[1.15] tracking-[-0.8px] text-foreground md:text-[40px] lg:text-[48px] lg:tracking-[-1px]">
            <span className="text-foreground/70">{intro} </span>
            <span className="font-bold text-foreground">{highlight}</span>
          </h2>
        </div>

        <div
          className={cn(
            'grid items-start gap-8 lg:gap-12',
            visualUrl ? 'lg:grid-cols-[minmax(0,1fr)_300px]' : 'grid-cols-1',
          )}
        >
          <RevealOnScroll as="div" stagger={0.08} className="flex flex-col gap-0">
            {items.map((item, index) => (
              <article
                key={item._key ?? `${item.title ?? 'step'}-${index}`}
                className="grid grid-cols-[12px_minmax(0,1fr)] gap-x-[15px]"
              >
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 shrink-0 bg-brand" />
                  {index < items.length - 1 ? (
                    <div className="w-px flex-1 bg-black/20 dark:bg-white/20" />
                  ) : (
                    <div className="w-px flex-1 bg-transparent" />
                  )}
                </div>

                <div className="px-0 pb-10 pl-4 md:pl-6 lg:px-8 lg:pb-14">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                      <p className="font-betatron text-[44px] leading-[1] tracking-[-1px] text-brand md:text-[56px] md:leading-[1.2]">
                        {formatIndex(index)}.
                      </p>

                      <div className="flex min-w-0 flex-col items-start gap-1.5 pt-1.5">
                        {item.title ? (
                          <h3 className="font-funnel text-[24px] font-bold leading-[1.2] text-foreground">
                            {item.title}
                          </h3>
                        ) : null}
                        {item.duration ? (
                          <span className="inline-flex items-center bg-brand/20 px-2.5 py-1 text-[16px] leading-[1.2] text-foreground md:text-[18px] md:leading-[1.5]">
                            {item.duration}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {item.body ? (
                      <p className="max-w-[40ch] text-[18px] leading-[1.5] text-foreground/70">
                        {item.body}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </RevealOnScroll>

          {visualUrl ? (
            <RevealOnScroll
              as="div"
              delay={0.15}
              className="relative hidden lg:block lg:pt-1"
            >
              <div className="sticky top-32 overflow-hidden rounded-[10px] border border-white/10 bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={visualUrl}
                  alt={cleanData?.visualAlt ?? ''}
                  className="h-full w-full object-cover"
                />
              </div>
            </RevealOnScroll>
          ) : null}
        </div>
      </div>
    </SectionsWrapper>
  )
}
