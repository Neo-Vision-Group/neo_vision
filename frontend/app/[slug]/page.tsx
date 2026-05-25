import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {cache} from 'react'

import {resolveSiteOrigin} from '@/app/site-origin'
import PageBuilderPage from '@/components/PageBuilder'
import {StructuredDataScript} from '@/components/seo/StructuredDataScript'
import {debugSanityFetch} from '@/sanity/lib/debugFetch'
import {pageQuery, pagesSlugs} from '@/sanity/lib/queries'
import {
  buildRouteMetadata,
  buildRouteStructuredData,
  extractPageBuilderDescription,
  resolveSeoContext,
} from '@/sanity/lib/seo'

type Props = {
  params: Promise<{slug: string}>
}

const loadPageForMetadata = cache(async (slug: string) => {
  const {data} = await debugSanityFetch({
    query: pageQuery,
    params: {slug},
    stega: false,
  })

  return data
})

function getPageSchemaType(slug: string) {
  switch (slug) {
    case 'about':
      return 'AboutPage' as const
    case 'contact':
      return 'ContactPage' as const
    default:
      return 'WebPage' as const
  }
}

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const {data} = await debugSanityFetch({
    query: pagesSlugs,
    // // Use the published perspective in generateStaticParams
    perspective: 'published',
    stega: false,
  })
  return data
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const page = await loadPageForMetadata(params.slug)
  const origin = await resolveSiteOrigin()
  const seoContext = await resolveSeoContext({
    pathname: params.slug === '/' ? '/' : `/${params.slug}`,
    origin,
    seo: page?.seo,
    fallbackTitle: page?.name,
    fallbackDescription:
      page?.heading ??
      page?.subheading ??
      extractPageBuilderDescription(
        page?.pageBuilder as Array<Record<string, unknown>> | null | undefined
      ),
    schemaTypeFallback: getPageSchemaType(params.slug),
  })

  return buildRouteMetadata(seoContext)
}

export default async function Page(props: Props) {
  const params = await props.params
  
  const {data: page} = await debugSanityFetch({query: pageQuery, params})

  if (!page) {
    console.warn(`[Route] No page found for slug: ${params.slug}`)
    notFound()
  }

  const origin = await resolveSiteOrigin()
  const seoContext = await resolveSeoContext({
    pathname: params.slug === '/' ? '/' : `/${params.slug}`,
    origin,
    seo: page.seo,
    fallbackTitle: page.name,
    fallbackDescription:
      page.heading ??
      page.subheading ??
      extractPageBuilderDescription(
        page.pageBuilder as Array<Record<string, unknown>> | null | undefined
      ),
    schemaTypeFallback: getPageSchemaType(params.slug),
  })
  const structuredData = buildRouteStructuredData({
    ...seoContext,
    routeType: 'page',
    pageBuilder: page.pageBuilder as Array<Record<string, unknown>> | null | undefined,
  })

  return (
    <>
      <StructuredDataScript nodes={structuredData} />
      <PageBuilderPage page={page} />
    </>
  )
}
