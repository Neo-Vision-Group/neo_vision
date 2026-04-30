'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { HamburgerIcon } from '../icons/HamburgerIcon'
import { Button } from '@/components/partials/Button'
import { NavPageType } from '@/sanity/lib/types'
import Image from 'next/image'
import { Logo } from '../icons/Logo'
import DarkThemeIcon from '../icons/DarkThemeIcon'
import LightThemeIcon from '../icons/LightThemeIcon'
import { AnimatedBorder } from '../AnimatedBorder'

type NavClientProps = {
  pages: NavPageType[]
  title: string
  email?: string | null
  logo?: string
  cta?: {
    buttonText?: string
    link?: {
      linkType?: string
      href?: string
      page?: string
      post?: string
      service?: string
      project?: string
      openInNewTab?: boolean
    }
  } | null
}

// Nav item with decorative corners
function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      href={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative flex items-center justify-center font-family-funnel transition-colors',
        isHovered ? 'text-brand' : 'text-black dark:text-white'
      )}
    >
      <AnimatedBorder isHovered={isHovered} />
      <span className="font-funnel text-lg leading-none p-2.5">
        {children}
      </span>
    </Link>
  )
}

// Theme toggle with decorative corners
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative flex h-13 items-center justify-center overflow-hidden p-1.5">
        <div className="flex size-9.5 items-center justify-center bg-background" />
      </div>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex size-10 items-center justify-center"
      aria-label="Toggle theme"
    >
      <AnimatedBorder isHovered={isHovered} />
      <div className="flex size-6 items-center justify-center">
        {theme === 'dark' ? (
          <LightThemeIcon color="#FF4100" />
        ) : (
          <DarkThemeIcon color="#FF4100" />
        )}
      </div>
    </button>
  )
}

export default function NavClient({ pages, title, email, logo, cta }: NavClientProps) {
  // Build CTA href from link object
  const getCtaHref = () => {
    if (!cta?.link) return '#'
    const { linkType, href, page, post, service, project } = cta.link
    if (linkType === 'href' && href) return href
    if (linkType === 'page' && page) return `/${page}`
    if (linkType === 'post' && post) return `/posts/${post}`
    if (linkType === 'service' && service) return `/services/${service}`
    if (linkType === 'project' && project) return `/portfolio/${project}`
    return '#'
  }
  
  const { theme } = useTheme()

  const ctaText = cta?.buttonText || 'Get Started'
  const ctaHref = getCtaHref()
  const ctaOpenInNewTab = cta?.link?.openInNewTab || false
  const [open, setOpen] = useState(false)

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    if (open) {
      const prev = document.documentElement.style.overflow
      document.documentElement.style.overflow = 'hidden'
      return () => {
        document.documentElement.style.overflow = prev
      }
    }
  }, [open])

  // Close the menu on escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur dark:bg-black/80 lg:border-transparent lg:bg-[#EFEFEF] lg:backdrop-blur-[13.5px] dark:lg:bg-black">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:gap-8 md:px-12 lg:h-auto lg:gap-12 lg:px-16 2xl:px-30 lg:py-3">
        {/* Logo */}
        <Link
          href="/"
          aria-label={title}
          onClick={() => setOpen(false)}
          className="flex shrink-0 items-center gap-2"
        >
          {logo ? (
            <Image
              src={logo}
              alt={title}
              width={24}
              height={32}
              priority
              sizes="24px"
              className="h-8 w-auto"
            />
          ) : (
            <Logo darkMode={theme === 'dark'} />
          )}
          <span className="text-2xl uppercase font-betatron leading-none tracking-tight text-black dark:text-white lg:font-normal lg:tracking-normal">
            {title}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden flex-1 items-center justify-end gap-2 lg:flex">
          {pages.map((page: NavPageType, idx) => (
            <NavItem key={page._key || `nav-${idx}`} href={page.slug}>
              {page.name}
            </NavItem>
          ))}
        </div>

        {/* CTA & Theme Toggle */}
        <div className="hidden items-center gap-2 lg:flex">
          <Button 
            href={ctaHref} 
            variant="primary" 
            className="shrink-0"
            {...(ctaOpenInNewTab && { target: '_blank', rel: 'noopener noreferrer' })}
          >
            {ctaText}
          </Button>
          <ThemeToggle />
        </div>

        <div className="ml-auto flex items-center gap-3 lg:hidden">
          <div className="hidden sm:block">
            <Button
              href={ctaHref}
              size="sm"
              variant="primary"
              {...(ctaOpenInNewTab && { target: '_blank', rel: 'noopener noreferrer' })}
            >
              {ctaText}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center text-black dark:text-white"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
            onClick={() => setOpen((v) => !v)}
          >
            <HamburgerIcon open={open} />
          </button>
        </div>
      </div>

      {/* Mobile overlay panel */}
      <div
        id="mobile-nav-panel"
        className={cn(
          'fixed inset-x-0 top-16 z-40 origin-top bg-white transition-[opacity,transform] duration-200 dark:bg-black lg:hidden',
          open
            ? 'pointer-events-auto scale-y-100 opacity-100'
            : 'pointer-events-none scale-y-95 opacity-0'
        )}
        style={{ height: open ? 'calc(100svh - 4rem)' : '0' }}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col justify-between overflow-y-auto border-t border-border px-6 py-10">
          <ul className="flex flex-col gap-2">
            {pages.map((page: NavPageType, idx) => {
              const isActive = pathname === page.slug || (page.slug !== '/' && pathname.startsWith(page.slug))
              
              return (
                <li key={page._key || `mobile-nav-${idx}`}>
                  <Link
                    href={page.slug}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block py-3 text-3xl font-medium tracking-tight transition-colors",
                      isActive ? "text-brand" : "text-black hover:text-brand dark:text-white"
                    )}
                  >
                    {page.name}
                  </Link>
                </li>
              )
            })}
          </ul>
          <div className="flex flex-col gap-4 pt-8">
            <Button
              href={ctaHref}
              variant="primary"
              className="w-full justify-between"
              {...(ctaOpenInNewTab && { target: '_blank', rel: 'noopener noreferrer' })}
            >
              {ctaText}
            </Button>
            <div className="flex items-center justify-between gap-4">
              {email ? (
                <p className="text-caption text-black/70 dark:text-white/70">{email}</p>
              ) : (
                <span />
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
