export const PAGE_TRANSITION_ROUTE_READY_EVENT = 'neo:page-transition-route-ready'
export const PAGE_TRANSITION_IGNORE_ATTRIBUTE = 'data-transition-ignore'

export const HERO_PATTERN_BLOCK_TYPES = new Set([
  'homeHero',
  'pageHero',
  'serviceHero',
  'contactHero',
  'studyHero',
])

export function getRouteKey(pathname: string, search = '') {
  return `${pathname}${search}`
}

export function pageHasHeroPattern(blockTypes: Iterable<string>) {
  for (const blockType of blockTypes) {
    if (HERO_PATTERN_BLOCK_TYPES.has(blockType)) {
      return true
    }
  }

  return false
}
