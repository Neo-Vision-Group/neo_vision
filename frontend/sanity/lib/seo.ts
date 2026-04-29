import type {SanityImageSource} from '@sanity/image-url'
import type {Metadata} from 'next'
import {toPlainText} from 'next-sanity'
import {cache} from 'react'
import type {
  Seo,
  SeoSettingsQueryResult,
  SettingsQueryResult,
} from '@/sanity.types'
import {sanityFetch} from '@/sanity/lib/live'
import {seoSettingsQuery, settingsQuery} from '@/sanity/lib/queries'
import {urlForImage} from '@/sanity/lib/utils'

type SupportedSchemaType = NonNullable<Seo['schemaType']>
type SupportedStructuredDataMode = NonNullable<Seo['structuredDataMode']>
type ResolvedStructuredDataMode = 'generated' | 'custom'
type OpenGraphType = 'website' | 'article' | 'profile'

type AlternateLanguageLike = {
  _key?: string
  _type?: 'seoAlternateLanguage'
  languageCode?: string | null
  url?: string | null
  isDefault?: boolean | null
}

type SeoImageLike =
  | SanityImageSource
  | {
      asset?: {url?: string | null} | null
      alt?: string | null
      _type?: string
    }
  | null
  | undefined

type SeoLike = Omit<
  Partial<Seo>,
  '_type' | 'alternateLanguages' | 'ogImage' | 'twitterImage' | 'socialImage'
> & {
  _type?: 'seo'
  alternateLanguages?: AlternateLanguageLike[] | null
  ogImage?: SeoImageLike
  twitterImage?: SeoImageLike
  socialImage?: SeoImageLike
}

type ArticleMetadataInput = {
  publishedTime?: string | null
  modifiedTime?: string | null
  authors?: string[]
}

type ServiceMetadataInput = {
  name?: string | null
  category?: string | null
  price?: string | null
  duration?: string | null
}

type BreadcrumbInput = {
  rootLabel?: string | null
  categoryLabel?: string | null
  currentLabel?: string | null
}

export type StructuredDataNode = Record<string, unknown>

export type SeoMetadataInput = {
  pathname: string
  origin: string
  seo?: SeoLike | null
  fallbackTitle?: string | null
  fallbackDescription?: string | null
  fallbackImage?: SeoImageLike
  openGraphTypeFallback?: OpenGraphType
  schemaTypeFallback?: SupportedSchemaType
  article?: ArticleMetadataInput
}

export type ResolvedSeo = Omit<
  Partial<Seo>,
  '_type' | 'alternateLanguages' | 'ogImage' | 'twitterImage' | 'socialImage' | 'structuredDataMode'
> & {
  schemaType?: SupportedSchemaType
  structuredDataMode?: SupportedStructuredDataMode
  alternateLanguages?: AlternateLanguageLike[]
  ogImage?: SeoImageLike
  twitterImage?: SeoImageLike
  socialImage?: SeoImageLike
}

export type ResolvedSeoContext = {
  origin: string
  pathname: string
  siteSettings: SettingsQueryResult | null
  seoSettings: SeoSettingsQueryResult | null
  siteName?: string
  resolvedSeo: ResolvedSeo
  title?: string
  description?: string
  canonicalUrl: string
  schemaType: SupportedSchemaType
  structuredDataMode: ResolvedStructuredDataMode
  fallbackImage?: SeoImageLike
  openGraphTypeFallback: OpenGraphType
  article?: ArticleMetadataInput
}

export type RouteStructuredDataInput = ResolvedSeoContext & {
  routeType: 'page' | 'service' | 'project' | 'post'
  pageBuilder?: Array<Record<string, unknown>> | null
  service?: ServiceMetadataInput
  breadcrumb?: BreadcrumbInput
}

const stringFieldKeys = [
  'metaTitle',
  'metaDescription',
  'seoTitleSuffix',
  'canonicalUrl',
  'robotsMode',
  'robots',
  'googleBot',
  'maxImagePreview',
  'paginationPrevUrl',
  'paginationNextUrl',
  'ogTitle',
  'ogDescription',
  'ogType',
  'ogUrl',
  'ogSiteName',
  'ogLocale',
  'twitterCard',
  'twitterTitle',
  'twitterDescription',
  'twitterSite',
  'twitterCreator',
  'socialTitle',
  'socialDescription',
  'socialImageAlt',
  'schemaType',
  'structuredDataMode',
  'structuredData',
  'searchTitle',
  'searchDescription',
  'breadcrumbTitle',
  'locale',
  'themeColor',
  'applicationName',
  'category',
  'referrer',
  'formatDetection',
] as const

