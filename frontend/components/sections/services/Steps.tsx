import {SectionsWrapper} from '@/components/SectionsWrapper'
import {cleanStega} from '@/sanity/lib/utils'
import {cn} from '@/lib/utils'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Badge from '@/components/partials/Badge'

const RevealOnScroll = dynamic(
  () =>
    import('@/components/partials/motion/RevealOnScroll').then(
      (mod) => mod.RevealOnScroll,
    ),
  {ssr: false},
)

const DrawLine = dynamic(
  () =>
    import('@/components/partials/motion/DrawLine').then((mod) => mod.DrawLine),
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
        <div className="max-w-225 pl-px">
          <h2 className="font-funnel text-4xl leading-[1.15] tracking-[-0.8px] text-foreground md:text-[40px] lg:text-5xl lg:tracking-[-1px]">
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
                className="grid grid-cols-[12px_minmax(0,1fr)] gap-x-4"
              >
                <div className="relative flex flex-col items-center">
                  {/* Full-height line behind the dot */}
                  {(index > 0 || index < items.length - 1) ? (
                    <div className={cn(
                      'absolute left-1/2 -translate-x-1/2 w-px bg-black/20 dark:bg-white/20',
                      index === 0 ? 'top-[22px] md:top-[34px] bottom-0' : index === items.length - 1 ? 'top-0 bottom-[calc(100%-22px)] md:bottom-[calc(100%-34px)]' : 'top-0 bottom-0',
                    )}>
                      <DrawLine className="absolute inset-0 w-full bg-brand" start="top 80%" end="bottom 80%" />
                    </div>
                  ) : null}
                  {/* Spacer above dot */}
                  <div className="flex-none h-4 md:h-7" />
                  {/* Dot */}
                  <div className="relative z-10 h-3 w-3 shrink-0 bg-brand" />
                  {/* Spacer below dot to maintain layout height */}
                  <div className="w-px flex-1" />
                </div>

                <div className="px-0 pb-10 pl-4 md:pl-6 lg:px-8 lg:pb-14">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                      <p className="font-clash flex leading-none tracking-[-1px] text-brand md:text-[96px]">
                        {formatIndex(index)}.
                      </p>

                      <div className="flex min-w-0 flex-col justify-center">
                        {item.title ? (
                          <h4 className="font-funnel text-[24px]">
                            {item.title}
                          </h4>
                        ) : null}
                        {item.duration ? (
                          <Badge text={item.duration} showBorder={false} />
                        ) : null}
                      </div>
                    </div>

                    {item.body ? (
                      <p className="max-w-[40ch] text-[18px] leading-normal text-foreground/70">
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
              <div className="sticky top-32 overflow-hidden rounded-2.5 border border-white/10 bg-surface">
                <Image
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

