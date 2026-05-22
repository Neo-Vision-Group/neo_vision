'use client'

import { useEffect, useState } from 'react'

const COOKIE_STORAGE_KEY = 'neo-cookie-preferences'

export type StoredPreferences = {
  categories: Record<string, boolean>
  savedAt: string
}

export function useAnalyticsConsent(): boolean {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    const checkConsent = () => {
      try {
        const raw = localStorage.getItem(COOKIE_STORAGE_KEY)
        if (!raw) {
          setHasConsent(false)
          return
        }

        const parsed = JSON.parse(raw) as StoredPreferences
        // Check if user has accepted analytics category
        // Category keys are defined in Sanity cookieSettings.categories
        const analyticsEnabled = parsed.categories?.analytics ?? false
        setHasConsent(analyticsEnabled)
      } catch {
        setHasConsent(false)
      }
    }

    checkConsent()

    // Listen for storage changes (from other tabs or when user updates preferences)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === COOKIE_STORAGE_KEY) {
        checkConsent()
      }
    }

    // Listen for custom event from CookieBanner when preferences are saved
    const handleConsentUpdate = () => {
      checkConsent()
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('neo:cookie-consent-updated', handleConsentUpdate)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('neo:cookie-consent-updated', handleConsentUpdate)
    }
  }, [])

  return hasConsent
}

export function dispatchConsentUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('neo:cookie-consent-updated'))
  }
}
