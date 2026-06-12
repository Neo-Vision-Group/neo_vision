"use client"

import {useEffect, useState} from 'react'
import {useTheme} from 'next-themes'

import {SectionsWrapper} from '@/components/SectionsWrapper'
import {AnimatedBorder} from '@/components/AnimatedBorder'
import Badge from '@/components/partials/Badge'
import {Button} from '@/components/partials/Button'
import ResolvedLink from '@/components/ResolvedLink'
import ArrowRight from '@/components/icons/ArrowRight'
import {DereferencedLink} from '@/sanity/lib/types'
import {cleanStega, linkResolver} from '@/sanity/lib/utils'
import {cn} from '@/lib/utils'

type PricingLink = {
  _type?: 'link'
  linkType?: 'href' | 'page' | 'post'
  href?: string | null
  page?: string | null
  post?: string | null
  openInNewTab?: boolean | null
}

type PricingCta = {
  buttonText?: string | null
  link?: PricingLink | null
} | null

export type PricingTier = {
  _key?: string
  _type?: 'tier'
  width?: 'half' | 'full' | null
  priceLayout?: 'stacked' | 'split' | 'inline' | null
  badge?: string | null
  title?: string | null
  price?: string | null
  meta?: string | null
  description?: string | null
  ctaStyle?: 'textLink' | 'button' | null
  cta?: PricingCta
} | null

export type PricingData = {
  _key?: string
  _type?: 'pricing'
  eyebrow?: string | null
  headingPrimary?: string | null
  headingSecondary?: string | null
  tiers?: PricingTier[] | null
}

function getHref(link?: PricingLink | null) {
  const resolved = link ? linkResolver(link) : null
  return typeof resolved === 'string' ? resolved : null
}

function toResolvedLink(link?: PricingLink | null): DereferencedLink | null {
  if (!link) {
    return null
  }

  return {
    _type: 'link',
    linkType: link.linkType,
    href: link.href ?? undefined,
    page: link.page ?? undefined,
    post: link.post ?? undefined,
    openInNewTab: link.openInNewTab ?? undefined,
  }
}

function TextLink({
  label,
  link,
  isDarkTheme,
}: {
  label?: string | null
  link?: PricingLink | null
  isDarkTheme: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)

  if (!label?.trim() || !link) {
    return null
  }

  const content = (
    <>
      <AnimatedBorder isHovered={isHovered} />
      <ArrowRight
        color="currentColor"
        width={38}
        height={24}
        className="relative z-10 h-6 w-10 shrink-0"
      />
      <span className="relative z-10 font-funnel text-100 font-bold leading-[1.2]">
        {label}
      </span>
    </>
  )

  const className = cn(
    'relative inline-flex items-center gap-3 self-start px-2 py-1 transition-colors duration-200',
    isHovered ? 'text-brand' : isDarkTheme ? 'text-[#efefef]' : 'text-black',
  )
  const resolvedLink = toResolvedLink(link)

  if (resolvedLink) {
    return (
      <ResolvedLink
        link={resolvedLink}
        className={className}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        {content}
      </ResolvedLink>
    )
  }

  return (
    <div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {content}
    </div>
  )
}

function CardCta({
  tier,
  isDarkTheme,
}: {
  tier: NonNullable<PricingTier>
  isDarkTheme: boolean
}) {
  const buttonText = tier?.cta?.buttonText?.trim()
  const href = getHref(tier?.cta?.link as PricingLink | null | undefined)

  if (!buttonText || !href) {
    return null
  }

  if (tier.ctaStyle === 'button') {
    return (
      <Button
        href={href}
        target={tier.cta?.link?.openInNewTab ? '_blank' : undefined}
        rel={tier.cta?.link?.openInNewTab ? 'noopener noreferrer' : undefined}
        className="self-start"
      >
        {buttonText}
      </Button>
    )
  }

  return (
    <TextLink
      label={buttonText}
      link={tier.cta?.link as PricingLink | null | undefined}
      isDarkTheme={isDarkTheme}
    />
  )
}

