import {headers} from 'next/headers'
import {getGlobalSeoData} from '@/sanity/lib/seo'

function toOrigin(value?: string | null): string | null {
  if (!value) return null

  const trimmed = value.trim()
  if (!trimmed) return null

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  try {
    return new URL(withProtocol).origin
  } catch {
    return null
  }
}

export async function resolveSiteOrigin(): Promise<string> {
  const envOrigin =
    toOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    toOrigin(process.env.SITE_URL) ??
    toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    toOrigin(process.env.VERCEL_URL)

  if (envOrigin) return envOrigin

  try {
    const {seoSettings, siteSettings} = await getGlobalSeoData()

    const defaultCanonicalOrigin = toOrigin(seoSettings?.defaultSeo?.canonicalUrl)
    if (defaultCanonicalOrigin) return defaultCanonicalOrigin

    const metadataBaseOrigin = toOrigin(siteSettings?.ogImage?.metadataBase)
    if (metadataBaseOrigin) return metadataBaseOrigin
  } catch {
    // Sitemap and robots should still render even if settings are unavailable.
  }

  const requestHeaders = await headers()
  const forwardedHost = requestHeaders.get('x-forwarded-host')
  const host = forwardedHost ?? requestHeaders.get('host') ?? 'localhost:3000'
  const protocol =
    requestHeaders.get('x-forwarded-proto') ??
    (host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https')

  return `${protocol}://${host}`
}
