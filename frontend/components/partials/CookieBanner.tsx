'use client'

import Link from 'next/link'
import {PortableText} from '@portabletext/react'
import {useEffect, useEffectEvent, useState} from 'react'
import type {ButtonHTMLAttributes, ReactNode} from 'react'
import type {TypedObject} from '@portabletext/types'
import {cn} from '@/lib/utils'
import ArrowRight from '@/components/icons/ArrowRight'
import ArrowRightPixel from '@/components/icons/ArrowRightPixel'
import Badge from '@/components/partials/Badge'
import {dispatchConsentUpdate} from '@/hooks/useAnalyticsConsent'
import {initPostHog} from '@/lib/posthog-client'

const COOKIE_STORAGE_KEY = 'neo-cookie-preferences'
export const COOKIE_PREFERENCES_EVENT = 'neo:open-cookie-preferences'

type PortableTextValue = TypedObject[]

type CookieCategory = {
  _key?: string | null
  title?: string | null
  description?: string | null
  required?: boolean | null
  defaultEnabled?: boolean | null
  lockedLabel?: string | null
}

type CookieSettings = {
  enabled?: boolean | null
  bannerTitle?: string | null
  bannerDescription?: PortableTextValue | null
  preferencesTitle?: string | null
  preferencesDescription?: string | null
  acceptAllLabel?: string | null
  initialSaveLabel?: string | null
  customizeLabel?: string | null
  rejectAllLabel?: string | null
  savePreferencesLabel?: string | null
  backLabel?: string | null
  footerButtonLabel?: string | null
  categories?: CookieCategory[] | null
}

type CookieBannerProps = {
  settings?: CookieSettings | null
}

type StoredPreferences = {
  categories: Record<string, boolean>
  savedAt: string
}

function resolveLinkHref(value: Record<string, unknown> | undefined) {
  if (!value) {
    return '#'
  }

  const linkType = value.linkType

  if (linkType === 'href') {
    return typeof value.href === 'string' ? value.href : '#'
  }

  if (linkType === 'page' && typeof value.page === 'string') {
    return `/${value.page}`
  }

  if (linkType === 'post' && typeof value.post === 'string') {
    return `/insights/${value.post}`
  }

  if (linkType === 'service' && typeof value.service === 'string') {
    return `/services/${value.service}`
  }

  if (linkType === 'project' && typeof value.project === 'string') {
    return `/portfolio/${value.project}`
  }

  return '#'
}

function buildDefaultPreferences(categories: CookieCategory[]) {
  return categories.reduce<Record<string, boolean>>((accumulator, category, index) => {
    const key = category._key ?? `category-${index}`
    accumulator[key] = Boolean(category.required || category.defaultEnabled)
    return accumulator
  }, {})
}

function normalizePreferences(
  categories: CookieCategory[],
  stored: Record<string, boolean> | null | undefined,
) {
  const defaults = buildDefaultPreferences(categories)

  if (!stored) {
    return defaults
  }

  return categories.reduce<Record<string, boolean>>((accumulator, category, index) => {
    const key = category._key ?? `category-${index}`
    accumulator[key] = category.required ? true : Boolean(stored[key] ?? defaults[key])
    return accumulator
  }, {})
}

function readStoredPreferences(categories: CookieCategory[]) {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(COOKIE_STORAGE_KEY)

    if (!rawValue) {
      return null
    }

    const parsed = JSON.parse(rawValue) as StoredPreferences

    if (!parsed || typeof parsed !== 'object' || typeof parsed.categories !== 'object') {
      return null
    }

    return normalizePreferences(categories, parsed.categories)
  } catch {
    return null
  }
}

function persistPreferences(categories: CookieCategory[], preferences: Record<string, boolean>) {
  if (typeof window === 'undefined') {
    return
  }

  const normalizedPreferences = normalizePreferences(categories, preferences)
  const payload: StoredPreferences = {
    categories: normalizedPreferences,
    savedAt: new Date().toISOString(),
  }

  window.localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(payload))
  document.cookie = 'neo_cookie_preferences_set=1; Max-Age=31536000; Path=/; SameSite=Lax'

  // Notify other components (e.g., analytics) that consent has changed
  dispatchConsentUpdate()

  // Initialize PostHog if analytics consent was granted
  // Match the logic in useAnalyticsConsent: check for category key === 'analytics'
  const analyticsCategory = categories.find((cat) => cat._key === 'analytics')
  const analyticsEnabled = analyticsCategory
    ? normalizedPreferences['analytics']
    : categories.some((cat, idx) => {
        const key = cat._key ?? `category-${idx}`
        return cat.title?.toLowerCase().includes('analytics') && normalizedPreferences[key]
      })
  if (analyticsEnabled) {
    void initPostHog()
  }
}

