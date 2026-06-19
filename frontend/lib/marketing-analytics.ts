'use client'

const COOKIE_STORAGE_KEY = 'neo-cookie-preferences'

type CookiePreferences = {
  categories?: Record<string, boolean>
  savedAt?: string
}

type DataLayerEvent = {
  event: string
  [key: string]: unknown
}

type PageViewPayload = {
  page_location: string
  page_path: string
  page_title: string
  page_referrer?: string
}

type ConsentState = {
  ad_storage: 'granted' | 'denied'
  analytics_storage: 'granted' | 'denied'
  ad_user_data: 'granted' | 'denied'
  ad_personalization: 'granted' | 'denied'
  functionality_storage: 'granted' | 'denied'
  personalization_storage: 'granted' | 'denied'
  security_storage: 'granted' | 'denied'
}

declare global {
  interface Window {
    dataLayer: DataLayerEvent[]
    gtag?: (...args: unknown[]) => void
    __neoGaId?: string
    __neoGoogleLinkerDomains?: string[]
  }
}

function getWindow() {
  return typeof window !== 'undefined' ? window : undefined
}

function ensureDataLayer() {
  const currentWindow = getWindow()
  if (!currentWindow) {
    return null
  }

  currentWindow.dataLayer = currentWindow.dataLayer || []
  return currentWindow.dataLayer
}

function toAbsoluteUrl(value: string) {
  try {
    return new URL(value, window.location.origin).toString()
  } catch {
    return value
  }
}

function toHostname(value: string) {
  try {
    return new URL(value).hostname
  } catch {
    return null
  }
}

export function pushDataLayerEvent(event: DataLayerEvent) {
  const dataLayer = ensureDataLayer()
  if (!dataLayer) {
    return
  }

  dataLayer.push(event)
}

export function getStoredCookiePreferences(): CookiePreferences | null {
  const currentWindow = getWindow()
  if (!currentWindow) {
    return null
  }

  try {
    const rawValue = currentWindow.localStorage.getItem(COOKIE_STORAGE_KEY)
    if (!rawValue) {
      return null
    }

    const parsed = JSON.parse(rawValue) as CookiePreferences
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function buildConsentState(preferences: CookiePreferences | null): ConsentState {
  const analyticsGranted = preferences?.categories?.analytics === true
  const marketingGranted = preferences?.categories?.marketing === true

  return {
    ad_storage: marketingGranted ? 'granted' : 'denied',
    analytics_storage: analyticsGranted ? 'granted' : 'denied',
    ad_user_data: marketingGranted ? 'granted' : 'denied',
    ad_personalization: marketingGranted ? 'granted' : 'denied',
    functionality_storage: 'granted',
    personalization_storage: marketingGranted ? 'granted' : 'denied',
    security_storage: 'granted',
  }
}

export function updateGoogleConsent(preferences: CookiePreferences | null) {
  const currentWindow = getWindow()
  if (!currentWindow?.gtag) {
    return
  }

  const consentState = buildConsentState(preferences)
  currentWindow.gtag('consent', 'update', consentState)
  pushDataLayerEvent({
    event: 'consent_updated',
    ...consentState,
  })
}

export function setGoogleAnalyticsId(gaId?: string | null) {
  const currentWindow = getWindow()
  if (!currentWindow || !gaId) {
    return
  }

  currentWindow.__neoGaId = gaId
}

export function configureGoogleAnalytics(options?: { gaId?: string | null; linkerDomains?: string[] }) {
  const currentWindow = getWindow()
  const gaId = options?.gaId ?? currentWindow?.__neoGaId

  if (!currentWindow?.gtag || !gaId) {
    return
  }

  if (gaId) {
    currentWindow.__neoGaId = gaId
  }

  const knownDomains = new Set(currentWindow.__neoGoogleLinkerDomains ?? [])
  for (const domain of options?.linkerDomains ?? []) {
    if (domain) {
      knownDomains.add(domain)
    }
  }

  currentWindow.__neoGoogleLinkerDomains = Array.from(knownDomains)

  currentWindow.gtag('config', gaId, {
    send_page_view: false,
    linker: {
      domains: currentWindow.__neoGoogleLinkerDomains,
    },
  })
}

export function registerGoogleLinkerDomain(rawUrl: string) {
  const currentWindow = getWindow()
  if (!currentWindow) {
    return
  }

  const absoluteUrl = toAbsoluteUrl(rawUrl)
  const hostname = toHostname(absoluteUrl)
  if (!hostname) {
    return
  }

  configureGoogleAnalytics({
    linkerDomains: [hostname],
  })
}

export function trackPageView(payload: PageViewPayload) {
  pushDataLayerEvent({
    event: 'page_view',
    ...payload,
  })

  const currentWindow = getWindow()
  if (currentWindow?.gtag) {
    currentWindow.gtag('event', 'page_view', payload)
  }
}

export function trackGenerateLead(payload: {
  form_name: string
  service?: string
  budget_range?: string
  lead_source?: string
}) {
  pushDataLayerEvent({
    event: 'generate_lead',
    ...payload,
  })
}

export function trackBookCall(payload: {
  method: string
  service?: string
}) {
  pushDataLayerEvent({
    event: 'book_call',
    ...payload,
  })
}

export function trackResourceDownload(payload: {
  resource_name: string
  lead_source?: string
}) {
  pushDataLayerEvent({
    event: 'resource_download',
    ...payload,
  })
}

export function trackCtaClick(payload: {
  cta_text: string
  cta_location: string
  link_url: string
}) {
  pushDataLayerEvent({
    event: 'cta_click',
    ...payload,
  })
}

export function trackContactClick(payload: {
  contact_method: 'email' | 'phone'
}) {
  pushDataLayerEvent({
    event: 'contact_click',
    ...payload,
  })
}
