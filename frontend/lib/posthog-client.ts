// Lazy PostHog initialization - only loads when user has given analytics consent
// This prevents eager loading of heavy SDK bundles (surveys.js ~34KB, exception-autocapture.js ~5KB)

import type {PostHog} from 'posthog-js'

let posthogInstance: PostHog | null = null
let initPromise: Promise<PostHog | null> | null = null

const COOKIE_STORAGE_KEY = 'neo-cookie-preferences'

function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const raw = localStorage.getItem(COOKIE_STORAGE_KEY)
    if (!raw) {
      return false
    }

    const parsed = JSON.parse(raw) as {
      categories: Record<string, boolean>
      savedAt: string
    }
    return parsed.categories?.analytics ?? false
  } catch {
    return false
  }
}

export async function initPostHog(): Promise<PostHog | null> {
  // Return existing instance if already initialized
  if (posthogInstance) {
    return posthogInstance
  }

  // Return in-flight promise if initialization is already in progress
  if (initPromise) {
    return initPromise
  }

  // Only initialize if user has given consent
  if (!hasAnalyticsConsent()) {
    return null
  }

  initPromise = (async () => {
    try {
      const posthog = await import('posthog-js')

      posthog.default.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
        api_host: '/ingest',
        ui_host: 'https://eu.posthog.com',
        defaults: '2026-01-30',
        capture_exceptions: true,
        debug: process.env.NODE_ENV === 'development',
      })

      posthogInstance = posthog.default
      return posthog.default
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to initialize PostHog:', error)
      }
      return null
    } finally {
      initPromise = null
    }
  })()

  return initPromise
}

export function getPostHog(): PostHog | null {
  return posthogInstance
}

// Safe posthog proxy for components to import
// No-ops calls when PostHog isn't initialized (consent not given)
// Forwards to real PostHog instance when available
const safePostHogProxy = new Proxy({} as PostHog, {
  get(_target, prop) {
    // If PostHog is initialized, forward the call
    if (posthogInstance && prop in posthogInstance) {
      const value = posthogInstance[prop as keyof PostHog]
      if (typeof value === 'function') {
        return value.bind(posthogInstance)
      }
      return value
    }

    // Return no-op function for method calls
    if (typeof prop === 'string') {
      // Common methods that should silently no-op
      const noOpMethods = [
        'capture',
        'identify',
        'alias',
        'setPersonProperties',
        'reset',
        'opt_in_capturing',
        'opt_out_capturing',
        'has_opted_in_capturing',
        'has_opted_out_capturing',
        'clear_opt_in_out_capturing',
        'debug',
        'captureException',
        'captureFeedback',
        'captureSurveyShown',
        'captureSurveySent',
        'captureSurveyDismissed',
        'group',
        'register',
        'register_once',
        'unregister',
        'getFeatureFlag',
        'getFeatureFlagPayload',
        'isFeatureEnabled',
      ]
      if (noOpMethods.includes(prop)) {
        return () => {
          // No-op: PostHog not initialized (no consent yet)
        }
      }
    }

    // Return undefined for other properties
    return undefined
  },
})

// Default export for easy importing: import posthog from '@/lib/posthog-client'
export default safePostHogProxy
