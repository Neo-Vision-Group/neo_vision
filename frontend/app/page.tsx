import type {Metadata} from 'next'
import {cache} from 'react'
import {resolveSiteOrigin} from '@/app/site-origin'
import PageBuilderPage from '@/components/PageBuilder'
import {StructuredDataScript} from '@/components/seo/StructuredDataScript'
import {sanityFetch} from '@/sanity/lib/live'
import {homePageQuery} from '@/sanity/lib/queries'
import {
  buildRouteMetadata,
  buildRouteStructuredData,
  extractPageBuilderDescription,
  resolveSeoContext,
} from '@/sanity/lib/seo'
import type {HomePageQueryResult} from '@/sanity.types'

const loadHomePageForMetadata = cache(async () => {
  const {data} = await sanityFetch({
    query: homePageQuery,
    stega: false,
  })

  return data as HomePageQueryResult | null
})

export async function generateMetadata(): Promise<Metadata> {
  const homePage = await loadHomePageForMetadata()
  const origin = await resolveSiteOrigin()
  const seoContext = await resolveSeoContext({
    pathname: '/',
    origin,
    seo: homePage?.seo,
    fallbackTitle: homePage?.name,
    fallbackDescription: extractPageBuilderDescription(homePage?.pageBuilder),
    schemaTypeFallback: 'WebPage',
  })

  return buildRouteMetadata(seoContext)
}

export default async function Page() {
  const {data: homePage} = await sanityFetch({
    query: homePageQuery,
  })

  if (!homePage) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">No home page found</h1>
        <p className="text-gray-600 mt-4">
          Please create a page in Sanity with pageType set to &quot;home&quot;
        </p>
      </div>
    )
  }

  if (!homePage.pageBuilder || homePage.pageBuilder.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">{homePage.name}</h1>
        <p className="text-gray-600 mt-4">
          This page has no content blocks. Add blocks in Sanity Studio under &quot;Page
          builder&quot;.
        </p>
      </div>
    )
  }

  const origin = await resolveSiteOrigin()
  const seoContext = await resolveSeoContext({
    pathname: '/',
    origin,
    seo: homePage.seo,
    fallbackTitle: homePage.name,
    fallbackDescription: extractPageBuilderDescription(homePage.pageBuilder),
    schemaTypeFallback: 'WebPage',
  })
  const structuredData = buildRouteStructuredData({
    ...seoContext,
    routeType: 'page',
    pageBuilder: homePage.pageBuilder,
  })

  return (
    <>
      <StructuredDataScript nodes={structuredData} />
      <PageBuilderPage page={homePage} />
    </>
  )
}