const imageFieldKeys = ['ogImage', 'twitterImage', 'socialImage'] as const
const booleanFieldKeys = [
  'noIndex',
  'noFollow',
  'noArchive',
  'noSnippet',
  'noImageIndex',
  'enableBreadcrumbSchema',
  'enableFaqSchema',
] as const
const numberFieldKeys = ['maxSnippet', 'maxVideoPreview'] as const

type RobotsDirectiveState = {
  index?: boolean
  follow?: boolean
  noarchive?: boolean
  nosnippet?: boolean
  noimageindex?: boolean
  maxSnippet?: number
  maxImagePreview?: string
  maxVideoPreview?: number
}

export const getGlobalSeoData = cache(async () => {
  const [{data: siteSettings}, {data: seoSettings}] = await Promise.all([
    sanityFetch({
      query: settingsQuery,
      stega: false,
    }),
    sanityFetch({
      query: seoSettingsQuery,
      stega: false,
    }),
  ])

  return {
    siteSettings: siteSettings ?? null,
    seoSettings: seoSettings ?? null,
  }
})

function isBlankString(value?: string | null) {
  return !value || value.trim().length === 0
}

function pickString(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const trimmed = typeof value === 'string' ? value.trim() : ''

    if (trimmed.length > 0) {
      return trimmed
    }
  }

  return undefined
}

function pickArray<T>(...values: Array<T[] | null | undefined>) {
  for (const value of values) {
    if (Array.isArray(value) && value.length > 0) {
      return value
    }
  }

  return undefined
}

function pickObject<T>(...values: Array<T | null | undefined>) {
  for (const value of values) {
    if (value) {
      return value
    }
  }

  return undefined
}

function toText(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return pickString(value)
  }

  if (Array.isArray(value)) {
    try {
      return pickString(toPlainText(value as Parameters<typeof toPlainText>[0]))
    } catch {
      return undefined
    }
  }

  return undefined
}

function appendTitleSuffix(title?: string, suffix?: string) {
  if (!title) return undefined
  if (isBlankString(suffix)) return title
  return `${title} | ${suffix!.trim()}`
}

function toAbsoluteUrl(value: string, origin: string) {
  try {
    return new URL(value, origin).toString()
  } catch {
    return undefined
  }
}

function toOrigin(value?: string | null) {
  if (isBlankString(value)) return undefined

  try {
    return new URL(value!).origin
  } catch {
    return undefined
  }
}

function resolveImageUrl(source?: SeoImageLike) {
  if (!source) return undefined

  if (typeof source === 'object' && 'asset' in source) {
    const assetUrl =
      source.asset && typeof source.asset === 'object' && 'url' in source.asset
        ? source.asset.url
        : undefined

    if (!isBlankString(assetUrl)) {
      return assetUrl!.trim()
    }
  }

  try {
    return urlForImage(source as SanityImageSource)?.fit('crop').url()
  } catch {
    return undefined
  }
}

function resolveMetadataImage(source?: SeoImageLike, width = 1200, height = 627) {
  const url = resolveImageUrl(source)
  if (!url) return undefined

  const alt =
    source && typeof source === 'object' && 'alt' in source && typeof source.alt === 'string'
      ? source.alt
      : ''

  return {url, alt, width, height}
}

function resolveAlternateLanguages(alternateLanguages?: AlternateLanguageLike[] | null) {
  if (!alternateLanguages || alternateLanguages.length === 0) {
    return undefined
  }

  const languages: Record<string, string> = {}

  for (const alternate of alternateLanguages) {
    if (!alternate || isBlankString(alternate.languageCode) || isBlankString(alternate.url)) {
      continue
    }

    languages[alternate.languageCode!.trim()] = alternate.url!.trim()

    if (alternate.isDefault) {
      languages['x-default'] = alternate.url!.trim()
    }
  }

  return Object.keys(languages).length > 0 ? languages : undefined
}

