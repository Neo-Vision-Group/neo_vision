import {defineQuery} from 'next-sanity'
import {MetadataRoute} from 'next'
import {resolveSiteOrigin} from '@/app/site-origin'
import {sanityFetch} from '@/sanity/lib/live'

const sitemapQuery = defineQuery(`
  {
    "pages": *[
      _type == "page" &&
      (pageType == "home" || defined(slug.current))
    ]{
      _id,
      _updatedAt,
      pageType,
      "slug": slug.current
    },
    "posts": *[_type == "post" && defined(slug.current)]{
      _id,
      _updatedAt,
      publishedAt,
      "slug": slug.current
    },
    "services": *[_type == "service" && defined(slug.current)]{
      _id,
      _updatedAt,
      "slug": slug.current
    },
    "projects": *[_type == "project" && defined(slug.current)]{
      _id,
      _updatedAt,
      "slug": slug.current
    }
  }
`)

type SitemapQueryResult = {
  pages?: Array<{
    _id: string
    _updatedAt?: string
    pageType?: string
    slug?: string
  }>
  posts?: Array<{
    _id: string
    _updatedAt?: string
    publishedAt?: string
    slug?: string
  }>
  services?: Array<{
    _id: string
    _updatedAt?: string
    slug?: string
  }>
  projects?: Array<{
    _id: string
    _updatedAt?: string
    slug?: string
  }>
}

function absoluteUrl(origin: string, path: string): string {
  return new URL(path, `${origin}/`).toString()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await resolveSiteOrigin()
  const {data} = await sanityFetch({
    query: sitemapQuery,
    perspective: 'published',
    stega: false,
  })

  const routeMap = new Map<string, MetadataRoute.Sitemap[number]>()
  const payload = (data ?? {}) as SitemapQueryResult

  for (const page of payload.pages ?? []) {
    const path = page.pageType === 'home' ? '/' : `/${page.slug ?? ''}`
    if (!page.pageType && !page.slug) continue

    routeMap.set(path, {
      url: absoluteUrl(origin, path),
      lastModified: page._updatedAt ?? new Date().toISOString(),
      priority: path === '/' ? 1 : 0.8,
      changeFrequency: path === '/' ? 'weekly' : 'monthly',
    })
  }

  for (const post of payload.posts ?? []) {
    if (!post.slug) continue

    const path = `/insights/${post.slug}`
    routeMap.set(path, {
      url: absoluteUrl(origin, path),
      lastModified: post.publishedAt ?? post._updatedAt ?? new Date().toISOString(),
      priority: 0.6,
      changeFrequency: 'monthly',
    })
  }

  for (const service of payload.services ?? []) {
    if (!service.slug) continue

    const path = `/services/${service.slug}`
    routeMap.set(path, {
      url: absoluteUrl(origin, path),
      lastModified: service._updatedAt ?? new Date().toISOString(),
      priority: 0.7,
      changeFrequency: 'monthly',
    })
  }

  for (const project of payload.projects ?? []) {
    if (!project.slug) continue

    const path = `/portfolio/${project.slug}`
    routeMap.set(path, {
      url: absoluteUrl(origin, path),
      lastModified: project._updatedAt ?? new Date().toISOString(),
      priority: 0.7,
      changeFrequency: 'monthly',
    })
  }

  return Array.from(routeMap.values()).sort((a, b) => a.url.localeCompare(b.url))
}
