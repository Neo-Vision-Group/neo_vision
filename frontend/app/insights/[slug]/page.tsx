import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {cache} from 'react'
import {resolveSiteOrigin} from '@/app/site-origin'
import PageBuilder from '@/components/PageBuilder'
import type {ArticleCardData} from '@/components/partials/ArticleCard'
import {StructuredDataScript} from '@/components/seo/StructuredDataScript'
import {InsightAuthor} from '@/components/sections/insight-detail/InsightAuthor'
import {InsightHero} from '@/components/sections/insight-detail/InsightHero'
import {InsightRelated} from '@/components/sections/insight-detail/InsightRelated'
import {PageTransitionMarker} from '@/components/transition/PageTransitionMarker'
import type {InsightDoc} from '@/lib/types/insight'
import {sanityFetch} from '@/sanity/lib/live'
import {
  ALL_INSIGHTS_QUERY,
  ALL_INSIGHT_SLUGS_QUERY,
  INSIGHT_BY_SLUG_QUERY,
} from '@/sanity/lib/queries'
import {buildRouteMetadata, buildRouteStructuredData, resolveSeoContext} from '@/sanity/lib/seo'

export const revalidate = 60

const loadInsightForMetadata = cache(async (slug: string): Promise<InsightDoc | null> => {
  try {
    const {data} = await sanityFetch({
      query: INSIGHT_BY_SLUG_QUERY,
      params: {slug},
      stega: false,
    })

    return data as InsightDoc | null
  } catch (error) {
    console.error('[insight] Sanity metadata fetch failed', error)
    return null
  }
})

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: ALL_INSIGHT_SLUGS_QUERY,
    perspective: 'published',
    stega: false,
  })

  return data?.map((entry: {slug: string}) => ({slug: entry.slug})) || []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>
}): Promise<Metadata> {
  const {slug} = await params
  const post = await loadInsightForMetadata(slug)
  const origin = await resolveSiteOrigin()
  const seoContext = await resolveSeoContext({
    pathname: `/insights/${slug}`,
    origin,
    seo: post?.seo,
    fallbackTitle: post?.title,
    fallbackDescription: post?.excerpt,
    fallbackImage: post?.coverImage,
    schemaTypeFallback: 'Article',
    openGraphTypeFallback: 'article',
    article: {
      publishedTime: post?.publishedAt,
      authors: post?.author?.name ? [post.author.name] : [],
    },
  })

  return buildRouteMetadata(seoContext)
}

async function loadInsight(slug: string): Promise<InsightDoc | null> {
  try {
    const {data} = await sanityFetch({
      query: INSIGHT_BY_SLUG_QUERY,
      params: {slug},
      stega: false,
    })

    return data as InsightDoc | null
  } catch (err) {
    console.error('[insight] Sanity fetch failed', err)
    return null
  }
}

function resolveArticleSlug(slug: ArticleCardData['slug']) {
  if (!slug) return ''
  if (typeof slug === 'string') return slug
  return slug.current ?? ''
}

export default async function InsightDetailPage({
  params,
}: {
  params: Promise<{slug: string}>
}) {
  const {slug} = await params
  const post = await loadInsight(slug)

  if (!post) notFound()

  const origin = await resolveSiteOrigin()
  const seoContext = await resolveSeoContext({
    pathname: `/insights/${slug}`,
    origin,
    seo: post.seo,
    fallbackTitle: post.title,
    fallbackDescription: post.excerpt,
    fallbackImage: post.coverImage,
    schemaTypeFallback: 'Article',
    openGraphTypeFallback: 'article',
    article: {
      publishedTime: post.publishedAt,
      authors: post.author?.name ? [post.author.name] : [],
    },
  })
  const structuredData = buildRouteStructuredData({
    ...seoContext,
    routeType: 'post',
    pageBuilder: post.pageBuilder as Array<Record<string, unknown>> | null | undefined,
  })

  let related: ArticleCardData[] = post.relatedInsights ?? []

  if (!related || related.length === 0) {
    try {
      const {data: allPosts} = await sanityFetch({
        query: ALL_INSIGHTS_QUERY,
        stega: false,
      })

      related = (allPosts as ArticleCardData[])
        .filter((entry) => resolveArticleSlug(entry.slug) !== slug)
        .slice(0, 3)
    } catch {
      related = []
    }
  }

  return (
    <>
      <StructuredDataScript nodes={structuredData} />
      <InsightHero post={post} />
      {post.pageBuilder && post.pageBuilder.length > 0 ? (
        <PageBuilder deferRouteReadySignal page={post as any} />
      ) : null}
      <InsightAuthor author={post.author} />
      <InsightRelated related={related} />
      <PageTransitionMarker hasHeroPattern />
    </>
  )
}
