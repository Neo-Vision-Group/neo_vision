'use client'

import { useState, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import posthog from '@/lib/posthog-client'
import { cn } from '@/lib/utils'

const BLOOM_ANIMATION_MS = 600

export function AnimatedThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [pendingTheme, setPendingTheme] = useState<'light' | 'dark' | null>(null)
  const [animationDirection, setAnimationDirection] = useState<'to-dark' | 'to-light' | null>(null)
  const themeCommitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    return () => {
      if (themeCommitTimeoutRef.current) {
        clearTimeout(themeCommitTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (pendingTheme && resolvedTheme === pendingTheme) {
      setPendingTheme(null)
    }
  }, [pendingTheme, resolvedTheme])

  const isDark = resolvedTheme === 'dark'
  const visualTheme = pendingTheme ?? (isDark ? 'dark' : 'light')
  const isVisuallyDark = visualTheme === 'dark'

  const handleToggle = () => {
    if (pendingTheme) {
      return
    }

    const newTheme = isDark ? 'light' : 'dark'
    setPendingTheme(newTheme)
    setAnimationDirection(newTheme === 'dark' ? 'to-dark' : 'to-light')

    if (themeCommitTimeoutRef.current) {
      clearTimeout(themeCommitTimeoutRef.current)
    }

    themeCommitTimeoutRef.current = setTimeout(() => {
      setTheme(newTheme)
      setPendingTheme(null)
      setAnimationDirection(null)
      themeCommitTimeoutRef.current = null
    }, BLOOM_ANIMATION_MS)

    posthog.capture('theme_toggled', {
      from_theme: theme,
      to_theme: newTheme,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
    })
  }

  if (!mounted) {
    return (
      <button
        type="button"
        data-anim="bloom"
        className={cn('theme-toggle', className)}
        aria-label="Toggle theme"
      >
        <span className="theme-toggle__inner" />
      </button>
    )
  }

  return (
      <button
        type="button"
        role="switch"
        data-anim="bloom"
        data-theme={visualTheme}
        data-transitioning={animationDirection ? 'true' : undefined}
        data-direction={animationDirection ?? undefined}
        aria-checked={isVisuallyDark}
        aria-label={isVisuallyDark ? 'Switch to light theme' : 'Switch to dark theme'}
        onClick={handleToggle}
        className={cn('theme-toggle', className)}
      >
      <span className="theme-toggle__inner">
        <span className="icon icon--sun" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              opacity="0.5"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.455 3.46457C7.48129 3.29681 7.54987 3.13851 7.65427 3.00458C7.75867 2.87066 7.89545 2.76552 8.05173 2.69909C8.20801 2.63266 8.37862 2.60712 8.5475 2.62487C8.71638 2.64263 8.87796 2.70309 9.017 2.80057L11.354 4.44057C11.5248 4.56061 11.7289 4.62419 11.9376 4.62239C12.1463 4.6206 12.3493 4.55353 12.518 4.43057L14.824 2.74857C14.9612 2.64854 15.1216 2.5851 15.2902 2.56422C15.4587 2.54335 15.6297 2.56573 15.7872 2.62927C15.9447 2.6928 16.0834 2.79538 16.1903 2.92735C16.2971 3.05932 16.3686 3.21633 16.398 3.38357L16.89 6.19557C16.9259 6.40134 17.0254 6.59068 17.1745 6.73703C17.3235 6.88338 17.5146 6.97939 17.721 7.01157L20.541 7.45257C20.7089 7.47878 20.8674 7.54735 21.0015 7.65181C21.1355 7.75628 21.2408 7.89319 21.3072 8.04961C21.3737 8.20604 21.3992 8.37682 21.3813 8.54584C21.3634 8.71485 21.3027 8.87652 21.205 9.01557L19.565 11.3516C19.445 11.5224 19.3814 11.7264 19.3832 11.9352C19.385 12.1439 19.4521 12.3469 19.575 12.5156L21.258 14.8226C21.358 14.9598 21.4215 15.1202 21.4424 15.2887C21.4632 15.4573 21.4408 15.6283 21.3773 15.7858C21.3138 15.9433 21.2112 16.082 21.0792 16.1888C20.9473 16.2957 20.7902 16.3672 20.623 16.3966L17.811 16.8886C17.6054 16.9245 17.4161 17.0238 17.2698 17.1726C17.1235 17.3215 17.0274 17.5124 16.995 17.7186L16.554 20.5396C16.5278 20.7075 16.4592 20.866 16.3548 21C16.2503 21.1341 16.1134 21.2393 15.957 21.3058C15.8005 21.3722 15.6298 21.3977 15.4607 21.3798C15.2917 21.362 15.1301 21.3013 14.991 21.2036L12.655 19.5636C12.4842 19.4435 12.2801 19.38 12.0714 19.3818C11.8627 19.3835 11.6597 19.4506 11.491 19.5736L9.184 21.2566C9.04672 21.3566 8.88621 21.42 8.71762 21.4409C8.54904 21.4617 8.37792 21.4392 8.22043 21.3756C8.06293 21.3119 7.92424 21.2092 7.81744 21.0771C7.71064 20.945 7.63925 20.7879 7.61 20.6206L7.118 17.8086C7.08212 17.603 6.9828 17.4137 6.83395 17.2674C6.68511 17.121 6.49421 17.025 6.288 16.9926L3.467 16.5526C3.29908 16.5264 3.1406 16.4578 3.00654 16.3533C2.87248 16.2489 2.76725 16.112 2.7008 15.9555C2.63434 15.7991 2.60885 15.6283 2.62674 15.4593C2.64462 15.2903 2.70528 15.1286 2.803 14.9896L4.443 12.6526C4.56304 12.4818 4.62661 12.2777 4.62482 12.069C4.62303 11.8602 4.55595 11.6573 4.433 11.4886L2.75 9.18257C2.64996 9.04529 2.58654 8.88478 2.56572 8.7162C2.5449 8.54761 2.56737 8.3765 2.63101 8.219C2.69465 8.0615 2.79736 7.92281 2.92945 7.81601C3.06155 7.70921 3.21867 7.63782 3.386 7.60857L6.198 7.11557C6.40344 7.0795 6.59246 6.9801 6.7386 6.83127C6.88474 6.68244 6.98068 6.49164 7.013 6.28557L7.455 3.46457ZM12 17.0006C13.3261 17.0006 14.5979 16.4738 15.5355 15.5361C16.4732 14.5984 17 13.3267 17 12.0006C17 10.6745 16.4732 9.40272 15.5355 8.46504C14.5979 7.52736 13.3261 7.00057 12 7.00057C10.6739 7.00057 9.40215 7.52736 8.46447 8.46504C7.52679 9.40272 7 10.6745 7 12.0006C7 13.3267 7.52679 14.5984 8.46447 15.5361C9.40215 16.4738 10.6739 17.0006 12 17.0006Z"
              fill="currentColor"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M16 12C16 13.0609 15.5786 14.0783 14.8284 14.8284C14.0783 15.5786 13.0609 16 12 16C10.9391 16 9.92172 15.5786 9.17157 14.8284C8.42143 14.0783 8 13.0609 8 12C8 10.9391 8.42143 9.92172 9.17157 9.17157C9.92172 8.42143 10.9391 8 12 8C13.0609 8 14.0783 8.42143 14.8284 9.17157C15.5786 9.92172 16 10.9391 16 12Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span className="icon icon--moon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              opacity="0.5"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M22 12.0004C22 17.5234 17.523 22.0004 12 22.0004C10.8691 22.0015 9.74615 21.8108 8.67901 21.4364C8.22985 20.3466 7.99915 19.1791 8.00001 18.0004C7.99726 15.8666 8.7553 13.8016 10.138 12.1764C10.7352 13.0472 11.5355 13.7595 12.4698 14.2515C13.404 14.7436 14.4441 15.0006 15.5 15.0004C16.6201 15.0006 17.7212 14.7113 18.6966 14.1606C19.672 13.6099 20.4885 12.8165 21.067 11.8574C21.307 11.4614 22 11.5374 22 12.0004Z"
              fill="currentColor"
            />
            <path
              d="M2 12C2 16.359 4.789 20.066 8.679 21.435C8.22997 20.3455 7.99927 19.1784 8 18C8 15.779 8.805 13.746 10.138 12.176C9.39462 11.0944 8.99773 9.81239 9 8.5C8.99983 7.37991 9.28911 6.27877 9.83979 5.30339C10.3905 4.32801 11.1839 3.51149 12.143 2.933C12.54 2.693 12.463 2 12 2C6.477 2 2 6.477 2 12Z"
              fill="currentColor"
            />
          </svg>
        </span>
      </span>
    </button>
  )
}