function parseRobotsDirectives(directives?: string | null): RobotsDirectiveState {
  if (isBlankString(directives)) {
    return {}
  }

  const state: RobotsDirectiveState = {}
  const parts = directives!
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  for (const part of parts) {
    const [rawKey, rawValue] = part.split(':', 2)
    const key = rawKey.trim().toLowerCase()
    const value = rawValue?.trim()

    switch (key) {
      case 'index':
        state.index = true
        break
      case 'noindex':
        state.index = false
        break
      case 'follow':
        state.follow = true
        break
      case 'nofollow':
        state.follow = false
        break
      case 'noarchive':
        state.noarchive = true
        break
      case 'nosnippet':
        state.nosnippet = true
        break
      case 'noimageindex':
        state.noimageindex = true
        break
      case 'max-snippet':
        if (value && !Number.isNaN(Number(value))) {
          state.maxSnippet = Number(value)
        }
        break
      case 'max-image-preview':
        if (!isBlankString(value)) {
          state.maxImagePreview = value
        }
        break
      case 'max-video-preview':
        if (value && !Number.isNaN(Number(value))) {
          state.maxVideoPreview = Number(value)
        }
        break
      default:
        break
    }
  }

  return state
}

function serializeRobotsDirectives(state: RobotsDirectiveState) {
  const directives: string[] = []

  directives.push(state.index === false ? 'noindex' : 'index')
  directives.push(state.follow === false ? 'nofollow' : 'follow')

  if (state.noarchive) directives.push('noarchive')
  if (state.nosnippet) directives.push('nosnippet')
  if (state.noimageindex) directives.push('noimageindex')
  if (typeof state.maxSnippet === 'number') directives.push(`max-snippet:${state.maxSnippet}`)
  if (!isBlankString(state.maxImagePreview)) {
    directives.push(`max-image-preview:${state.maxImagePreview}`)
  }
  if (typeof state.maxVideoPreview === 'number') {
    directives.push(`max-video-preview:${state.maxVideoPreview}`)
  }

  return directives.join(', ')
}

function buildRobotsDirectiveState(seo: ResolvedSeo): RobotsDirectiveState {
  const state =
    seo.robotsMode === 'custom' ? parseRobotsDirectives(seo.robots) : ({} as RobotsDirectiveState)

  if (seo.robotsMode === 'indexFollow') {
    state.index = true
    state.follow = true
  }

  if (seo.robotsMode === 'noIndexNoFollow') {
    state.index = false
    state.follow = false
  }

  if (typeof seo.noIndex === 'boolean') {
    state.index = !seo.noIndex
  }

  if (typeof seo.noFollow === 'boolean') {
    state.follow = !seo.noFollow
  }

  if (typeof seo.noArchive === 'boolean') {
    state.noarchive = seo.noArchive
  }

  if (typeof seo.noSnippet === 'boolean') {
    state.nosnippet = seo.noSnippet
  }

  if (typeof seo.noImageIndex === 'boolean') {
    state.noimageindex = seo.noImageIndex
  }

  if (typeof seo.maxSnippet === 'number') {
    state.maxSnippet = seo.maxSnippet
  }

  if (!isBlankString(seo.maxImagePreview)) {
    state.maxImagePreview = seo.maxImagePreview
  }

  if (typeof seo.maxVideoPreview === 'number') {
    state.maxVideoPreview = seo.maxVideoPreview
  }

  return state
}

function buildRobotsDirectiveString(seo: ResolvedSeo) {
  return serializeRobotsDirectives(buildRobotsDirectiveState(seo))
}

function buildGoogleBotDirectiveString(seo: ResolvedSeo) {
  return pickString(seo.googleBot)
}

