import {initPostHog} from '@/lib/posthog-client'

// Initialize PostHog lazily only if user has already given analytics consent
// This prevents eager loading of heavy SDK bundles (surveys.js ~34KB, exception-autocapture.js ~5KB)
// First-time visitors will trigger init via CookieBanner after acceptance
void initPostHog()
