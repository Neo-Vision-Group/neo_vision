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
