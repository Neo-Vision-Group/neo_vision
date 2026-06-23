import { freeResourceBySlugQuery } from "@/sanity/lib/queries";
import { defineQuery } from 'next-sanity'
import { cache } from 'react'
import { sanityFetch } from '@/sanity/lib/live'
import { client } from '@/sanity/lib/client'
import { resolveSiteOrigin } from '@/app/site-origin'
import { notFound } from 'next/navigation'
import { buildRouteMetadata, buildRouteStructuredData, resolveSeoContext } from '@/sanity/lib/seo'
import type { PageBuilderSection } from "@/sanity/lib/types";
import type { Seo } from "@/sanity.types";
import { StructuredDataScript } from "@/components/seo/StructuredDataScript";
import { PageHero } from "@/components/sections/PageHero";
import type { PageHeroData } from "@/components/sections/PageHero";
import { PageTransitionMarker } from "@/components/transition/PageTransitionMarker";

import FreeResourceGate from '@/components/sections/free-resources/FreeResourceGate'

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
    downloadCta?: {
        heading?: string
        subheading?: string
        buttonText?: string
    }
    seo?: Seo | null
    pageBuilder?: PageBuilderSection[]
}

export const revalidate = 60

const allFreeResourceSlugsQuery = defineQuery(
    `*[_type == "freeResource" && defined(slug.current)]{"slug": slug.current}`
)

export async function generateStaticParams() {
    try {
        const slugs = await client.fetch<Array<{ slug: string }>>(
            allFreeResourceSlugsQuery,
            {},
            { perspective: 'published', stega: false }
        )
        return (slugs ?? []).map(({ slug }) => ({ slug }))
    } catch {
        return []
    }
}

const loadFreeResource = cache(async (slug: string): Promise<FreeResourcesData | null> => {
    try {
        const { data } = await sanityFetch({
            query: freeResourceBySlugQuery,
            params: { slug },
            stega: false,
        })
        return data as FreeResourcesData | null
    } catch (err) {
        console.error('[free resource] Sanity fetch failed', err)
        return null
    }
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const freeResourceData = await loadFreeResource(slug)
    if (!freeResourceData) {
        return {}
    }

    const origin = await resolveSiteOrigin()
    const seoContext = await resolveSeoContext({
        pathname: `/free-resources/${slug}`,
        origin,
        seo: freeResourceData.seo,
        fallbackTitle: freeResourceData.title,
        fallbackDescription: freeResourceData.description,
        schemaTypeFallback: 'Article',
        openGraphTypeFallback: 'article',
    })

    return buildRouteMetadata(seoContext)
}

export default async function FreeResourcePage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const freeResourceData = await loadFreeResource(slug)

    if (!freeResourceData) notFound()

    const origin = await resolveSiteOrigin()
    const seoContext = await resolveSeoContext({
        pathname: `/free-resources/${slug}`,
        origin,
        seo: freeResourceData.seo,
        fallbackTitle: freeResourceData.title,
        fallbackDescription: freeResourceData.description,
        schemaTypeFallback: 'Article',
        openGraphTypeFallback: 'article',
    })
    const structuredData = buildRouteStructuredData({
        ...seoContext,
        routeType: 'post',
        pageBuilder: freeResourceData.pageBuilder as Array<Record<string, unknown>> | null | undefined,
    })

    const pageHeroData: PageHeroData = {
        eyebrow: freeResourceData.badge,
        heading: [
            {
                _type: "block",
                _key: "hero-heading",
                style: "normal",
                markDefs: [],
                children: [{ _type: "span", _key: "hero-span", text: freeResourceData.title ?? "", marks: [] }],
            },
        ],
        subheading: freeResourceData.description,
    }

    return (
        <>
            <StructuredDataScript nodes={structuredData} />
            <PageHero data={pageHeroData} />
            <div>
                <FreeResourceGate resource={freeResourceData} />
            </div>
            <PageTransitionMarker />
        </>
    )
}