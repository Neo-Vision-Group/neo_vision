import {SectionsWrapper} from '@/components/SectionsWrapper'
import {Button} from '@/components/partials/Button'
import {cleanStega, urlForImage} from '@/sanity/lib/utils'
import Image from 'next/image'
import dynamic from 'next/dynamic'

const RevealOnScroll = dynamic(
  () =>
    import('@/components/partials/motion/RevealOnScroll').then(
      (mod) => mod.RevealOnScroll,
    ),
  {ssr: false},
)

type AwardsLink = {
  linkType?: 'href' | 'page' | 'post'
  href?: string
  page?: string
  post?: string
  openInNewTab?: boolean
}

type AwardsCard = {
  _key?: string
  title?: string | null
  recognitions?: Array<string | null> | null
  cta?: {
    buttonText?: string | null
    link?: AwardsLink | null
  } | null
}

export type AwardsData = {
  eyebrow?: string | null
  items?: Array<AwardsCard | null> | null
  featuredTitle?: string | null
  featuredBadge?: {
    asset?: {
      _ref?: string
      url?: string
    } | null
  } | null
}

function getHref(link?: AwardsLink | null) {
  if (!link) return '#'
  if (link.linkType === 'href') return link.href || '#'
  if (link.linkType === 'page') return `/${link.page ?? ''}`
  if (link.linkType === 'post') return `/insights/${link.post ?? ''}`
  return '#'
}

export function Awards({data}: {data?: AwardsData}) {
  const cleanData = data ? cleanStega(data) : data
  const eyebrow = cleanData?.eyebrow ?? 'RECOGNISED BY'
  const items =
    cleanData?.items?.filter(
      (item) => item?.title?.trim() || item?.recognitions?.some((entry) => entry?.trim()),
    ) ?? []
  const featuredTitle = cleanData?.featuredTitle
  const badgeUrl = cleanData?.featuredBadge ? urlForImage(cleanData.featuredBadge)?.url() : null

  if (items.length === 0 && !featuredTitle) {
    return null
  }

  return (
    <SectionsWrapper eyebrow={eyebrow}>
      <RevealOnScroll as="div" stagger={0.08} className="flex flex-col gap-6">
        {items.map((item, index) => {
          const recognitions = item?.recognitions?.filter((entry) => entry?.trim()) ?? []
          const ctaHref = item?.cta?.link ? getHref(item.cta.link) : null

          return (
            <article
              key={item?._key ?? `award-${index}`}
              className="border border-white/10 bg-surface p-8 md:p-12"
            >
              <div className="flex flex-col gap-6">
                {item?.title ? (
                  <h3 className="text-[28px] leading-[1.2] tracking-[-0.4px] text-foreground md:text-deco-h4 md:tracking-[-1px]">
                    {item.title}
                  </h3>
                ) : null}

                <div className="h-px w-full bg-white/10" />

                {recognitions.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {recognitions.map((recognition, recognitionIndex) => (
                      <p
                        key={`${item?._key ?? index}-recognition-${recognitionIndex}`}
                        className="text-[20px] font-bold leading-[1.2] text-foreground md:text-6"
                      >
                        {recognition}
                      </p>
                    ))}
                  </div>
                ) : null}

                {item?.cta?.buttonText && ctaHref ? (
                  <div className="pt-2">
                    <Button
                      href={ctaHref}
                      target={item.cta.link?.openInNewTab ? '_blank' : undefined}
                      rel={item.cta.link?.openInNewTab ? 'noopener noreferrer' : undefined}
                      size="sm"
                    >
                      {item.cta.buttonText}
                    </Button>
                  </div>
                ) : null}
              </div>
            </article>
          )
        })}

        {featuredTitle ? (
          <article className="border border-white/10 bg-surface p-8 md:p-12">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <h3 className="text-[28px] leading-[1.2] tracking-[-0.4px] text-foreground md:text-deco-h4 md:tracking-[-1px]">
                {featuredTitle}
              </h3>
              {badgeUrl ? (
                <div className="relative h-30 w-30 shrink-0 md:h-38 md:w-38">
                  <Image
                    src={badgeUrl}
                    alt={featuredTitle}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : null}
            </div>
          </article>
        ) : null}
      </RevealOnScroll>
    </SectionsWrapper>
  )
}