function parseFormatDetection(formatDetection?: string | null): Metadata['formatDetection'] | undefined {
  if (isBlankString(formatDetection)) {
    return undefined
  }

  const result: NonNullable<Metadata['formatDetection']> = {}
  const parts = formatDetection!
    .split(/[;,]/)
    .map((part) => part.trim())
    .filter(Boolean)

  for (const part of parts) {
    const [rawKey, rawValue] = part.split('=', 2)
    const key = rawKey.trim().toLowerCase()
    const value = rawValue?.trim().toLowerCase()
    const enabled = value !== 'no' && value !== 'false'

    switch (key) {
      case 'telephone':
      case 'phone':
        result.telephone = enabled
        break
      case 'address':
        result.address = enabled
        break
      case 'email':
        result.email = enabled
        break
      case 'date':
        result.date = enabled
        break
      default:
        break
    }
  }

  return Object.keys(result).length > 0 ? result : undefined
}

function getSiteName(siteSettings: SettingsQueryResult | null, seoSettings: SeoSettingsQueryResult | null) {
  return pickString(
    seoSettings?.siteName,
    siteSettings?.brandName,
    siteSettings?.title,
    siteSettings?.legalName
  )
}

function getSiteDescription(siteSettings: SettingsQueryResult | null, resolvedSeo?: ResolvedSeo) {
  return pickString(
    resolvedSeo?.searchDescription,
    resolvedSeo?.metaDescription,
    toText(siteSettings?.description)
  )
}

export function mergeSeo(defaultSeo?: SeoLike | null, overrideSeo?: SeoLike | null): ResolvedSeo {
  const merged = {...(defaultSeo ?? {}), ...(overrideSeo ?? {})} as ResolvedSeo
  const mergedRecord = merged as Record<string, unknown>

  for (const key of stringFieldKeys) {
    mergedRecord[key] = pickString(overrideSeo?.[key], defaultSeo?.[key])
  }

  merged.metaKeywords = pickArray(overrideSeo?.metaKeywords, defaultSeo?.metaKeywords)
  merged.alternateLanguages =
    pickArray(overrideSeo?.alternateLanguages ?? undefined, defaultSeo?.alternateLanguages ?? undefined) ??
    undefined

  for (const key of imageFieldKeys) {
    mergedRecord[key] = pickObject(overrideSeo?.[key], defaultSeo?.[key])
  }

  for (const key of booleanFieldKeys) {
    mergedRecord[key] = overrideSeo?.[key] ?? defaultSeo?.[key]
  }

  for (const key of numberFieldKeys) {
    mergedRecord[key] = overrideSeo?.[key] ?? defaultSeo?.[key]
  }

  return merged
}

export function hasNoIndex(seo?: ResolvedSeo | SeoLike | null) {
  if (!seo) return false
  if (seo.noIndex) return true
  if (seo.robotsMode === 'noIndexNoFollow') return true

  if (seo.robotsMode === 'custom') {
    const directives = parseRobotsDirectives(seo.robots)
    return directives.index === false
  }

  return false
}

export function resolveCanonicalUrl(origin: string, pathname: string, seo?: ResolvedSeo | SeoLike | null) {
  const explicitCanonical = pickString(seo?.canonicalUrl)
  if (explicitCanonical) {
    return toAbsoluteUrl(explicitCanonical, origin) ?? new URL(pathname, origin).toString()
  }

  return new URL(pathname, origin).toString()
}

export function isSameOriginUrl(origin: string, url: string) {
  return toOrigin(origin) === toOrigin(url)
}

export function extractPageBuilderDescription(
  pageBuilder?: Array<Record<string, unknown>> | null
) {
  if (!pageBuilder) return undefined

  for (const block of pageBuilder) {
    if (!block || typeof block !== 'object') continue

    const description = pickString(
      toText(block.subheading),
      toText(block.description),
      toText(block.body)
    )

    if (description) {
      return description
    }
  }

  return undefined
}

export function extractFaqEntries(pageBuilder?: Array<Record<string, unknown>> | null) {
  const entries: Array<{question: string; answer: string}> = []

  if (!pageBuilder) return entries

  for (const block of pageBuilder) {
    if (block?._type !== 'faq' || !Array.isArray(block.items)) {
      continue
    }

    for (const item of block.items as Array<Record<string, unknown>>) {
      const question = pickString(toText(item.question))
      const answer = pickString(toText(item.answer))

      if (question && answer) {
        entries.push({question, answer})
      }
    }
  }

  return entries
}

