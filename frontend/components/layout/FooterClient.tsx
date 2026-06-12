'use client'

import Image from 'next/image'
import Link from 'next/link'
import {cn} from '@/lib/utils'
import {Logo} from '../icons/Logo'

type FooterLink = {
  label: string
  href: string
  accent?: boolean
  _key: string
}

type FooterColumn = {
  title: string
  links?: FooterLink[]
  _key: string
}

type FooterProps = {
  columns: FooterColumn[]
  cookiePreferencesLabel?: string | null
  title: string
  email?: string | null
  logo?: string
  location?: string | null
  phoneNumber?: string | null
  copyright?: string | null
}

type ContactItem = {
  label: string
  href?: string
}

export function Footer({
  columns,
  title,
  email,
  logo,
  location,
  phoneNumber,
  copyright,
}: FooterProps) {
  const contactItems: ContactItem[] = [
    email ? {label: email, href: `mailto:${email}`} : null,
    phoneNumber ? {label: phoneNumber, href: `tel:${phoneNumber.replace(/\s+/g, '')}`} : null,
    location ? {label: location} : null,
  ].filter((item): item is ContactItem => item !== null)

  const contactColumn: FooterColumn | null = contactItems.length
    ? {
        _key: 'contact-details',
        title: 'Contact',
        links: contactItems.map((item, index) => ({
          _key: `contact-${index}`,
          label: item.label,
          href: item.href ?? '',
          accent: false,
        })),
      }
    : null

  const displayColumns = contactColumn ? [...columns, contactColumn] : columns

  return (
    <footer className="relative text-white w-full overflow-x-clip overflow-y-hidden border-t border-black/20 bg-brand dark:border-white/15 dark:bg-dark">
      <div className="relative flex min-w-0 flex-col md:flex-row md:items-stretch lg:h-146">
        <div className="relative z-10 flex min-w-0 flex-col items-center text-center justify-between gap-10 px-6 py-8 md:w-1/4 md:flex-none md:py-10 lg:px-12 lg:py-12 xl:px-16">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 md:gap-2">
              {logo ? (
                <Image
                  src={logo}
                  alt={title}
                  aria-hidden="true"
                  width={80}
                  height={102}
                  className="h-12 w-10 shrink-0 md:h-16 md:w-12 lg:h-20 lg:w-15 2xl:h-25 2xl:w-20"
                />
              ) : (
                <>
                  <Logo className="h-12 w-10 shrink-0 md:h-16 md:w-12 lg:h-20 lg:w-15 2xl:h-25 2xl:w-20 dark:hidden" accentColor="#040404" />
                  <Logo className="hidden h-12 w-10 shrink-0 md:h-16 md:w-12 lg:h-20 lg:w-15 2xl:h-25 2xl:w-20 dark:block" />
                </>
              )}
              <p className="min-w-0 font-clash uppercase text-[32px] leading-8 tracking-[-0.2px] text-white md:text-[18px] md:leading-8 lg:text-[28px] lg:leading-12 2xl:text-[32px] 2xl:leading-[38px]">
                {title}
              </p>
            </div>
            <p className="text-body text-white">From 1 to 10</p>
          </div>
          <div className="flex w-full shrink-0 justify-center overflow-hidden">
            <iframe
              src="https://widget.clutch.co/widgets/get/9?ref_domain=neovision.group&uid=1165133&rel_nofollow=true&ref_path=/"
              width="260"
              height="92"
              className="block max-w-full"
              scrolling="no"
              style={{ border: 'none', overflow: 'hidden', display: 'block' }}
              title="Clutch Reviews"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col items-center gap-4">
            <p className="text-body-2 text-white">{copyright}</p>
          </div>
        </div>

        <div className="relative z-10 grid min-w-0 grid-cols-1 gap-6 border-t border-black/20 bg-brand px-8 pt-8 pb-28 dark:bg-dark md:flex-1 md:grid-cols-3 md:border-l md:border-t-0 md:gap-6 md:px-8 md:pt-12 md:pb-28 lg:gap-6 dark:border-white/15 lg:px-12 overflow-x-clip @container">
          {/* NEO VISION textured text - half visible at bottom, centered in this section */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -bottom-4 z-0 flex justify-center overflow-hidden"
            style={{ height: 'clamp(70px, 14vw, 160px)' }}
          >
            <span
              className="font-clash whitespace-nowrap uppercase leading-none text-white dark:text-brand text-center"
              style={{
                fontSize: 'clamp(64px, 14vw, 180px)',
                transform: 'translateY(10%)',
              }}
            >
              NEO VISION
            </span>
          </div>

          {displayColumns.map((col) => (
            <div key={col._key || col.title} className="flex min-w-0 flex-col gap-6">
              <h3 className="font-funnel text-[24px] leading-8 tracking-[-0.2px] text-white md:text-[28px] md:leading-12 2xl:text-[32px] 2xl:leading-[38px] 2xl:tracking-[-1px]">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {col.links?.map((link) => (
                  <li key={link._key || link.href}>
                    {link.href ? (
                      <Link
                        href={link.href}
                        className={cn(
                          'text-[18px] leading-normal block max-w-full wrap-break-word font-funnel transition-colors',
                          link.accent
                            ? 'text-brand hover:text-brand-hover'
                            : 'dark:hover:text-brand hover:text-black text-white',
                        )}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span className="text-[18px] leading-normal block max-w-full wrap-break-word font-funnel text-white">
                        {link.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
