'use client'

import Image from 'next/image'
import Link from 'next/link'
import {useState} from 'react'
import {AnimatedBorder} from '@/components/AnimatedBorder'
import {cn} from '@/lib/utils'
import NavLogo from '../icons/NavLogo'
import SocialIcon from '../icons/SocialIcon'

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
  title: string
  email?: string | null
  logo?: string
  location?: string | null
  phoneNumber?: string | null
  copyright?: string | null
  legalLinks?: FooterLink[]
  nonce?: string
}

function ClutchLogo() {
  return (
    <Link
      href="https://clutch.co/profile/neo-vision-technologies"
      target="_blank"
      rel="noreferrer"
      className="block"
    >
      <Image
        src="/images/clutch-logo-light.svg"
        alt="Clutch"
        width={100}
        height={28}
        className="h-7 w-auto"
      />
    </Link>
  )
}

function SocialLink({
  href,
  label,
  platform,
}: {
  href: string
  label: string
  platform: NonNullable<ReturnType<typeof getSocialPlatform>>
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group inline-flex items-center gap-3 text-[18px] leading-normal text-white transition-colors hover:text-black dark:hover:text-brand"
    >
      <span className="relative flex h-[2em] w-[2em] items-center justify-center">
        <AnimatedBorder isHovered={isHovered} />
        <SocialIcon platform={platform} />
      </span>
      <span className="wrap-break-word font-funnel">{label}</span>
    </Link>
  )
}

function getSocialPlatform(href: string) {
  if (/instagram\.com/i.test(href)) return 'instagram'
  if (/facebook\.com/i.test(href)) return 'facebook'
  if (/linkedin\.com/i.test(href)) return 'linkedin'
  if (/github\.com/i.test(href)) return 'github'
  if (/x\.com|twitter\.com/i.test(href)) return 'x'
  if (/tiktok\.com/i.test(href)) return 'tiktok'
  return null
}

export function Footer({
  columns,
  title,
  logo,
  copyright,
  legalLinks = [],
  nonce,
}: FooterProps) {
  return (
    <footer className="relative text-white w-full overflow-x-clip overflow-y-hidden border-t border-black/20 bg-brand dark:border-white/15 dark:bg-dark">
      <div className="relative flex min-w-0 flex-col md:flex-row md:items-stretch">
        <div className="relative z-10 flex min-w-0 flex-col items-center text-center justify-between gap-10 px-6 py-8 md:w-1/4 md:flex-none md:py-10 lg:px-12 lg:py-12 xl:px-16">
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center justify-center gap-4 md:gap-2">
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
                  <NavLogo className="h-12 w-10 shrink-0 md:h-16 md:w-12 lg:h-20 lg:w-15 2xl:h-25 2xl:w-20 dark:hidden"/>
                </>
              )}
              <p className="text-body-2 text-white">{copyright}</p>
            </div>
          </div>
          <div className="flex justify-center">
            <ClutchLogo />
          </div>
          <div className="flex flex-col items-center">
            {legalLinks.map((link) => (
              <Link
                key={link._key}
                href={link.href}
                className="text-sm font-funnel text-white transition-colors hover:text-black dark:hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="relative z-10 grid min-w-0 grid-cols-1 gap-3 border-t border-black/20 bg-brand px-8 pt-8 pb-40 dark:bg-dark md:flex-1 md:grid-cols-3 md:border-l md:border-t-0 md:gap-3 md:px-8 md:pt-12 md:pb-40 lg:gap-3 dark:border-white/15 lg:px-12 overflow-x-clip @container">
          {/* NEO VISION textured text - half visible at bottom, centered in this section */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -bottom-4 z-0 flex justify-center"
            style={{ height: 'clamp(70px, 14vw, 160px)' }}
          >
            <span
              className="font-betatron whitespace-nowrap uppercase leading-none text-white dark:text-brand text-center"
              style={{
                fontSize: 'clamp(64px, 14vw, 180px)',
                transform: 'translateY(10%)',
              }}
            >
              NEO VISION
            </span>
          </div>

          {columns.map((col) => (
            <div key={col._key || col.title} className="flex min-w-0 flex-col gap-6">
              <h3 className="font-clash text-center uppercase text-[24px] leading-8 tracking-[-0.2px] text-white md:text-[28px] md:leading-12 2xl:text-[32px]">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {col.links?.map((link, linkIdx) => (
                  <li key={link._key || link.href}>
                    {link.href ? (
                      (() => {
                        const socialPlatform = getSocialPlatform(link.href)
                        const isExternal = /^https?:\/\//i.test(link.href)

                        if (socialPlatform) {
                          return (
                            <div className="flex justify-center">
                              <SocialLink
                                href={link.href}
                                label={link.label}
                                platform={socialPlatform}
                              />
                            </div>
                          )
                        }

                        return (
                          <Link
                            href={link.href}
                            {...(isExternal ? {target: '_blank', rel: 'noreferrer'} : {})}
                            className={cn(
                              'text-[18px] leading-normal text-center block max-w-full wrap-break-word font-funnel transition-colors',
                              link.accent
                                ? 'text-brand hover:text-brand-hover'
                                : 'dark:hover:text-brand hover:text-black text-white',
                            )}
                          >
                            {link.label}
                          </Link>
                        )
                      })()
                    ) : (
                      <span className="text-[18px] text-center leading-normal block max-w-full wrap-break-word font-funnel text-white">
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