function parseCustomStructuredData(structuredData?: string | null) {
  if (isBlankString(structuredData)) {
    return []
  }

  try {
    const parsed = JSON.parse(structuredData!)

    if (Array.isArray(parsed)) {
      return parsed.filter((entry) => entry && typeof entry === 'object') as StructuredDataNode[]
    }

    if (parsed && typeof parsed === 'object') {
      return [parsed as StructuredDataNode]
    }
  } catch (error) {
    console.warn('[seo] Invalid custom structured data JSON-LD payload.', error)
  }

  return []
}

function getBreadcrumbNodes(input: RouteStructuredDataInput) {
  const currentLabel =
    pickString(
      input.resolvedSeo.breadcrumbTitle,
      input.breadcrumb?.currentLabel,
      input.title
    ) ?? 'Current page'

  const items: Array<{name: string; item: string}> = [{name: 'Home', item: input.origin}]

  switch (input.routeType) {
    case 'service':
      items.push({
        name: pickString(input.breadcrumb?.rootLabel, 'Services') ?? 'Services',
        item: new URL('/services', input.origin).toString(),
      })
      break
    case 'project':
      items.push({
        name: 'Portfolio',
        item: new URL('/portfolio', input.origin).toString(),
      })
      break
    case 'post':
      items.push({
        name: 'Insights',
        item: new URL('/insights', input.origin).toString(),
      })
      break
    case 'page':
      if (input.pathname === '/about') {
        items.push({
          name: 'About',
          item: new URL('/about', input.origin).toString(),
        })
      } else if (input.pathname === '/contact') {
        items.push({
          name: 'Contact',
          item: new URL('/contact', input.origin).toString(),
        })
      } else if (input.pathname === '/services') {
        items.push({
          name: 'Services',
          item: new URL('/services', input.origin).toString(),
        })
      } else if (input.pathname === '/portfolio') {
        items.push({
          name: 'Portfolio',
          item: new URL('/portfolio', input.origin).toString(),
        })
      } else if (input.pathname === '/insights') {
        items.push({
          name: 'Insights',
          item: new URL('/insights', input.origin).toString(),
        })
      }
      break
    default:
      break
  }

  if (items[items.length - 1]?.name !== currentLabel) {
    items.push({name: currentLabel, item: input.canonicalUrl})
  } else {
    items[items.length - 1] = {name: currentLabel, item: input.canonicalUrl}
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  } satisfies StructuredDataNode
}

function buildOrganizationReference(
  origin: string,
  siteSettings: SettingsQueryResult | null,
  siteName?: string
) {
  const organizationName = pickString(
    siteSettings?.legalName,
    siteSettings?.brandName,
    siteName
  )

  if (!organizationName) {
    return undefined
  }

  const sameAs = [
    siteSettings?.instagram,
    siteSettings?.facebook,
    siteSettings?.linkedin,
    siteSettings?.github,
    siteSettings?.x,
    siteSettings?.tiktok,
  ].filter((value): value is string => !isBlankString(value))

  const logoUrl = resolveImageUrl(siteSettings?.logoPicture)

  return {
    '@type': 'Organization',
    name: organizationName,
    url: origin,
    logo: logoUrl,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  }
}

function buildBasicPageStructuredData(input: RouteStructuredDataInput) {
  return {
    '@context': 'https://schema.org',
    '@type': input.schemaType,
    name: input.title,
    description: input.description,
    url: input.canonicalUrl,
    inLanguage: input.resolvedSeo.locale,
    isPartOf: input.siteName
      ? {
          '@type': 'WebSite',
          name: input.siteName,
          url: input.origin,
        }
      : undefined,
  } satisfies StructuredDataNode
}

function buildServiceStructuredData(input: RouteStructuredDataInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.service?.name ?? input.title,
    description: input.description,
    url: input.canonicalUrl,
    serviceType: pickString(input.service?.category, input.title),
    provider: buildOrganizationReference(input.origin, input.siteSettings, input.siteName),
    areaServed: pickString(input.siteSettings?.location),
    offers: pickString(input.service?.price)
      ? {
          '@type': 'Offer',
          priceSpecification: {
            '@type': 'PriceSpecification',
            description: input.service?.price,
          },
        }
      : undefined,
    additionalProperty: pickString(input.service?.duration)
      ? [
          {
            '@type': 'PropertyValue',
            name: 'Duration',
            value: input.service?.duration,
          },
        ]
      : undefined,
  } satisfies StructuredDataNode
}

