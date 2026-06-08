import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {cache} from 'react'
import {resolveSiteOrigin} from '@/app/site-origin'
import PageBuilderPage from '@/components/PageBuilder'
import {StructuredDataScript} from '@/components/seo/StructuredDataScript'
import {client} from '@/sanity/lib/client'
import {sanityFetch} from '@/sanity/lib/live'
import {allServicesQuery, serviceQuery} from '@/sanity/lib/queries'
import {
  buildRouteMetadata,
  buildRouteStructuredData,
  extractPageBuilderDescription,
  resolveSeoContext,
} from '@/sanity/lib/seo'
import type {PageQueryResult, ServiceQueryResult, Slug} from '@/sanity.types'

type AllServicesSlugsResult = Array<{
  _id: string
  slug: Slug
}>

type Props = {
  params: Promise<{slug: string}>
}

const loadServiceForMetadata = cache(async (slug: string) => {
  const {data} = await sanityFetch({
    query: serviceQuery,
    params: {slug},
    stega: false,
  })

  return data as ServiceQueryResult
})

function getServiceBreadcrumb(pageBuilder?: Array<Record<string, unknown>> | null) {
  const block = pageBuilder?.find((entry) => entry?._type === 'serviceHero') as
    | {breadcrumb?: {rootLabel?: string; categoryLabel?: string; currentLabel?: string}}
    | undefined

  return block?.breadcrumb
}

export async function generateStaticParams() {
  const services = await client.fetch<AllServicesSlugsResult>(allServicesQuery)
  return services.map((service) => ({slug: service.slug.current}))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const service = await loadServiceForMetadata(slug)
  const origin = await resolveSiteOrigin()
  const seoContext = await resolveSeoContext({
    pathname: `/services/${slug}`,
    origin,
    seo: {
      ...service?.seo,
      enableFaqSchema: service?.seo?.enableFaqSchema ?? true,
    },
    fallbackTitle: service?.name,
    fallbackDescription: extractPageBuilderDescription(
      service?.pageBuilder as Array<Record<string, unknown>> | null | undefined
    ),
    schemaTypeFallback: 'Service',
    openGraphTypeFallback: 'website',
  })

  return buildRouteMetadata(seoContext)
}

export default async function ServiceDetailPage({params}: Props) {
  const {slug} = await params
  const service = await sanityFetch({query: serviceQuery, params: {slug}})

  if (!service.data) notFound()

  const origin = await resolveSiteOrigin()
  const seoContext = await resolveSeoContext({
    pathname: `/services/${slug}`,
    origin,
    seo: {
      ...service.data.seo,
      enableFaqSchema: service.data.seo?.enableFaqSchema ?? true,
    },
    fallbackTitle: service.data.name,
    fallbackDescription: extractPageBuilderDescription(
      service.data.pageBuilder as Array<Record<string, unknown>> | null | undefined
    ),
    schemaTypeFallback: 'Service',
    openGraphTypeFallback: 'website',
  })
  const structuredData = buildRouteStructuredData({
    ...seoContext,
    routeType: 'service',
    pageBuilder: service.data.pageBuilder as Array<Record<string, unknown>> | null | undefined,
    service: {
      name: service.data.name,
      category: service.data.category,
      price: service.data.price,
      duration: service.data.duration,
    },
    breadcrumb: getServiceBreadcrumb(
      service.data.pageBuilder as Array<Record<string, unknown>> | null | undefined
    ),
  })

  const pageData: NonNullable<PageQueryResult> = {
    _id: service.data._id,
    _type: 'page',
    name: service.data.name,
    slug: service.data.slug,
    pageType: 'services',
    heading: null,
    subheading: null,
    seo: service.data.seo ?? null,
    pageBuilder: service.data.pageBuilder as unknown as NonNullable<PageQueryResult>['pageBuilder'],
  }

  return (
    <>
      <StructuredDataScript nodes={structuredData} />
      <PageBuilderPage page={pageData} />
    </>
  )
}
