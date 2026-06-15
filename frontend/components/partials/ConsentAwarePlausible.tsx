'use client'

import PlausibleProvider from 'next-plausible'
import { useAnalyticsConsent } from '@/hooks/useAnalyticsConsent'

interface ConsentAwarePlausibleProps {
  children: React.ReactNode
}

export function ConsentAwarePlausible({ children }: ConsentAwarePlausibleProps) {
  const hasConsent = useAnalyticsConsent()

  // Only load Plausible when user has given analytics consent
  if (!hasConsent) {
    return <>{children}</>
  }

  return (
    <PlausibleProvider
      src={process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL}
      enabled={process.env.NODE_ENV === 'production'}
      init={{
        captureOnLocalhost: false,
      }}
    >
      {children}
    </PlausibleProvider>
  )
}