function buildArticleStructuredData(input: RouteStructuredDataInput) {
  const authorNames = input.article?.authors?.filter((value): value is string => !isBlankString(value))
  const imageUrl = resolveImageUrl(
    pickObject(
      input.fallbackImage,
      input.resolvedSeo.ogImage,
      input.resolvedSeo.twitterImage,
      input.resolvedSeo.socialImage,
      input.siteSettings?.ogImage
    )
  )

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: input.canonicalUrl,
    mainEntityOfPage: input.canonicalUrl,
    datePublished: input.article?.publishedTime ?? undefined,
    dateModified: input.article?.modifiedTime ?? input.article?.publishedTime ?? undefined,
    image: imageUrl ? [imageUrl] : undefined,
    author:
      authorNames && authorNames.length > 0
        ? authorNames.map((name) => ({
            '@type': 'Person',
            name,
          }))
        : undefined,
    publisher: buildOrganizationReference(input.origin, input.siteSettings, input.siteName),
  } satisfies StructuredDataNode
}

function buildFaqStructuredData(entries: Array<{question: string; answer: string}>) {
  if (entries.length === 0) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer,
      },
    })),
  } satisfies StructuredDataNode
}

export async function resolveSeoContext(input: SeoMetadataInput): Promise<ResolvedSeoContext> {
  const {siteSettings, seoSettings} = await getGlobalSeoData()
  const siteName = getSiteName(siteSettings, seoSettings)
  const resolvedSeo = mergeSeo(seoSettings?.defaultSeo, input.seo)
  const title = appendTitleSuffix(
    pickString(resolvedSeo.searchTitle, resolvedSeo.metaTitle, input.fallbackTitle),
    resolvedSeo.seoTitleSuffix
  )
  const description = pickString(
    resolvedSeo.searchDescription,
    resolvedSeo.metaDescription,
    input.fallbackDescription,
    getSiteDescription(siteSettings, resolvedSeo)
  )
  const schemaType = (resolvedSeo.schemaType ??
    input.schemaTypeFallback ??
    'WebPage') as SupportedSchemaType
  const structuredDataMode: ResolvedStructuredDataMode =
    resolvedSeo.structuredDataMode && resolvedSeo.structuredDataMode !== 'inherit'
      ? resolvedSeo.structuredDataMode
      : 'generated'

  return {
    origin: input.origin,
    pathname: input.pathname,
    siteSettings,
    seoSettings,
    siteName,
    resolvedSeo,
    title,
    description,
    canonicalUrl: resolveCanonicalUrl(input.origin, input.pathname, resolvedSeo),
    schemaType,
    structuredDataMode,
    fallbackImage: input.fallbackImage,
    openGraphTypeFallback: input.openGraphTypeFallback ?? 'website',
    article: input.article,
  }
}

