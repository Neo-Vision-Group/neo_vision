import React from 'react'
import {dataAttr} from '@/sanity/lib/utils'
import {PageBuilderSection} from '@/sanity/lib/types'
import {Hero, HeroData} from '@/components/sections/home/Hero'
import {Origin, OriginData} from '@/components/sections/home/Origin'
import {WhatWeDo, WhatWeDoData} from '@/components/sections/home/WhatWeDo'
import {Signature, SignatureData} from '@/components/sections/home/Signature'
import {Why, WhyData} from '@/components/sections/home/Why'
import {Story, StoryData} from '@/components/sections/home/Story'
import {Team, TeamData} from '@/components/sections/home/Team'
import {Methodology, MethodologyData} from '@/components/sections/home/Methodology'
import {TrustedBy, TrustedByData} from '@/components/sections/home/TrustedBy'
import {PageHero, PageHeroData} from '@/components/sections/PageHero'
import {ContactHero, ContactHeroData} from '@/components/sections/ContactHero'
import {OurWork, PortfolioData} from '@/components/sections/home/Work'
import {ClosingCta, CtaData} from '@/components/sections/home/CTA'
import {EngineeringServices, EngineeringServicesData } from '@/components/sections/services/Engineering'
import { Industries, IndustryData } from './sections/services/Industries'
import { FAQ, FaqData } from './sections/FAQ'
import { PortfolioFeatured, PortfolioFeaturedData } from '@/components/sections/portfolio/PortfolioFeatured'
import { PortfolioGrid, PortfolioGridData } from '@/components/sections/portfolio/PortfolioGrid'
import { PortfolioCta, PortfolioCtaData } from '@/components/sections/portfolio/PortfolioCta'
import { PortfolioMetrics, PortfolioMetricsData } from '@/components/sections/portfolio/Metrics'
import { StudyHeroImage, StudyHeroImageData } from '@/components/sections/study/HeroImage'
import { StudyChallenge, StudyChallengeData } from '@/components/sections/study/Challenge'
import { StudyApproach, StudyApproachData } from '@/components/sections/study/Approach'
import { StudyKeyWins, StudyKeyWinsData } from '@/components/sections/study/KeyWins'
import { StudyWhatWeBuilt, StudyWhatWeBuiltData } from '@/components/sections/study/WhatWeBuilt'
import { StudyNumbers, StudyNumbersData } from '@/components/sections/study/Numbers'
import { StudyTestimonial, StudyTestimonialData } from '@/components/sections/study/Testimonial'
import { StudyTechStack, StudyTechStackData } from '@/components/sections/study/TechStack'
import { StudyMoreLikeThis, StudyMoreLikeThisData } from '@/components/sections/study/MoreLikeThis'
import { StudyClosingCta, StudyClosingCtaData } from '@/components/sections/study/ClosingCta'
import { InsightsFeatured, InsightsFeaturedData } from '@/components/sections/insights/InsightsFeatured'
import { InsightsGrid, InsightsGridData } from '@/components/sections/insights/InsightsGrid'
import { InsightsResources, InsightsResourcesData } from '@/components/sections/insights/InsightsResources'
import { InsightsCta, InsightsCtaData } from '@/components/sections/insights/InsightsCta'
import { Booking, BookingData } from '@/components/sections/contact/Booking'

type BlockProps = {
  index: number
  block: PageBuilderSection
  pageId: string
  pageType: string
}

type BlocksType = {
  [key: string]: React.FC<BlockProps>
}

