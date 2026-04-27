import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBuilder from "@/components/PageBuilder";
import type { ArticleCardData } from "@/components/partials/ArticleCard";
import { InsightAuthor } from "@/components/sections/insight-detail/InsightAuthor";
import { InsightHero } from "@/components/sections/insight-detail/InsightHero";
import { InsightRelated } from "@/components/sections/insight-detail/InsightRelated";
import { PageTransitionMarker } from "@/components/transition/PageTransitionMarker";
import type { InsightDoc } from "@/lib/types/insight";
import { sanityFetch } from "@/sanity/lib/live";
import {
  ALL_INSIGHTS_QUERY,
  ALL_INSIGHT_SLUGS_QUERY,
  INSIGHT_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";

export const revalidate = 60;

export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: ALL_INSIGHT_SLUGS_QUERY,
    perspective: "published",
    stega: false,
  });

  return data?.map((entry: { slug: string }) => ({ slug: entry.slug })) || [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadInsight(slug);

  if (!post) {
    return { title: "Insight - TwelveTen" };
  }

  return {
    title: `${post.title ?? "Insight"} - TwelveTen`,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: `${post.title ?? "Insight"} - TwelveTen`,
      description: post.excerpt ?? undefined,
      url: `/insights/${slug}`,
      type: "article",
      images: post.cover ? [{ url: post.cover, alt: post.title ?? "Insight" }] : undefined,
    },
  };
}

async function loadInsight(slug: string): Promise<InsightDoc | null> {
  try {
    const { data } = await sanityFetch({
      query: INSIGHT_BY_SLUG_QUERY,
      params: { slug },
      stega: false,
    });

    return data as InsightDoc | null;
  } catch (err) {
    console.error("[insight] Sanity fetch failed", err);
    return null;
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

  let related: ArticleCardData[] = post.relatedInsights ?? [];

  if (!related || related.length === 0) {
    try {
      const { data: allPosts } = await sanityFetch({
        query: ALL_INSIGHTS_QUERY,
        stega: false,
      });

      related = (allPosts as ArticleCardData[])
        .filter((entry) => resolveArticleSlug(entry.slug) !== slug)
        .slice(0, 3);
    } catch {
      related = [];
    }
  }

  return (
    <>
      <InsightHero post={post} />
      {post.pageBuilder && post.pageBuilder.length > 0 ? (
        <PageBuilder deferRouteReadySignal page={post as any} />
      ) : null}
      <InsightAuthor author={post.author} />
      <InsightRelated related={related} />
      <PageTransitionMarker hasHeroPattern />
    </>
  );
}
