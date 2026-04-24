import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightHero } from "@/components/sections/insight-detail/InsightHero";
import { InsightAuthor } from "@/components/sections/insight-detail/InsightAuthor";
import { InsightRelated } from "@/components/sections/insight-detail/InsightRelated";
import PageBuilder from "@/components/PageBuilder";
import type { ArticleCardData } from "@/components/partials/ArticleCard";
import type { InsightDoc } from "@/lib/types/insight";
import { sanityFetch } from "@/sanity/lib/live";
import {
  INSIGHT_BY_SLUG_QUERY,
  ALL_INSIGHT_SLUGS_QUERY,
  ALL_INSIGHTS_QUERY,
} from "@/sanity/lib/queries";

export const revalidate = 60;

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: ALL_INSIGHT_SLUGS_QUERY,
    perspective: 'published',
    stega: false,
  })
  return data?.map((s: {slug: string}) => ({slug: s.slug})) || []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadInsight(slug);
  if (!post) return { title: "Insight — TwelveTen" };

  return {
    title: `${post.title ?? "Insight"} — TwelveTen`,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: `${post.title ?? "Insight"} — TwelveTen`,
      description: post.excerpt ?? undefined,
      url: `/insights/${slug}`,
      type: "article",
    },
  };
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
    console.error("[insight] Sanity fetch failed", err)
    return null
  }
}

function resolveArticleSlug(slug: ArticleCardData["slug"]) {
  if (!slug) return "";
  if (typeof slug === "string") return slug;
  return slug.current ?? "";
}

export default async function InsightDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await loadInsight(slug);
  if (!post) notFound();

  let related: ArticleCardData[] = post.relatedInsights ?? []
  if (!related || related.length === 0) {
    try {
      const {data: allPosts} = await sanityFetch({
        query: ALL_INSIGHTS_QUERY,
        stega: false,
      })
      related = (allPosts as ArticleCardData[])
        .filter((p) => resolveArticleSlug(p.slug) !== slug)
        .slice(0, 3)
    } catch {
      related = []
    }
  }

  return (
    <>
      <InsightHero post={post} />
      {post.pageBuilder && post.pageBuilder.length > 0 ? (
        <PageBuilder page={post as any} />
      ) : null}
      <InsightAuthor author={post.author} />
      <InsightRelated related={related} />
    </>
  );
}