const Blocks = {
  pageHero: ({block}: BlockProps) => {
    return <PageHero data={block as any as PageHeroData} />
  },
  contactHero: ({block}: BlockProps) => {
    return <ContactHero data={block as any as ContactHeroData} />
  },
  homeHero: ({block}: BlockProps) => {
    return <Hero data={block as any as HeroData} />
  },
  origin: ({block}: BlockProps) => {
    return <Origin data={block as any as OriginData} />
  },
  whatWeDo: ({block}: BlockProps) => {
    return <WhatWeDo data={block as any as WhatWeDoData} />
  },
  signature: ({block}: BlockProps) => {
    return <Signature data={block as any as SignatureData} />
  },
  why: ({block}: BlockProps) => {
    return <Why data={block as any as WhyData} />
  },
  story: ({block}: BlockProps) => {
    return <Story data={block as any as StoryData} />
  },
  team: ({block}: BlockProps) => {
    return <Team data={block as any as TeamData} />
  },
  methodology: ({block}: BlockProps) => {
    return <Methodology data={block as any as MethodologyData} />
  },
  testimonials: ({block}: BlockProps) => {
    return <TrustedBy data={block as any as TrustedByData} />
  },
  portfolio: ({block}: BlockProps) => {
    return <OurWork data={block as any as PortfolioData} />
  },
  cta: ({block}: BlockProps) => {
    return <ClosingCta data={block as any as CtaData} />
  },
  engineeringServices: ({block}: BlockProps) => {
    return <EngineeringServices data={block as any as EngineeringServicesData} />
  },
  industries: ({block}: BlockProps) => {
    return <Industries data={block as any as IndustryData} />
  },
  faq: ({block}: BlockProps) => {
    return <FAQ data={block as any as FaqData} />
  },
  portfolioFeatured: ({block}: BlockProps) => {
    return <PortfolioFeatured data={block as any as PortfolioFeaturedData} />
  },
  portfolioGrid: ({block}: BlockProps) => {
    return <PortfolioGrid data={block as any as PortfolioGridData} />
  },
  portfolioCta: ({block}: BlockProps) => {
    return <PortfolioCta data={block as any as PortfolioCtaData} />
  },
  portfolioMetrics: ({block}: BlockProps) => {
    return <PortfolioMetrics data={block as any as PortfolioMetricsData} />
  },
  studyHeroImage: ({block}: BlockProps) => {
    return <StudyHeroImage data={block as any as StudyHeroImageData} />
  },
  studyChallenge: ({block}: BlockProps) => {
    return <StudyChallenge data={block as any as StudyChallengeData} />
  },
  studyApproach: ({block}: BlockProps) => {
    return <StudyApproach data={block as any as StudyApproachData} />
  },
  studyKeyWins: ({block}: BlockProps) => {
    return <StudyKeyWins data={block as any as StudyKeyWinsData} />
  },
  studyWhatWeBuilt: ({block}: BlockProps) => {
    return <StudyWhatWeBuilt data={block as any as StudyWhatWeBuiltData} />
  },
  studyNumbers: ({block}: BlockProps) => {
    return <StudyNumbers data={block as any as StudyNumbersData} />
  },
  studyTestimonial: ({block}: BlockProps) => {
    return <StudyTestimonial data={block as any as StudyTestimonialData} />
  },
  studyTechStack: ({block}: BlockProps) => {
    return <StudyTechStack data={block as any as StudyTechStackData} />
  },
  studyMoreLikeThis: ({block}: BlockProps) => {
    return <StudyMoreLikeThis data={block as any as StudyMoreLikeThisData} />
  },
  studyClosingCta: ({block}: BlockProps) => {
    return <StudyClosingCta data={block as any as StudyClosingCtaData} />
  },
  insightsFeatured: ({block}: BlockProps) => {
    return <InsightsFeatured data={block as any as InsightsFeaturedData} />
  },
  insightsGrid: ({block}: BlockProps) => {
    return <InsightsGrid data={block as any as InsightsGridData} />
  },
  insightsResources: ({block}: BlockProps) => {
    return <InsightsResources data={block as any as InsightsResourcesData} />
  },
  insightsCta: ({block}: BlockProps) => {
    return <InsightsCta data={block as any as InsightsCtaData} />
  },
  booking: ({block}: BlockProps) => {
    return <Booking data={block as any as BookingData} />
  }
} as BlocksType

/**
 * Used by the <PageBuilder>, this component renders a the component that matches the block type.
 */
export default function BlockRenderer({block, index, pageId, pageType}: BlockProps) {
  // Block does exist
  if (typeof Blocks[block._type] !== 'undefined') {
    return (
      <div
        key={block._key}
        data-sanity={dataAttr({
          id: pageId,
          type: pageType,
          path: `pageBuilder[_key=="${block._key}"]`,
        }).toString()}
      >
        {React.createElement(Blocks[block._type], {
          key: block._key,
          block: block,
          index: index,
          pageId: pageId,
          pageType: pageType,
        })}
      </div>
    )
  }
  // Block doesn't exist yet
  return React.createElement(
    () => (
      <div className="w-full bg-gray-100 text-center text-gray-500 p-20 rounded">
        A &ldquo;{block._type}&rdquo; block hasn&apos;t been created
      </div>
    ),
    {key: block._key},
  )
}
