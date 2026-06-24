import { cache } from "react"
import { sanityFetch } from "@/sanity/lib/live"
import { authorQuery, getInsightsByAuthor } from "@/sanity/lib/queries"
import { resolveSiteOrigin } from "@/app/site-origin"
import { resolveSeoContext } from "@/sanity/lib/seo"
import { Seo } from "@/sanity.types"
import { buildRouteMetadata } from "@/sanity/lib/seo"
import { notFound } from "next/navigation"
import { buildRouteStructuredData } from "@/sanity/lib/seo"
import { StructuredDataScript } from "@/components/seo/StructuredDataScript"
import AuthorHero from "@/components/sections/author/AuthorHero"
import { InsightsGrid, type InsightsGridData } from "@/components/sections/insights/InsightsGrid"
import { ClosingCta } from "@/components/sections/home/CTA"

export type AuthorPageData  = {
    _id: string
    _type: string
    name: string,
    role: string
    bio: string
    portrait: string | null
    linkedin?: string | null
    instagram?: string | null
    facebook?: string | null
    github?: string | null
    x?: string | null
    tiktok?: string | null
    badges?: string[]
    seo?: Seo | null
}

export const revalidate = 60

const loadAuthor = cache(async (slug: string): Promise<AuthorPageData | null> => {
    try {
        const { data } = await sanityFetch({
            query: authorQuery,
            params: { slug },
            stega: false,
        })
        return data as AuthorPageData | null
    } catch (err) {
        console.error('[free resource] Sanity fetch failed', err)
        return null
    }
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const authorData = await loadAuthor(slug)
    if (!authorData) {
        return {}
    }

    const origin = await resolveSiteOrigin()
    const seoContext = await resolveSeoContext({
        pathname: `/author/${slug}`,
        origin,
        seo: authorData.seo,
        fallbackTitle: authorData.name,
        fallbackDescription: authorData.bio,
        schemaTypeFallback: 'ProfilePage',
        openGraphTypeFallback: 'profile',
    })

    return buildRouteMetadata(seoContext)
}

export default async function FreeResourcePage({
    params
}: { params: Promise<{ slug: string}> }) {
    const { slug } = await params
    const authorData = await loadAuthor(slug)

    if (!authorData) notFound()

    const { data: authorPosts } = await sanityFetch({
        query: getInsightsByAuthor,
        params: { id: authorData._id },
        stega: false,
    })

    const origin = await resolveSiteOrigin()

    const seoContext = await resolveSeoContext({
        pathname: `/author/${slug}`,
        origin,
        seo: authorData.seo,
        fallbackTitle: authorData.name,
        fallbackDescription: authorData.bio,
        schemaTypeFallback: 'ProfilePage',
        openGraphTypeFallback: 'profile',
    })
    const structuredData = buildRouteStructuredData({
        ...seoContext,
        routeType: 'author',
        pageBuilder: null
    })

    return (
        <>
            <StructuredDataScript nodes={structuredData} />
            <AuthorHero
                name={authorData.name}
                role={authorData.role}
                bio={authorData.bio}
                portrait={authorData.portrait ?? ''}
                linkedin={authorData.linkedin ?? undefined}
                instagram={authorData.instagram ?? undefined}
                facebook={authorData.facebook ?? undefined}
                github={authorData.github ?? undefined}
                x={authorData.x ?? undefined}
                tiktok={authorData.tiktok ?? undefined}
                badges={authorData.badges ?? []}
            />
            <InsightsGrid data={{ items: (authorPosts ?? []) as InsightsGridData['items'] }} />
            <ClosingCta data={{
                heading: "Ready to work **together?**",
                body: "Let's talk about what AI can do for your business.",
                cta: { buttonText: "Get in touch", link: { _type: 'link' as const, linkType: 'href' as const, href: "/contact" } },
            }} />
        </>
    )

}