export function buildRouteMetadata(context: ResolvedSeoContext): Metadata {
  const robotsDirectives = buildRobotsDirectiveString(context.resolvedSeo)
  const googleBotDirectives = buildGoogleBotDirectiveString(context.resolvedSeo)
  const alternateLanguages = resolveAlternateLanguages(context.resolvedSeo.alternateLanguages)
  const openGraphImage = resolveMetadataImage(
    pickObject(
      context.resolvedSeo.ogImage,
      context.resolvedSeo.socialImage,
      context.fallbackImage,
      context.siteSettings?.ogImage
    )
  )
  const twitterImage = resolveMetadataImage(
    pickObject(
      context.resolvedSeo.twitterImage,
      context.resolvedSeo.socialImage,
      context.resolvedSeo.ogImage,
      context.fallbackImage,
      context.siteSettings?.ogImage
    )
  )
  const openGraphTitle = pickString(
    context.resolvedSeo.ogTitle,
    context.resolvedSeo.socialTitle,
    context.title
  )
  const openGraphDescription = pickString(
    context.resolvedSeo.ogDescription,
    context.resolvedSeo.socialDescription,
    context.description
  )
  const twitterTitle = pickString(
    context.resolvedSeo.twitterTitle,
    context.resolvedSeo.socialTitle,
    context.title
  )
  const twitterDescription = pickString(
    context.resolvedSeo.twitterDescription,
    context.resolvedSeo.socialDescription,
    context.description
  )

  const otherMeta: Record<string, string> = {}

  if (googleBotDirectives) {
    otherMeta.googlebot = googleBotDirectives
  }

  if (!isBlankString(context.resolvedSeo.themeColor)) {
    otherMeta['theme-color'] = context.resolvedSeo.themeColor!.trim()
  }

  if (!isBlankString(context.resolvedSeo.formatDetection)) {
    otherMeta['format-detection'] = context.resolvedSeo.formatDetection!.trim()
  }

  return {
    title: context.title,
    description: context.description,
    keywords:
      context.resolvedSeo.metaKeywords && context.resolvedSeo.metaKeywords.length > 0
        ? context.resolvedSeo.metaKeywords
        : undefined,
    robots: robotsDirectives,
    alternates: {
      canonical: context.canonicalUrl,
      languages: alternateLanguages,
    },
    openGraph: {
      title: openGraphTitle,
      description: openGraphDescription,
      url: pickString(context.resolvedSeo.ogUrl) ?? context.canonicalUrl,
      siteName: pickString(context.resolvedSeo.ogSiteName, context.siteName),
      locale: pickString(context.resolvedSeo.ogLocale, context.resolvedSeo.locale),
      type: (pickString(context.resolvedSeo.ogType) as OpenGraphType | undefined) ??
        context.openGraphTypeFallback,
      images: openGraphImage ? [openGraphImage] : undefined,
    },
    twitter: {
      card:
        (pickString(context.resolvedSeo.twitterCard) as
          | 'summary'
          | 'summary_large_image'
          | undefined) ?? 'summary_large_image',
      title: twitterTitle,
      description: twitterDescription,
      site: pickString(context.resolvedSeo.twitterSite),
      creator: pickString(context.resolvedSeo.twitterCreator),
      images: twitterImage ? [twitterImage] : undefined,
    },
    applicationName: pickString(context.resolvedSeo.applicationName, context.siteName),
    category: pickString(context.resolvedSeo.category),
    referrer: pickString(context.resolvedSeo.referrer) as Metadata['referrer'],
    formatDetection: parseFormatDetection(context.resolvedSeo.formatDetection),
    other: Object.keys(otherMeta).length > 0 ? otherMeta : undefined,
  }
}

export function buildGlobalMetadata(input: {
  origin: string
  siteSettings: SettingsQueryResult | null
  seoSettings: SeoSettingsQueryResult | null
  fallbackTitle?: string
  fallbackDescription?: string
}) {
  const siteName =
    getSiteName(input.siteSettings, input.seoSettings) ?? input.fallbackTitle
  const resolvedSeo = mergeSeo(input.seoSettings?.defaultSeo, null)
  const description = pickString(
    resolvedSeo.searchDescription,
    resolvedSeo.metaDescription,
    input.fallbackDescription,
    getSiteDescription(input.siteSettings, resolvedSeo)
  )
  const openGraphImage = resolveMetadataImage(
    pickObject(resolvedSeo.ogImage, resolvedSeo.socialImage, input.siteSettings?.ogImage)
  )
  const twitterImage = resolveMetadataImage(
    pickObject(
      resolvedSeo.twitterImage,
      resolvedSeo.socialImage,
      resolvedSeo.ogImage,
      input.siteSettings?.ogImage
    )
  )
  const verificationOther: Record<string, string | string[]> = {}

  if (!isBlankString(input.seoSettings?.bingSiteVerification)) {
    verificationOther['msvalidate.01'] = input.seoSettings!.bingSiteVerification!.trim()
  }

  if (!isBlankString(input.seoSettings?.pinterestVerification)) {
    verificationOther['p:domain_verify'] = input.seoSettings!.pinterestVerification!.trim()
  }

  if (!isBlankString(input.seoSettings?.facebookDomainVerification)) {
    verificationOther['facebook-domain-verification'] =
      input.seoSettings!.facebookDomainVerification!.trim()
  }

  const otherMeta: Record<string, string> = {}

  if (!isBlankString(resolvedSeo.themeColor)) {
    otherMeta['theme-color'] = resolvedSeo.themeColor!.trim()
  }

  if (!isBlankString(resolvedSeo.formatDetection)) {
    otherMeta['format-detection'] = resolvedSeo.formatDetection!.trim()
  }

  const title = siteName
    ? {
        template: `%s | ${siteName}`,
        default: siteName,
      }
    : input.fallbackTitle

  return {
    metadataBase: new URL(input.origin),
    title,
    description,
    applicationName: pickString(resolvedSeo.applicationName, siteName),
    category: pickString(resolvedSeo.category),
    referrer: pickString(resolvedSeo.referrer) as Metadata['referrer'],
    formatDetection: parseFormatDetection(resolvedSeo.formatDetection),
    verification: {
      google: pickString(input.seoSettings?.googleSiteVerification),
      yandex: pickString(input.seoSettings?.yandexVerification),
      other: Object.keys(verificationOther).length > 0 ? verificationOther : undefined,
    },
    openGraph: {
      title: siteName,
      description,
      url: input.origin,
      siteName: pickString(resolvedSeo.ogSiteName, siteName),
      locale: pickString(resolvedSeo.ogLocale, resolvedSeo.locale),
      type: (pickString(resolvedSeo.ogType) as OpenGraphType | undefined) ?? 'website',
      images: openGraphImage ? [openGraphImage] : undefined,
    },
    twitter: {
      card:
        (pickString(resolvedSeo.twitterCard) as
          | 'summary'
          | 'summary_large_image'
          | undefined) ?? 'summary_large_image',
      title: siteName,
      description,
      site: pickString(resolvedSeo.twitterSite),
      creator: pickString(resolvedSeo.twitterCreator),
      images: twitterImage ? [twitterImage] : undefined,
    },
    other: Object.keys(otherMeta).length > 0 ? otherMeta : undefined,
  } satisfies Metadata
}