function buildAcceptAllPreferences(categories: CookieCategory[]) {
  return categories.reduce<Record<string, boolean>>((accumulator, category, index) => {
    accumulator[category._key ?? `category-${index}`] = true
    return accumulator
  }, {})
}

function buildRejectAllPreferences(categories: CookieCategory[]) {
  return categories.reduce<Record<string, boolean>>((accumulator, category, index) => {
    accumulator[category._key ?? `category-${index}`] = Boolean(category.required)
    return accumulator
  }, {})
}

function SummaryActionButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex min-h-12 items-center justify-center px-6 py-3 text-[18px] leading-normal font-funnel transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-card)',
        className,
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}

function PreferenceToggle({
  checked,
  disabled,
  onToggle,
}: {
  checked: boolean
  disabled?: boolean
  onToggle: () => void
}) {
  return (
    <button
      aria-checked={checked}
      aria-disabled={disabled}
      className={cn(
        'relative inline-flex h-8 w-12 shrink-0 border p-1 transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black',
        disabled ? 'cursor-default opacity-100' : 'cursor-pointer',
        'border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900',
      )}
      disabled={disabled}
      onClick={onToggle}
      role="switch"
      type="button"
    >
      <span
        className={cn(
          'h-full w-5 transition-all duration-200',
          checked ? 'ml-auto bg-brand' : 'bg-gray-400 dark:bg-gray-600',
        )}
      />
    </button>
  )
}

export function openCookiePreferences() {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT))
}

