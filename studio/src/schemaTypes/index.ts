import {person} from './documents/person'
import {page} from './documents/page'
import {post} from './documents/post'
import {service} from './documents/service'
import {teamMember} from './documents/teamMember'
import {project} from './documents/project'
import {industry} from './documents/industry'
import {insightCategory} from './documents/insightCategory'
import {testimonial} from './documents/testimonial'
import {contactSubmission} from './documents/contactSubmission'
import {settings} from './singletons/settings'
import {seoSettings} from './singletons/seoSettings'
import {link} from './objects/link'
import {blockContent} from './objects/blockContent'
import button from './objects/button'
import {blockContentTextOnly} from './objects/blockContentTextOnly'
import {seo} from './objects/seo'
import {list} from './objects/list'
import {homeHero} from './objects/home/hero'
import {cta} from './objects/home/cta'
import {methodology} from './objects/home/methodology'
import {origin} from './objects/home/origin'
import {portfolio} from './objects/home/portfolio'
import {pricing} from './objects/home/pricing'
import {signature} from './objects/home/signature'
import {signature2} from './objects/home/signature2'
import {story} from './objects/home/story'
import {team} from './objects/home/team'
import {testimonials} from './objects/home/testimonials'
import {whatWeDo} from './objects/home/whatWeDo'
import {why} from './objects/home/why'
import {faq} from './objects/faq'
import {pageHero} from './objects/pageHero'
import {contactHero} from './objects/contact/contactHero'
import {cookieSettings} from './objects/cookieSettings'
import {booking} from './objects/contact/booking'
import {engineeringServices} from './objects/service/engineering'
import {serviceHero} from './objects/service/serviceHero'
import {aiServices} from './objects/service/ai'
import {industries} from './objects/service/industries'
import {reality} from './objects/service/reality'
import {compare} from './objects/service/compare'
import {whyRomania} from './objects/service/whyRomania'
import {portfolioFeatured} from './objects/portfolio/portfolioFeatured'
import {portfolioGrid} from './objects/portfolio/portfolioGrid'
import {portfolioCta} from './objects/portfolio/portfolioCta'
import {portfolioMetrics} from './objects/portfolio/portfolioMetrics'
import {insightsGrid} from './objects/insights/insightsGrid'
import {insightBlock} from './objects/insights/insightBlock'
import {studyHeroImage} from './objects/study/studyHeroImage'
import {studyHero} from './objects/study/studyHero'
import {studyChallenge} from './objects/study/studyChallenge'
import {studyApproach} from './objects/study/studyApproach'
import {studyKeyWins} from './objects/study/studyKeyWins'
import {studyWhatWeBuilt} from './objects/study/studyWhatWeBuilt'
import {studyNumbers} from './objects/study/studyNumbers'
import {studyTestimonial} from './objects/study/studyTestimonial'
import {studyTechStack} from './objects/study/studyTechStack'
import {studyMoreLikeThis} from './objects/study/studyMoreLikeThis'
import {studyClosingCta} from './objects/study/studyClosingCta'
import {isThisForYou} from './objects/service/isThisForYou'
import {soundFamiliar} from './objects/service/soundFamiliar'
import {serviceNavigator} from './objects/service/serviceNavigator'
import {steps} from './objects/service/steps'
import {awards} from './objects/about/awards'
import {place} from './objects/about/place'
import {press} from './objects/about/press'
import {techStack} from './objects/about/techStack'
import {freeResources} from './objects/resources/freeResources'
// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/studio/schema-types

export const schemaTypes = [
  // Singletons
  settings,
  seoSettings,
  // Documents
  page,
  post,
  person,
  service,
  teamMember,
  project,
  industry,
  insightCategory,
  testimonial,
  contactSubmission,
  // Objects
  button,
  blockContent,
  blockContentTextOnly,
  seo,
  link,
  list,
  pageHero,
  contactHero,
  cookieSettings,
  booking,
  homeHero,
  cta,
  methodology,
  origin,
  portfolio,
  pricing,
  signature,
  signature2,
  story,
  team,
  testimonials,
  whatWeDo,
  why,
  faq,
  engineeringServices,
  serviceHero,
  aiServices,
  industries,
  reality,
  compare,
  whyRomania,
  portfolioFeatured,
  portfolioGrid,
  portfolioCta,
  portfolioMetrics,
  insightsGrid,
  insightBlock,
  studyHeroImage,
  studyHero,
  studyChallenge,
  studyApproach,
  studyKeyWins,
  studyWhatWeBuilt,
  studyNumbers,
  studyTestimonial,
  studyTechStack,
  studyMoreLikeThis,
  awards,
  place,
  press,
  techStack,
  studyClosingCta,
  freeResources,
  isThisForYou,
  soundFamiliar,
  serviceNavigator,
  steps,
]
