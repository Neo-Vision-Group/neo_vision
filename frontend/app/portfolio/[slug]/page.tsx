import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {cache} from 'react'
import {resolveSiteOrigin} from '@/app/site-origin'
import PageBuilderPage from '@/components/PageBuilder'
import {StructuredDataScript} from '@/components/seo/StructuredDataScript'
import {client} from '@/sanity/lib/client'
import {sanityFetch} from '@/sanity/lib/live'
import {allProjectsQuery, projectBySlugQuery} from '@/sanity/lib/queries'
import {buildRouteMetadata, buildRouteStructuredData, resolveSeoContext} from '@/sanity/lib/seo'
import type {
  AllProjectsQueryResult,
  PageQueryResult,
  ProjectBySlugQueryResult,
} from '@/sanity.types'

type ProjectBlock = NonNullable<NonNullable<ProjectBySlugQueryResult>['pageBuilder']>[number]

function enrichProjectBlocks(project: NonNullable<ProjectBySlugQueryResult>): ProjectBlock[] {
  const pageBuilder = (project.pageBuilder ?? []) as Array<Record<string, unknown>>

  return pageBuilder.map((block) => {
    if (block._type !== 'studyHero') {
      return block as ProjectBlock
    }

    const heroBlock = block as Record<string, unknown> & {
      details?: Array<{_key?: string; label?: string; value?: string}>
    }

    const details =
      heroBlock.details && heroBlock.details.length > 0
        ? heroBlock.details
        : [
            {_key: 'client', label: 'Client', value: project.client ?? ''},
            {_key: 'industry', label: 'Industry', value: project.industry ?? ''},
            {_key: 'services', label: 'Services', value: project.category ?? ''},
            {_key: 'year', label: 'Year', value: project.year ?? ''},
          ].filter((item) => item.value)

    return {
      ...heroBlock,
      eyebrow: heroBlock.eyebrow ?? project.category ?? undefined,
      heading: heroBlock.heading ?? project.client ?? undefined,
      subheading: heroBlock.subheading ?? project.tagline ?? undefined,
      heroImage: heroBlock.heroImage ?? project.thumb ?? undefined,
      details,
    } as unknown as ProjectBlock
  })
}

const loadProjectForMetadata = cache(async (slug: string) => {
  const {data} = await sanityFetch({
    query: projectBySlugQuery,
    params: {slug},
    stega: false,
  })

  return data as ProjectBySlugQueryResult | null
})

export async function generateStaticParams() {
  const projects = await client.fetch<AllProjectsQueryResult>(allProjectsQuery)
  return projects.filter((project) => project.slug?.current != null).map((project) => ({slug: project.slug!.current!}))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>
}): Promise<Metadata> {
  const {slug} = await params
  const project = await loadProjectForMetadata(slug)
  const origin = await resolveSiteOrigin()
  const seoContext = await resolveSeoContext({
    pathname: `/portfolio/${slug}`,
    origin,
    seo: project?.seo,
    fallbackTitle: project?.client,
    fallbackDescription: project?.tagline,
    fallbackImage: project?.thumb,
    schemaTypeFallback: 'WebPage',
    openGraphTypeFallback: 'website',
  })

  return buildRouteMetadata(seoContext)
}

export default async function CaseStudyDetailPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const project = (await sanityFetch({
    query: projectBySlugQuery,
    params: {slug},
  })) as {data: ProjectBySlugQueryResult | null}

  const projectData = project.data
  if (!projectData) {
    notFound()
  }

  const origin = await resolveSiteOrigin()
  const seoContext = await resolveSeoContext({
    pathname: `/portfolio/${slug}`,
    origin,
    seo: projectData.seo,
    fallbackTitle: projectData.client,
    fallbackDescription: projectData.tagline,
    fallbackImage: projectData.thumb,
    schemaTypeFallback: 'WebPage',
    openGraphTypeFallback: 'website',
  })
  const structuredData = buildRouteStructuredData({
    ...seoContext,
    routeType: 'project',
    pageBuilder: projectData.pageBuilder as Array<Record<string, unknown>> | null | undefined,
  })

  const caseStudyPageData: NonNullable<PageQueryResult> = {
    _id: projectData._id,
    _type: 'page',
    name: projectData.client,
    slug: projectData.slug,
    pageType: 'caseStudies',
    heading: null,
    subheading: null,
    seo: projectData.seo ?? null,
    pageBuilder: enrichProjectBlocks(projectData) as NonNullable<PageQueryResult>['pageBuilder'],
  }

  return (
    <>
      <StructuredDataScript nodes={structuredData} />
      <PageBuilderPage page={caseStudyPageData} />
    </>
  )
}
