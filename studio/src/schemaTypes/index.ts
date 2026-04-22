import {person} from './documents/person'
import {page} from './documents/page' 
import {post} from './documents/post'
import {service} from './documents/service'
import {teamMember} from './documents/teamMember'
import {project} from './documents/project'
import {testimonial} from './documents/testimonial'
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
  // Objects
  button,
  blockContent,
  blockContentTextOnly,
  link,
  list,
  pageHero,
  contactHero,
  contactForm,
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
]
