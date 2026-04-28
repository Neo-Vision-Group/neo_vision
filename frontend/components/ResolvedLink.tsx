import Link from 'next/link'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import {linkResolver} from '@/sanity/lib/utils'
import {DereferencedLink} from '@/sanity/lib/types'

interface ResolvedLinkProps extends Omit<ComponentPropsWithoutRef<typeof Link>, 'href'> {
  link: DereferencedLink
  children: ReactNode
  className?: string
}

export default function ResolvedLink({link, children, className, ...props}: ResolvedLinkProps) {
  // resolveLink() is used to determine the type of link and return the appropriate URL.
  const resolvedLink = linkResolver(link)

  if (typeof resolvedLink === 'string') {
    return (
      <Link
        href={resolvedLink}
        target={link?.openInNewTab ? '_blank' : undefined}
        rel={link?.openInNewTab ? 'noopener noreferrer' : undefined}
        className={className}
        {...props}
      >
        {children}
      </Link>
    )
  }
  return <>{children}</>
}
