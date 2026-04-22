'use client'

import { cn } from '@/lib/utils'

export function AnimatedBorder({ isHovered }: { isHovered: boolean }) {
  return (
    <>
      <span
        className={cn(
          'absolute left-0 top-[-12.5%] h-[125%] w-px origin-top bg-brand transition-transform duration-300 ease-in-out',
          isHovered ? 'scale-y-100' : 'scale-y-0'
        )}
      />
      <span
        className={cn(
          'absolute right-0 top-[-12.5%] h-[125%] w-px origin-bottom bg-brand transition-transform duration-300 ease-in-out',
          isHovered ? 'scale-y-100' : 'scale-y-0'
        )}
      />
      <span
        className={cn(
          'absolute left-[-12.5%] top-0 h-px w-[125%] origin-right bg-brand transition-transform duration-300 ease-in-out',
          isHovered ? 'scale-x-100' : 'scale-x-0'
        )}
      />
      <span
        className={cn(
          'absolute bottom-0 left-[-12.5%] h-px w-[125%] origin-left bg-brand transition-transform duration-300 ease-in-out',
          isHovered ? 'scale-x-100' : 'scale-x-0'
        )}
      />
    </>
  )
}
