export const PAGE_TRANSITION_ROUTE_READY_EVENT = 'neo:page-transition-route-ready'
export const PAGE_TRANSITION_IGNORE_ATTRIBUTE = 'data-transition-ignore'

export function getRouteKey(pathname: string, search = '') {
  return `${pathname}${search}`
}
