'use client'

import {useEffect} from 'react'
import {INTRO_COOKIE_NAME, INTRO_COOKIE_MAX_AGE, INTRO_SESSION_KEY} from '@/lib/intro'

export function IntroVisitMarker() {
  useEffect(() => {
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, '1')
      document.cookie = `${INTRO_COOKIE_NAME}=1; path=/; max-age=${INTRO_COOKIE_MAX_AGE}; SameSite=Lax`
    } catch {
      // Ignore storage failures in private browsing or restrictive environments.
    }
  }, [])

  return null
}
