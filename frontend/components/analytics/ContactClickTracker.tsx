'use client'

import {useEffect} from 'react'
import {trackContactClick} from '@/lib/marketing-analytics'

export function ContactClickTracker() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      const anchor = target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) {
        return
      }

      const href = anchor.getAttribute('href') ?? ''
      if (href.startsWith('mailto:')) {
        trackContactClick({contact_method: 'email'})
      }

      if (href.startsWith('tel:')) {
        trackContactClick({contact_method: 'phone'})
      }
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])

  return null
}