export function buildGlobalStructuredData(input: {
  origin: string
  siteSettings: SettingsQueryResult | null
  seoSettings: SeoSettingsQueryResult | null
}) {
  const siteName = getSiteName(input.siteSettings, input.seoSettings)
  const resolvedSeo = mergeSeo(input.seoSettings?.defaultSeo, null)
  const description = getSiteDescription(input.siteSettings, resolvedSeo)
  const organization = buildOrganizationReference(input.origin, input.siteSettings, siteName)

  const nodes: StructuredDataNode[] = []

  if (organization) {
    nodes.push({
      '@context': 'https://schema.org',
      ...organization,
      email: pickString(input.siteSettings?.email),
      telephone: pickString(input.siteSettings?.phoneNumber),
      address: pickString(input.siteSettings?.location),
      image: resolveImageUrl(
        pickObject(resolvedSeo.socialImage, resolvedSeo.ogImage, input.siteSettings?.ogImage)
      ),
    })
  }

  if (siteName) {
    nodes.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: input.origin,
      description,
    })
  }

  return nodes
}

export function buildRouteStructuredData(input: RouteStructuredDataInput) {
  if (input.structuredDataMode === 'custom') {
    return parseCustomStructuredData(input.resolvedSeo.structuredData)
  }

  const nodes: StructuredDataNode[] = []
  const faqEntries = extractFaqEntries(input.pageBuilder)

  switch (input.schemaType) {
    case 'Article':
      nodes.push(buildArticleStructuredData(input))
      break
    case 'Service':
      nodes.push(buildServiceStructuredData(input))
      break
    case 'FAQPage': {
      const faqNode = buildFaqStructuredData(faqEntries)
      if (faqNode) {
        nodes.push(faqNode)
      } else {
        nodes.push(buildBasicPageStructuredData(input))
      }
      break
    }
    case 'AboutPage':
    case 'ContactPage':
    case 'WebPage':
    default:
      nodes.push(buildBasicPageStructuredData(input))
      break
  }

  if (input.resolvedSeo.enableFaqSchema && input.schemaType !== 'FAQPage') {
    const faqNode = buildFaqStructuredData(faqEntries)
    if (faqNode) {
      nodes.push(faqNode)
    }
  }

  if (input.resolvedSeo.enableBreadcrumbSchema) {
    nodes.push(getBreadcrumbNodes(input))
  }

  return nodes
}
