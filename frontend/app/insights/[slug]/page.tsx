import type { Metadata } from "next";
import type { PortableTextBlock } from "@portabletext/react";
import { notFound } from "next/navigation";
import { InsightHero } from "@/components/sections/insight-detail/InsightHero";
import { InsightBody } from "@/components/sections/insight-detail/InsightBody";
import { InsightAuthor } from "@/components/sections/insight-detail/InsightAuthor";
import { InsightClosingCta } from "@/components/sections/insight-detail/InsightClosingCta";
import { InsightRelated } from "@/components/sections/insight-detail/InsightRelated";
import { InsightNewsletter } from "@/components/sections/insight-detail/InsightNewsletter";
import PageBuilder from "@/components/PageBuilder";
import type { ArticleCardData } from "@/components/partials/ArticleCard";
import { sanityFetch } from "@/sanity/lib/live";
import {
  INSIGHT_BY_SLUG_QUERY,
  ALL_INSIGHT_SLUGS_QUERY,
  ALL_INSIGHTS_QUERY,
} from "@/sanity/lib/queries";

export const revalidate = 60;

type InsightDoc = {
  _id?: string;
  _type?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  category?: string;
  cover?: any;
  publishedAt?: string;
  readTime?: number;
  featured?: boolean;
  body?: any[];
  pageBuilder?: any[];
  author?: {
    name?: string;
    role?: string;
    bio?: string;
    portrait?: any;
  };
  relatedInsights?: InsightDoc[];
};

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
    title: `${post.title} — TwelveTen`,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: `${post.title} — TwelveTen`,
      description: post.excerpt ?? undefined,
      url: `/insights/${slug}`,
      type: "article",
      images: post.cover ? [post.cover] : undefined,
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
        .filter((p) => p.slug !== slug)
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
      ) : (
        <InsightBody body={post.body} />
      )}
      <InsightAuthor author={post.author} />
      <InsightClosingCta />
      <InsightRelated related={related} />
      <InsightNewsletter slug={slug} />
    </>
  );
}