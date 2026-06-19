'use client'

import {useEffect} from 'react'
import {
  configureGoogleAnalytics,
  getStoredCookiePreferences,
  setGoogleAnalyticsId,
  updateGoogleConsent,
} from '@/lib/marketing-analytics'

type GoogleConsentTrackerProps = {
  gaId?: string
}

export function GoogleConsentTracker({gaId}: GoogleConsentTrackerProps) {
  useEffect(() => {
    if (gaId) {
      setGoogleAnalyticsId(gaId)
      configureGoogleAnalytics({gaId})
    }

    const syncConsent = () => {
      updateGoogleConsent(getStoredCookiePreferences())
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key) {
        syncConsent()
      }
    }

    syncConsent()
    window.addEventListener('neo:cookie-consent-updated', syncConsent)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('neo:cookie-consent-updated', syncConsent)
      window.removeEventListener('storage', handleStorage)
    }
  }, [gaId])

  return null
}
