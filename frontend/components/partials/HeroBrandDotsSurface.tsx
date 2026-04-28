'use client'

import {useId} from 'react'

import {HeroBrandDotsCanvas} from '@/components/partials/HeroBrandDotsMediaProvider'
import {cn} from '@/lib/utils'

export function HeroBrandDotsSurface({className}: {className?: string}) {
  const filterId = `${useId().replace(/:/g, '')}-brand-dots-filter`

  return (
    <>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        focusable="false"
      >
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="
                0.2126 0.7152 0.0722 0 0
                0.0542 0.1823 0.0184 0 0
                0      0      0      0 0
                0.2126 0.7152 0.0722 0 0
              "
            />
          </filter>
        </defs>
      </svg>

      <div aria-hidden className={cn('absolute inset-0 dark:hidden', className)}>
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 24% 78%, rgba(255,65,0,0.08) 0%, rgba(255,65,0,0.03) 28%, rgba(255,65,0,0) 54%),
              radial-gradient(circle at 82% 22%, rgba(255,65,0,0.04) 0%, rgba(255,65,0,0.015) 22%, rgba(255,65,0,0) 40%),
              linear-gradient(180deg, #fff8f4 0%, #fff8f4 100%)
            `,
          }}
        />
        <HeroBrandDotsCanvas
          className="absolute inset-0 h-full w-full object-cover"
          style={{filter: `url(#${filterId})`, opacity: 0.22}}
        />
      </div>

      <div aria-hidden className={cn('absolute inset-0 hidden dark:block', className)}>
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 24% 78%, rgba(255,65,0,0.14) 0%, rgba(255,65,0,0.05) 26%, rgba(255,65,0,0) 54%),
              radial-gradient(circle at 82% 24%, rgba(255,65,0,0.08) 0%, rgba(255,65,0,0.02) 24%, rgba(255,65,0,0) 40%),
              linear-gradient(180deg, #040404 0%, #040404 100%)
            `,
          }}
        />

        <HeroBrandDotsCanvas
          className="absolute inset-0 h-full w-full object-cover"
          style={{filter: `url(#${filterId})`, opacity: 0.5}}
        />
      </div>
    </>
  )
}