function PricingCard({
  tier,
  isDarkTheme,
}: {
  tier: NonNullable<PricingTier>
  isDarkTheme: boolean
}) {
  const isFullWidth = tier?.width === 'full'
  const priceLayout = tier?.priceLayout ?? 'stacked'
  const hasBadge = Boolean(tier?.badge?.trim())

  return (
    <article
      className={cn(
        'flex h-full flex-col gap-10 border border-black/15 bg-black/4 p-8 dark:border-white/20 dark:bg-dark-light md:p-12',
        isFullWidth && 'lg:col-span-2',
      )}
    >
      <div className="flex flex-1 flex-col gap-6">
        {priceLayout === 'split' ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-funnel text-4xl leading-[1.2] tracking-[-1px] text-black dark:text-[#efefef]">
                {tier?.title}
              </h3>
              {hasBadge ? <Badge text={tier.badge!} /> : null}
            </div>
            <p className="font-clash text-[34px] leading-[1.1] tracking-[-0.04em] text-brand md:text-5xl">
              {tier?.price}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-funnel text-4xl leading-[1.2] tracking-[-1px] text-black dark:text-[#efefef]">
                {tier?.title}
              </h3>
              {hasBadge ? <Badge text={tier.badge!} /> : null}
            </div>

            {priceLayout === 'inline' ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="font-funnel text-[18px] leading-normal text-brand">
                  {tier?.price}
                </p>
                {tier?.meta ? (
                  <p className="font-funnel text-[18px] leading-normal text-black/60 dark:text-[#efefef]/60">
                    {tier.meta}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="font-clash text-[34px] leading-[1.1] tracking-[-0.04em] text-brand md:text-5xl">
                {tier?.price}
              </p>
            )}
          </div>
        )}

        {tier?.description ? (
          <p className="max-w-[62ch] whitespace-pre-line font-funnel text-[18px] leading-[1.55] text-black/65 dark:text-[#efefef]/70">
            {tier.description}
          </p>
        ) : null}
      </div>

      <CardCta tier={tier} isDarkTheme={isDarkTheme} />
    </article>
  )
}

export function Pricing({data}: {data?: PricingData}) {
  const {resolvedTheme} = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const cleanData = data ? cleanStega(data) : data
  const tiersSource = cleanData?.tiers ?? []
  const tiers = tiersSource.filter(
    (tier): tier is NonNullable<PricingTier> =>
      Boolean(tier?.title?.trim() && tier?.price?.trim()),
  )
  const isDarkTheme = !mounted || resolvedTheme === 'dark'

  if (tiers.length === 0) {
    return null
  }

  return (
    <SectionsWrapper
      id="pricing"
      eyebrow={cleanData?.eyebrow?.trim()}
    >
      <div className="flex flex-col gap-12 md:gap-16">
        {cleanData?.headingPrimary?.trim() || cleanData?.headingSecondary?.trim() ? (
          <div>
            <h2 className="max-w-225 font-funnel text-[36px] font-bold leading-[1.1] tracking-[-0.02em] text-black dark:text-[#efefef] md:text-5xl">
              {cleanData?.headingPrimary?.trim() ? (
                <span>{cleanData.headingPrimary.trim()}</span>
              ) : null}{' '}
              {cleanData?.headingSecondary?.trim() ? (
                <span className="font-normal text-black/55 dark:text-[#efefef]/55">
                  {cleanData.headingSecondary.trim()}
                </span>
              ) : null}
            </h2>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {tiers.map((tier, index) => (
            <PricingCard
              key={tier?._key ?? `${tier?.title ?? 'pricing'}-${index}`}
              tier={tier}
              isDarkTheme={isDarkTheme}
            />
          ))}
        </div>
      </div>
    </SectionsWrapper>
  )
}