export default function CookieBanner({settings}: CookieBannerProps) {
  const categories = (settings?.categories ?? []).filter((category): category is CookieCategory =>
    Boolean(category?.title && category?.description),
  )
  const categorySignature = JSON.stringify(
    categories.map((category, index) => ({
      key: category._key ?? `category-${index}`,
      required: Boolean(category.required),
      defaultEnabled: Boolean(category.defaultEnabled),
    })),
  )
  const [mode, setMode] = useState<'summary' | 'customize'>('summary')
  const [isVisible, setIsVisible] = useState(false)
  const [preferences, setPreferences] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!settings?.enabled || categories.length === 0) {
      setIsVisible(false)
      return
    }

    const storedPreferences = readStoredPreferences(categories)
    const nextPreferences = storedPreferences ?? buildDefaultPreferences(categories)

    setPreferences(nextPreferences)
    setMode('summary')
    setIsVisible(storedPreferences === null)
  }, [settings?.enabled, categorySignature])

  const reopenPreferences = useEffectEvent(() => {
    if (!settings?.enabled || categories.length === 0) {
      return
    }

    setPreferences(readStoredPreferences(categories) ?? buildDefaultPreferences(categories))
    setMode('customize')
    setIsVisible(true)
  })

  useEffect(() => {
    const listener = () => {
      reopenPreferences()
    }

    window.addEventListener(COOKIE_PREFERENCES_EVENT, listener)

    return () => {
      window.removeEventListener(COOKIE_PREFERENCES_EVENT, listener)
    }
  }, [reopenPreferences])

  if (!settings?.enabled || categories.length === 0 || !isVisible) {
    return null
  }

  const saveAndClose = (nextPreferences: Record<string, boolean>) => {
    persistPreferences(categories, nextPreferences)
    setPreferences(nextPreferences)
    setIsVisible(false)
  }

  const handleAcceptAll = () => {
    saveAndClose(buildAcceptAllPreferences(categories))
  }

  const handleRejectAll = () => {
    const nextPreferences = buildRejectAllPreferences(categories)
    setPreferences(nextPreferences)
    saveAndClose(nextPreferences)
  }

  const handleInitialSave = () => {
    saveAndClose(normalizePreferences(categories, preferences))
  }

  const handleSavePreferences = () => {
    saveAndClose(normalizePreferences(categories, preferences))
  }

  const richTextComponents = {
    block: {
      normal: ({children}: {children?: ReactNode}) => (
        <p className="text-[18px] leading-normal text-gray-700 dark:text-gray-300">{children}</p>
      ),
    },
    marks: {
      link: ({value, children}: {value?: Record<string, unknown>; children?: ReactNode}) => {
        const href = resolveLinkHref(value)
        const className =
          'font-bold text-black underline decoration-brand decoration-[7%] underline-offset-[0.15em] transition-colors hover:text-brand dark:text-white'

        if (/^https?:/i.test(href)) {
          return (
            <a
              className={className}
              href={href}
              rel={value?.openInNewTab ? 'noopener noreferrer' : undefined}
              target={value?.openInNewTab ? '_blank' : undefined}
            >
              {children}
            </a>
          )
        }

        return (
          <Link className={className} href={href}>
            {children}
          </Link>
        )
      },
    },
  }

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-3 z-100 sm:inset-x-4 sm:bottom-4">
      <div className="pointer-events-auto mx-auto w-full max-w-5xl border border-brand bg-white text-black shadow-[0_35px_60px_-15px_rgba(0,0,0,0.45)] dark:bg-black dark:text-white">
        {mode === 'summary' ? (
          <div className="flex flex-col gap-4 p-3 md:p-4 lg:flex-row lg:items-start">
            <div className="min-w-0 flex-1 p-3">
              <h2 className="text-100 leading-[1.2] font-bold text-black dark:text-white">
                {settings.bannerTitle || 'Cookies on Neovision'}
              </h2>
              {settings.bannerDescription?.length ? (
                <div className="mt-2 space-y-2">
                  <PortableText
                    components={richTextComponents}
                    value={settings.bannerDescription}
                  />
                </div>
              ) : null}
            </div>

            <div className="flex w-full flex-col gap-3 px-3 pb-3 lg:w-88 lg:items-end lg:px-0 lg:pb-0">
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                <SummaryActionButton
                  className="bg-brand text-white hover:bg---brand-hover)]"
                  onClick={handleAcceptAll}
                >
                  {settings.acceptAllLabel || 'Accept All'}
                </SummaryActionButton>
                <SummaryActionButton
                  className="bg-[#efefef] text-black hover:bg-white"
                  onClick={handleInitialSave}
                >
                  {settings.initialSaveLabel || 'Save'}
                </SummaryActionButton>
              </div>

              <button
                className="inline-flex items-center gap-3 self-start p-2 text-100 leading-[1.2] font-bold text-black transition-colors hover:text-brand lg:self-end dark:text-white"
                onClick={() => setMode('customize')}
                type="button"
              >
                <ArrowRightPixel color="currentColor" className="h-5 w-8" width={32} height={20} />
                <span>{settings.customizeLabel || 'Customize'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row">
            <div className="flex lg:w-23 lg:shrink-0 lg:flex-col">
              <button
                aria-label={settings.backLabel || 'Back'}
                className="flex h-15 w-18 items-center justify-center bg-brand text-white transition-colors hover:bg-brand-dark lg:h-19 lg:w-20"
                onClick={() => setMode('summary')}
                type="button"
              >
                <ArrowRight
                  color="currentColor"
                  className="h-5 w-8 rotate-180"
                  width={32}
                  height={20}
                />
              </button>
              <div className="hidden w-3 bg-gray-100 py-2 lg:flex dark:bg-gray-900">
                <div className="w-full bg-brand" />
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="px-4 pt-4 lg:p-6 lg:pb-4">
                <h2 className="text-100 leading-[1.2] font-bold text-black dark:text-white">
                  {settings.preferencesTitle || 'Your cookie preferences'}
                </h2>
                <p className="mt-2 max-w-lg text-[18px] leading-normal text-gray-700 dark:text-gray-300">
                  {settings.preferencesDescription ||
                    'Choose which cookies we can use. You can change these any time from the footer.'}
                </p>
              </div>

              <div className="flex flex-col gap-3 px-4 pb-4 lg:px-6 lg:pb-6">
                {categories.map((category, index) => {
                  const key = category._key ?? `category-${index}`
                  const checked = Boolean(
                    preferences[key] ?? category.required ?? category.defaultEnabled,
                  )

                  return (
                    <div className="border-t border-white/0 px-0 py-3" key={key}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-[20px] leading-[1.2] font-normal text-black dark:text-white">
                              {category.title}
                            </h3>
                            {category.required ? (
                              <Badge text={category.lockedLabel || 'Always on'} />
                            ) : null}
                          </div>
                        </div>

                        <PreferenceToggle
                          checked={checked}
                          disabled={Boolean(category.required)}
                          onToggle={() => {
                            if (category.required) {
                              return
                            }

                            setPreferences((currentPreferences) => ({
                              ...currentPreferences,
                              [key]: !checked,
                            }))
                          }}
                        />
                      </div>

                      <p className="mt-3 max-w-2xl text-[18px] leading-normal text-gray-600 dark:text-gray-400">
                        {category.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 px-4 pb-4 lg:w-88 lg:shrink-0 lg:items-end lg:px-4 lg:py-6">
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                <SummaryActionButton
                  className="bg-brand text-white hover:bg---brand-hover)]"
                  onClick={handleAcceptAll}
                >
                  {settings.acceptAllLabel || 'Accept All'}
                </SummaryActionButton>
                <SummaryActionButton
                  className="bg-[#efefef] text-black hover:bg-white"
                  onClick={handleRejectAll}
                >
                  {settings.rejectAllLabel || 'Reject All'}
                </SummaryActionButton>
              </div>

              <button
                className="inline-flex items-center gap-3 self-start p-2 text-100 leading-[1.2] font-bold text-black transition-colors hover:text-brand lg:self-end dark:text-white"
                onClick={handleSavePreferences}
                type="button"
              >
                <ArrowRightPixel color="currentColor" className="h-5 w-8" width={32} height={20} />
                <span>{settings.savePreferencesLabel || 'Save my preferences'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
