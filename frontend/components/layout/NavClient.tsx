'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { HamburgerIcon } from '../icons/HamburgerIcon'
import { Button } from '@/components/partials/Button'
import { NavPageType } from '@/sanity/lib/types'
import Image from 'next/image'
import { Logo } from '../icons/Logo'
import DarkThemeIcon from '../icons/DarkThemeIcon'
import LightThemeIcon from '../icons/LightThemeIcon'
import { BorderWrapper } from '../BorderWrapper'

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
      openInNewTab?: boolean
    }
  } | null
}

// Nav item with decorative corners
function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative flex items-center justify-center overflow-hidden p-2.5"
    >
      <span className="relative z-10 font-funnel text-lg leading-normal text-text">
        {children}
      </span>
      {/* Decorative corners */}
      <span className="absolute left-[135px] right-[-145px] top-[9px] h-px bg-brand" aria-hidden="true" />
      <span className="absolute bottom-[9px] left-[-155px] right-[145px] h-px bg-brand" aria-hidden="true" />
      <span className="absolute bottom-[55px] left-[5px] top-[-105px] w-px" aria-hidden="true">
        <span className="block h-full w-full origin-center -rotate-90 bg-brand" />
      </span>
      <span className="absolute bottom-[-105px] right-[5px] top-[55px] w-px" aria-hidden="true">
        <span className="block h-full w-full origin-center -rotate-90 bg-brand" />
      </span>
    </Link>
  )
}

// Theme toggle with decorative corners
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative flex h-[52px] items-center justify-center overflow-hidden p-1.5">
        <div className="flex size-[38px] items-center justify-center bg-background" />
      </div>
    )
  }

  return (
    <BorderWrapper bordered="all" className="w-fit">
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="flex size-10 items-center justify-center"
        aria-label="Toggle theme"
      >
        <div className="flex size-6 items-center justify-center">
          {theme === 'dark' ? (
            <LightThemeIcon color="#FF4100" />
          ) : (
            <DarkThemeIcon color="#FF4100" />
          )}
        </div>
      </button>
    </BorderWrapper>
  )
}

export default function NavClient({ pages, title, email, logo, cta }: NavClientProps) {
  // Build CTA href from link object
  const getCtaHref = () => {
    if (!cta?.link) return '#'
    const { linkType, href, page, post } = cta.link
    if (linkType === 'href' && href) return href
    if (linkType === 'page' && page) return `/${page}`
    if (linkType === 'post' && post) return `/posts/${post}`
    return '#'
  }
  
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

  return (
    <nav className="sticky top-0 z-50 w-full bg-muted-dark/70 backdrop-blur-[13.5px]">
      <div className="flex items-center gap-12 px-12 py-3">
        {/* Logo */}
        <Link
          href="/"
          aria-label={title}
          className="flex shrink-0 items-center gap-2"
        >
          {logo ? (
            <Image src={logo} alt={title} width={24} height={32} className="h-8 w-auto" />
          ) : (
            <Logo className="h-8 w-auto" />
          )}
          <span className="font-funnel text-2xl capitalize leading-none text-white">
            {title}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden flex-1 items-center justify-end gap-2 lg:flex">
          {pages.map((page: NavPageType) => (
            <NavItem key={page.name} href={page.slug}>
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

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="ml-auto flex h-10 w-10 items-center justify-center text-white lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          onClick={() => setOpen((v) => !v)}
        >
          <HamburgerIcon open={open} />
        </button>
      </div>

      {/* Mobile overlay panel */}
      <div
        id="mobile-nav-panel"
        className={cn(
          'fixed inset-x-0 top-[68px] z-40 origin-top bg-background transition-[opacity,transform] duration-200 lg:hidden',
          open
            ? 'pointer-events-auto scale-y-100 opacity-100'
            : 'pointer-events-none scale-y-95 opacity-0'
        )}
        style={{ height: open ? 'calc(100svh - 68px)' : '0' }}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col justify-between overflow-y-auto border-t border-border px-6 py-10">
          <ul className="flex flex-col gap-2">
            {pages.map((page: NavPageType) => (
              <li key={page.name}>
                <Link
                  href={page.slug}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-funnel text-3xl text-foreground transition-colors hover:text-brand"
                >
                  {page.name}
                </Link>
              </li>
            ))}
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
            <div className="flex items-center justify-between">
              {email && <p className="text-caption text-muted">{email}</p>}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
