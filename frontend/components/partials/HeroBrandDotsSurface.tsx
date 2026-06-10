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
                0.1375 0.4627 0.0467 0 0
                0.0350 0.1178 0.0119 0 0
                0      0      0      0 0
                0.2126 0.7152 0.0722 0 0
              "
            />
          </filter>
        </defs>
      </svg>

      <div aria-hidden className={cn('absolute inset-0 bg-white dark:hidden', className)}>
        <HeroBrandDotsCanvas
          className="absolute inset-0 h-full w-full object-cover"
          style={{filter: `url(#${filterId})`, opacity: 0.5}}
        />
      </div>

      <div aria-hidden className={cn('absolute inset-0 hidden bg-[#040404] dark:block', className)}>
        <HeroBrandDotsCanvas
          className="absolute inset-0 h-full w-full object-cover"
          style={{filter: `url(#${filterId})`, opacity: 0.5}}
        />
      </div>
    </>
  )
}
