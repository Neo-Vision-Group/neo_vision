import { freeResourceBySlugQuery } from "@/sanity/lib/queries";
import {cache} from 'react'
import {sanityFetch} from '@/sanity/lib/live'
import {resolveSiteOrigin} from '@/app/site-origin'
import {notFound} from 'next/navigation'
import {buildRouteMetadata, buildRouteStructuredData, resolveSeoContext} from '@/sanity/lib/seo'
import HTMLViewer from "@/components/sections/free-resources/HTMLViewer";
import Image from "next/image";

import type { PageBuilderSection } from "@/sanity/lib/types";
import type { Seo } from "@/sanity.types";
import { StructuredDataScript } from "@/components/seo/StructuredDataScript";

import PDFViewerClient from '@/components/sections/free-resources/PDFViewerClient'

export type FreeResourcesData = {
    _id: string
    title?: string
    slug?: string
    description?: string
    badge?: string
    cta?: string
    file?: {
        type?: 'pdf' | 'image' | 'html'
        asset?: {
            asset?: {url: string}
        }
    }
    externalLink?: string
    askForEmail?: boolean
    seo?: Seo | null
    pageBuilder?: PageBuilderSection[]
}

export const revalidate = 60

const loadFreeResourceForMetadata = cache(async (slug: string): Promise<FreeResourcesData | null> => {
    try {
        const {data} = await sanityFetch({
            query: freeResourceBySlugQuery,
            params: {slug},
            stega: false,
        })

        return data as FreeResourcesData | null
    } catch (error) {
        console.error('[free resource] Sanity metadata fetch failed', error)
        return null
    }
})

export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
    const {slug} = await params
    const freeResourceData = await loadFreeResourceForMetadata(slug)
    if (!freeResourceData) {
        return {}
    }

    const origin = await resolveSiteOrigin()

    const seoContext = resolveSeoContext({
        pathname: `/free-resources/${slug}`,
        origin,
        seo: freeResourceData?.seo,
        fallbackTitle: freeResourceData?.title,
        fallbackDescription: freeResourceData?.description,
        schemaTypeFallback: 'Article',
        openGraphTypeFallback: 'article',
    })

    return buildRouteMetadata(await seoContext)
}

async function loadFreeResource(slug: string): Promise<FreeResourcesData | null> {
  try {
    const {data} = await sanityFetch({
      query: freeResourceBySlugQuery,
      params: {slug},
      stega: false,
    })

    return data as FreeResourcesData | null
  } catch (err) {
    console.error('[free resource] Sanity fetch failed', err)
    return null
  }
}

export default async function FreeResourcePage({
    params,
}: {
    params: Promise<{slug: string}>
}) {
    const {slug} = await params
    const freeResourceData = await loadFreeResource(slug)

    if (!freeResourceData) notFound()
    
    const origin = await resolveSiteOrigin()
    const seoContext = await resolveSeoContext({
        pathname: `/insights/${slug}`,
        origin,
        seo: freeResourceData.seo,
        fallbackTitle: freeResourceData.title,
        fallbackDescription: freeResourceData.description,
        schemaTypeFallback: 'Article',
        openGraphTypeFallback: 'article',
    })
    const structuredData = buildRouteStructuredData({
        ...seoContext,
        routeType: 'project',
        pageBuilder: freeResourceData.pageBuilder as Array<Record<string, unknown>> | null | undefined,
    })

    return (
        <>
            <StructuredDataScript nodes={structuredData} />
            <div>
                {/* In here, i will check what type of file I have and display it accordingly */}
                {freeResourceData.file && (
                    <div>
                        {freeResourceData.file.type === 'pdf' && (
                            <PDFViewerClient fileUrl={freeResourceData.file.asset?.asset?.url ?? ''} />
                        )}
                        {freeResourceData.file.type === 'image' && (
                            <Image src={freeResourceData.file.asset?.asset?.url ?? ''} alt={freeResourceData.title ?? 'Free Resource'} width={1200} height={800} />
                        )}
                        {freeResourceData.file.type === 'html' && (
                            <HTMLViewer fileUrl={freeResourceData.file.asset?.asset?.url ?? ''} />
                        )}
                    </div>
                )}
            </div>
        </>
    )
}