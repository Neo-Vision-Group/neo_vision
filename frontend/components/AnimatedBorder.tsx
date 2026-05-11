"use client";

import { cn } from "@/lib/utils";

export function AnimatedBorder({
  isHovered,
  groupHover = false,
}: {
  isHovered?: boolean;
  groupHover?: boolean;
}) {
  return (
    <>
      <span
        className={cn(
          'absolute left-0 top-[-12.5%] h-[125%] w-px origin-top bg-brand transition-transform duration-300 ease-in-out',
          groupHover ? 'scale-y-0 group-hover:scale-y-100' : (isHovered ? 'scale-y-100' : 'scale-y-0')
        )}
      />
      <span
        className={cn(
          'absolute right-0 top-[-12.5%] h-[125%] w-px origin-bottom bg-brand transition-transform duration-300 ease-in-out',
          groupHover ? 'scale-y-0 group-hover:scale-y-100' : (isHovered ? 'scale-y-100' : 'scale-y-0')
        )}
      />
      <span
        className={cn(
          'absolute -left-2 top-0 h-px w-[calc(100%+1rem)] origin-right bg-brand transition-transform duration-300 ease-in-out',
          groupHover ? 'scale-x-0 group-hover:scale-x-100' : (isHovered ? 'scale-x-100' : 'scale-x-0')
        )}
      />
      <span
        className={cn(
          'absolute bottom-0 -left-2 h-px w-[calc(100%+1rem)] origin-left bg-brand transition-transform duration-300 ease-in-out',
          groupHover ? 'scale-x-0 group-hover:scale-x-100' : (isHovered ? 'scale-x-100' : 'scale-x-0')
        )}
      />
    </>
  )
}
