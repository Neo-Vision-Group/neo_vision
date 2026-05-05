import type {ArrayOptions} from 'sanity'
import {PageBuilderInput} from '../components/PageBuilderInput'

export const universalPageBuilderBlockTypes = [
  'pageHero',
  'contactHero',
  'contactForm',
  'booking',
  'homeHero',
  'cta',
  'methodology',
  'origin',
  'portfolio',
  'pricing',
  'signature',
  'signature2',
  'story',
  'team',
  'testimonials',
  'whatWeDo',
  'why',
  'engineeringServices',
  'serviceHero',
  'aiServices',
  'serviceNavigator',
  'industries',
  'reality',
  'compare',
  'steps',
  'whyRomania',
  'faq',
  'insightsGrid',
  'portfolioFeatured',
  'portfolioGrid',
  'portfolioCta',
  'portfolioMetrics',
  'awards',
  'place',
  'press',
  'techStack',
  'freeResources',
  'insightBlock',
  'soundFamiliar',
  'isThisForYou',
  'studyHeroImage',
  'studyHero',
  'studyChallenge',
  'studyApproach',
  'studyKeyWins',
  'studyWhatWeBuilt',
  'studyNumbers',
  'studyTestimonial',
  'studyTechStack',
  'studyMoreLikeThis',
  'studyClosingCta',
] as const

export const universalPageBuilderBlocks = universalPageBuilderBlockTypes.map((type) => ({type}))

export const universalPageBuilderOptions: ArrayOptions<unknown> = {
  disableActions: ['add', 'addAfter', 'addBefore'],
  insertMenu: {
    views: [
      {
        name: 'grid',
        previewImageUrl: (schemaTypeName: string) =>
          `/static/page-builder-thumbnails/${schemaTypeName}.webp`,
      },
      {name: 'list'},
    ],
  },
}

export const universalPageBuilderComponents = {
  input: PageBuilderInput,
}
