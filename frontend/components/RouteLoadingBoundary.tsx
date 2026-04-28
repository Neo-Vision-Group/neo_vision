'use client'

import type {ReactNode} from 'react'

import {useOptionalPageTransition} from '@/components/transition/TransitionProvider'

export function RouteLoadingBoundary({children}: {children: ReactNode}) {
  const transition = useOptionalPageTransition()

  if (transition && transition.status !== 'idle') {
    return null
  }

  return <>{children}</>
}
