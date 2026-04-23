import {person} from './documents/person'
import {page} from './documents/page' 
import {post} from './documents/post'
import {service} from './documents/service'
import {teamMember} from './documents/teamMember'
import {project} from './documents/project'
import {testimonial} from './documents/testimonial'
import {contactSubmission} from './documents/contactSubmission'
import {settings} from './singletons/settings'
import {termsAndConditions} from './singletons/termsAndConditions'
import {privacyPolicy} from './singletons/privacyPolicy'
import {link} from './objects/link'
import {blockContent} from './objects/blockContent'
import button from './objects/button'
import {blockContentTextOnly} from './objects/blockContentTextOnly'
import {list} from './objects/list'
import {homeHero} from './objects/home/hero'
import {cta} from './objects/home/cta'
import {methodology} from './objects/home/methodology'
import {origin} from './objects/home/origin'
import {portfolio} from './objects/home/portfolio'
import {pricing} from './objects/home/pricing'
import {signature} from './objects/home/signature'
import {story} from './objects/home/story'
import {team} from './objects/home/team'
import {testimonials} from './objects/home/testimonials'
import {whatWeDo} from './objects/home/whatWeDo'
import {why} from './objects/home/why'
import {faq} from './objects/faq'
import {pageHero} from './objects/pageHero'
import {contactHero} from './objects/contactHero'
import {contactForm} from './objects/contactForm'
import {booking} from './objects/contact/booking'
import {engineeringServices} from './objects/service/engineering'
import {aiServices} from './objects/service/ai'
import {industries} from './objects/service/industries'
import {reality} from './objects/service/reality'
import {portfolioFeatured} from './objects/portfolio/portfolioFeatured'
import {portfolioGrid} from './objects/portfolio/portfolioGrid'
import {portfolioCta} from './objects/portfolio/portfolioCta'
import {portfolioMetrics} from './objects/portfolio/portfolioMetrics'
import {insightsFeatured} from './objects/insights/insightsFeatured'
import {insightsGrid} from './objects/insights/insightsGrid'
import {insightsCta} from './objects/insights/insightsCta'
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
import {place} from './objects/about/place'
import {freeResources} from './objects/resources/freeResources'
// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/studio/schema-types

export const schemaTypes = [
  // Singletons
  settings,
  termsAndConditions,
  privacyPolicy,
  // Documents
  page,
  post,
  person,
  service,
  teamMember,
  project,
  testimonial,
  contactSubmission,
  // Objects
  button,
  blockContent,
  blockContentTextOnly,
  link,
  list,
  pageHero,
  contactHero,
  contactForm,
  booking,
  homeHero,
  cta,
  methodology,
  origin,
  portfolio,
  pricing,
  signature,
  story,
  team,
  testimonials,
  whatWeDo,
  why,
  faq,
  engineeringServices,
  aiServices,
  industries,
  reality,
  portfolioFeatured,
  portfolioGrid,
  portfolioCta,
  portfolioMetrics,
  insightsFeatured,
  insightsGrid,
  insightsCta,
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
  place,
  studyClosingCta,
  freeResources,
  isThisForYou,
  soundFamiliar,
]
