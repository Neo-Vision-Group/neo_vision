import React from 'react'
import {dataAttr} from '@/sanity/lib/utils'
import {PageBuilderSection} from '@/sanity/lib/types'
import {BlockErrorBoundary} from '@/components/BlockErrorBoundary'
import {Hero, HeroData} from '@/components/sections/home/Hero'
import {Origin, OriginData} from '@/components/sections/home/Origin'
import {WhatWeDo, WhatWeDoData} from '@/components/sections/home/WhatWeDo'
import {Signature, SignatureData} from '@/components/sections/home/Signature'
import {Signature2, Signature2Data} from '@/components/sections/home/Signature2'
import {Why, WhyData} from '@/components/sections/home/Why'
import {Story, StoryData} from '@/components/sections/home/Story'
import {Team, TeamData} from '@/components/sections/home/Team'
import {Methodology, MethodologyData} from '@/components/sections/home/Methodology'
import {TrustedBy, TrustedByData} from '@/components/sections/home/TrustedBy'
import {Pricing, PricingData} from '@/components/sections/home/Pricing'
import {PageHero, PageHeroData} from '@/components/sections/PageHero'
import {ContactHero, ContactHeroData} from '@/components/sections/contact/ContactHero'
import {OurWork, PortfolioData} from '@/components/sections/home/Work'
import {ClosingCta, CtaData} from '@/components/sections/home/CTA'
import {
  EngineeringServices,
  EngineeringServicesData,
} from '@/components/sections/services/Engineering'
import {ServiceHero, ServiceHeroData} from '@/components/sections/services/ServiceHero'
import {Industries, IndustryData} from './sections/services/Industries'
import {Reality, RealityData} from './sections/services/Reality'
import {Compare, CompareData} from './sections/services/Compare'
import {FAQ, FaqData} from './sections/FAQ'
import {
  PortfolioFeatured,
  PortfolioFeaturedData,
} from '@/components/sections/portfolio/PortfolioFeatured'
import {PortfolioGrid, PortfolioGridData} from '@/components/sections/portfolio/PortfolioGrid'
import {PortfolioCta, PortfolioCtaData} from '@/components/sections/portfolio/PortfolioCta'
import {PortfolioMetrics, PortfolioMetricsData} from '@/components/sections/portfolio/Metrics'
import {StudyHeroImage, StudyHeroImageData} from '@/components/sections/study/HeroImage'
import {StudyHero, StudyHeroData} from '@/components/sections/study/Hero'
import {StudyChallenge, StudyChallengeData} from '@/components/sections/study/Challenge'
import {StudyApproach, StudyApproachData} from '@/components/sections/study/Approach'
import {StudyKeyWins, StudyKeyWinsData} from '@/components/sections/study/KeyWins'
import {StudyWhatWeBuilt, StudyWhatWeBuiltData} from '@/components/sections/study/WhatWeBuilt'
import {StudyNumbers, StudyNumbersData} from '@/components/sections/study/Numbers'
import {StudyTestimonial, StudyTestimonialData} from '@/components/sections/study/Testimonial'
import {StudyTechStack, StudyTechStackData} from '@/components/sections/study/TechStack'
import {StudyMoreLikeThis, StudyMoreLikeThisData} from '@/components/sections/study/MoreLikeThis'
import {StudyClosingCta, StudyClosingCtaData} from '@/components/sections/study/ClosingCta'
import {
  InsightsFeatured,
  InsightsFeaturedData,
} from '@/components/sections/insights/InsightsFeatured'
import {InsightsGrid, InsightsGridData} from '@/components/sections/insights/InsightsGrid'
import {InsightsCta, InsightsCtaData} from '@/components/sections/insights/InsightsCta'
import {InsightBlock, InsightBlockQueryResponse} from '@/components/sections/insights/InsightBlock'
import {Booking, BookingData} from '@/components/sections/contact/Booking'
import {SoundFamiliar, SoundFamiliarData} from '@/components/sections/services/SoundFamiliar'
import {WhyRomania, WhyRomaniaData} from '@/components/sections/services/WhyRomania'
import {Awards, AwardsData} from '@/components/sections/about/Awards'
import {Place, PlaceData} from '@/components/sections/about/Place'
import {Press, PressData} from '@/components/sections/about/Press'
import {TechStacks, TechStacksData} from '@/components/sections/about/TechStacks'
import {FreeResources, FreeResourcesData} from '@/components/sections/insights/FreeResources'
import {IsThisForYou, IsThisForYouData} from '@/components/sections/services/IsThisForYou'
import {
  ServiceNavigator,
  ServiceNavigatorData,
} from '@/components/sections/services/ServiceNavigator'
import {Steps, StepsData} from '@/components/sections/services/Steps'
import {AIServices, AIServicesData} from '@/components/sections/services/AIServices'

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
    return <PageHero data={block as PageHeroData} />
  },
  contactHero: ({block}: BlockProps) => {
    return <ContactHero data={block as ContactHeroData} />
  },
  contactForm: ({block}: BlockProps) => {
    return <ContactHero data={block as ContactHeroData} />
  },
  homeHero: ({block}: BlockProps) => {
    return <Hero data={block as HeroData} />
  },
  origin: ({block}: BlockProps) => {
    return <Origin data={block as OriginData} />
  },
  whatWeDo: ({block}: BlockProps) => {
    return <WhatWeDo data={block as WhatWeDoData} />
  },
  signature: ({block}: BlockProps) => {
    return <Signature data={block as SignatureData} />
  },
  signature2: ({block}: BlockProps) => {
    return <Signature2 data={block as Signature2Data} />
  },
  why: ({block}: BlockProps) => {
    return <Why data={block as WhyData} />
  },
  story: ({block}: BlockProps) => {
    return <Story data={block as StoryData} />
  },
  team: ({block}: BlockProps) => {
    return <Team data={block as TeamData} />
  },
  methodology: ({block}: BlockProps) => {
    return <Methodology data={block as MethodologyData} />
  },
  testimonials: ({block}: BlockProps) => {
    return <TrustedBy data={block as TrustedByData} />
  },
  pricing: ({block}: BlockProps) => {
    return <Pricing data={block as PricingData} />
  },
  portfolio: ({block}: BlockProps) => {
    return <OurWork data={block as PortfolioData} />
  },
  cta: ({block}: BlockProps) => {
    return <ClosingCta data={block as CtaData} />
  },
  engineeringServices: ({block}: BlockProps) => {
    return <EngineeringServices data={block as EngineeringServicesData} />
  },
  serviceHero: ({block}: BlockProps) => {
    return <ServiceHero data={block as ServiceHeroData} />
  },
  aiServices: ({block}: BlockProps) => {
    return <AIServices data={block as AIServicesData} />
  },
  serviceNavigator: ({block}: BlockProps) => {
    return <ServiceNavigator data={block as ServiceNavigatorData} />
  },
  industries: ({block}: BlockProps) => {
    return <Industries data={block as IndustryData} />
  },
  reality: ({block}: BlockProps) => {
    return <Reality data={block as RealityData} />
  },
  compare: ({block}: BlockProps) => {
    return <Compare data={block as CompareData} />
  },
  faq: ({block}: BlockProps) => {
    return <FAQ data={block as FaqData} />
  },
  portfolioFeatured: ({block}: BlockProps) => {
    return <PortfolioFeatured data={block as PortfolioFeaturedData} />
  },
  portfolioGrid: ({block}: BlockProps) => {
    return <PortfolioGrid data={block as PortfolioGridData} />
  },
  portfolioCta: ({block}: BlockProps) => {
    return <PortfolioCta data={block as PortfolioCtaData} />
  },
  portfolioMetrics: ({block}: BlockProps) => {
    return <PortfolioMetrics data={block as PortfolioMetricsData} />
  },
  studyHeroImage: ({block}: BlockProps) => {
    return <StudyHeroImage data={block as StudyHeroImageData} />
  },
  studyHero: ({block}: BlockProps) => {
    return <StudyHero data={block as StudyHeroData} />
  },
  studyChallenge: ({block}: BlockProps) => {
    return <StudyChallenge data={block as StudyChallengeData} />
  },
  studyApproach: ({block}: BlockProps) => {
    return <StudyApproach data={block as StudyApproachData} />
  },
  studyKeyWins: ({block}: BlockProps) => {
    return <StudyKeyWins data={block as StudyKeyWinsData} />
  },
  studyWhatWeBuilt: ({block}: BlockProps) => {
    return <StudyWhatWeBuilt data={block as StudyWhatWeBuiltData} />
  },
  studyNumbers: ({block}: BlockProps) => {
    return <StudyNumbers data={block as StudyNumbersData} />
  },
  studyTestimonial: ({block}: BlockProps) => {
    return <StudyTestimonial data={block as StudyTestimonialData} />
  },
  studyTechStack: ({block}: BlockProps) => {
    return <StudyTechStack data={block as StudyTechStackData} />
  },
  studyMoreLikeThis: ({block}: BlockProps) => {
    return <StudyMoreLikeThis data={block as StudyMoreLikeThisData} />
  },
  studyClosingCta: ({block}: BlockProps) => {
    return <StudyClosingCta data={block as StudyClosingCtaData} />
  },
  insightsFeatured: ({block}: BlockProps) => {
    return <InsightsFeatured data={block as InsightsFeaturedData} />
  },
  insightsGrid: ({block}: BlockProps) => {
    return <InsightsGrid data={block as InsightsGridData} />
  },
  insightsCta: ({block}: BlockProps) => {
    return <InsightsCta data={block as InsightsCtaData} />
  },
  insightBlock: ({block}: BlockProps) => {
    return <InsightBlock data={block as InsightBlockQueryResponse} />
  },
  booking: ({block}: BlockProps) => {
    return <Booking data={block as BookingData} />
  },
  soundFamiliar: ({block}: BlockProps) => {
    return <SoundFamiliar data={block as SoundFamiliarData} />
  },
  whyRomania: ({block}: BlockProps) => {
    return <WhyRomania data={block as WhyRomaniaData} />
  },
  awards: ({block}: BlockProps) => {
    return <Awards data={block as AwardsData} />
  },
  place: ({block}: BlockProps) => {
    return <Place data={block as PlaceData} />
  },
  press: ({block}: BlockProps) => {
    return <Press data={block as PressData} />
  },
  techStack: ({block}: BlockProps) => {
    return <TechStacks data={block as TechStacksData} />
  },
  freeResources: ({block}: BlockProps) => {
    return <FreeResources data={block as FreeResourcesData} />
  },
  isThisForYou: ({block}: BlockProps) => {
    return <IsThisForYou data={block as IsThisForYouData} />
  },
  steps: ({block}: BlockProps) => {
    return <Steps data={block as StepsData} />
  },
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
        <BlockErrorBoundary blockKey={block._key} blockType={block._type}>
          {React.createElement(Blocks[block._type], {
            key: block._key,
            block: block,
            index: index,
            pageId: pageId,
            pageType: pageType,
          })}
        </BlockErrorBoundary>
      </div>
    )
  }
  // Block doesn't exist yet
  console.warn(`[BlockRenderer] Unknown block type: ${block._type}`)
  return React.createElement(
    () => (
      <div className="w-full bg-gray-100 text-center text-gray-500 p-20 rounded">
        A &ldquo;{block._type}&rdquo; block hasn&apos;t been created
      </div>
    ),
    {key: block._key},
  )
}
