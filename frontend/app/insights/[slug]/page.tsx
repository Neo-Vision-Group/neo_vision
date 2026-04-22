import type { Metadata } from "next";
import type { PortableTextBlock } from "@portabletext/react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/partials/Button";
import { PortableTextRenderer } from "@/components/partials/PortableTextRenderer";
import { NewsletterForm } from "@/components/sections/insight/NewsletterForm";
import { urlForImage } from "@/sanity/lib/utils";
import { sanityFetch } from "@/sanity/lib/live";
import {
  INSIGHT_BY_SLUG_QUERY,
  ALL_INSIGHT_SLUGS_QUERY,
  ALL_INSIGHTS_QUERY,
} from "@/sanity/lib/queries";

export const revalidate = 60;

type InsightDoc = {
  _id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  category?: string;
  cover?: any;
  publishedAt?: string;
  readTime?: number;
  featured?: boolean;
  body?: PortableTextBlock[];
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

function formatDate(iso?: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatCategory(value?: string | null) {
  if (!value) return null;
  return value
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function InsightDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await loadInsight(slug);
  if (!post) notFound();

  const publishedDate = formatDate(post.publishedAt);
  const categoryLabel = formatCategory(post.category);

  // Related insights: use manual pinned relatedInsights, or fall back to most recent
  let related = post.relatedInsights ?? []
  if (!related || related.length === 0) {
    try {
      const {data: allPosts} = await sanityFetch({
        query: ALL_INSIGHTS_QUERY,
        stega: false,
      })
      related = (allPosts as InsightDoc[])
        .filter((p) => p.slug !== slug)
        .slice(0, 3)
    } catch {
      related = []
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-background">
        <div className="flex flex-col gap-12 px-6 pt-[120px] md:px-12 lg:px-16 xl:px-24 2xl:px-32 pb-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[18px] font-funnel text-muted whitespace-nowrap">
            <Link href="/insights" className="text-muted hover:text-brand transition-colors">
              Insights
            </Link>
            <span className="text-muted">/</span>
            {categoryLabel ? (
              <>
                <span className="text-muted">{categoryLabel}</span>
                <span className="text-brand">/</span>
              </>
            ) : null}
            <span className="text-brand">{post.title}</span>
          </div>

          <div className="flex flex-col gap-8">
            {/* Category Badge */}
            {categoryLabel ? (
              <div className="inline-flex w-fit">
                <Link
                  href="/insights"
                  className="bg-brand/30 px-4 py-2 text-[18px] font-funnel text-foreground"
                >
                  {categoryLabel}
                </Link>
              </div>
            ) : null}

            {/* Title and Excerpt */}
            <div className="flex flex-col gap-6 max-w-[660px]">
              <h1 className="text-[48px] font-funnel font-normal leading-[1.2] tracking-[-1px] text-foreground md:text-[56px]">
                {post.title}
              </h1>
              {post.excerpt ? (
                <p className="text-[18px] font-funnel leading-[1.5] text-foreground/80 max-w-[683px]">
                  {post.excerpt}
                </p>
              ) : null}
            </div>

            {/* Author and Meta */}
            <div className="flex flex-wrap items-center gap-6 text-[18px] font-funnel text-muted">
              {post.author?.name ? (
                <div className="flex items-center gap-3">
                  {post.author.portrait ? (
                    <div className="relative size-[60px] bg-surface">
                      <Image
                        src={urlForImage(post.author.portrait)?.url() || ''}
                        alt={post.author.name}
                        width={60}
                        height={60}
                        className="object-cover"
                      />
                      <div className="absolute inset-0 border border-brand/50" />
                    </div>
                  ) : null}
                  <span className="text-foreground">{post.author.name}</span>
                </div>
              ) : null}
              {publishedDate ? <span>{publishedDate}</span> : null}
              {post.readTime ? <span>{post.readTime} min read</span> : null}
            </div>
          </div>
        </div>
        {post.cover ? (
          <div className="aspect-[16/9] w-full overflow-hidden border-t border-border bg-black md:aspect-[21/9]">
            <Image
              src={urlForImage(post.cover)?.url() || ''}
              alt={post.title || ''}
              width={1200}
              height={630}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
      </section>

      {/* Body */}
      {post.body && post.body.length > 0 ? (
        <section id="body" className="px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-16">
          <article className="mx-auto max-w-[72ch]">
            <PortableTextRenderer value={post.body} />
          </article>
        </section>
      ) : null}

      {/* Author bio */}
      {post.author?.bio ? (
        <section id="author" className="px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-16">
          <div className="flex flex-col gap-6 border border-white/10 bg-surface p-6 md:flex-row md:items-start md:gap-8 md:p-8 max-w-4xl">
            {post.author.portrait ? (
              <div className="h-24 w-24 shrink-0 overflow-hidden border border-white/10 bg-black">
                <Image
                  src={urlForImage(post.author.portrait)?.url() || ''}
                  alt={post.author.name ?? ""}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
            <div className="flex flex-col gap-2">
              <p className="text-[24px] font-funnel font-bold text-foreground">{post.author.name}</p>
              {post.author.role ? (
                <p className="font-mono text-[14px] uppercase tracking-wider text-muted">
                  {post.author.role}
                </p>
              ) : null}
              <p className="mt-2 text-[18px] font-funnel text-foreground/80">{post.author.bio}</p>
            </div>
          </div>
        </section>
      ) : null}

      {/* Closing CTA */}
      <section id="closing" className="px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-16">
        <div className="flex flex-col gap-6 border border-brand/40 bg-surface p-8 md:p-12 max-w-4xl">
          <h2 className="text-[36px] font-funnel font-normal leading-[1.2] tracking-[-1px] text-foreground md:text-[44px]">
            Ready to ship this? <span className="font-bold">Let&apos;s talk scope.</span>
          </h2>
          <p className="max-w-[60ch] text-[18px] font-funnel text-foreground/70">
            Every engagement starts with a short discovery, no sales pitch.
          </p>
          <div>
            <Button href="/contact" variant="primary">
              Book a call
            </Button>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 ? (
        <section id="related" className="px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-16">
          <h2 className="text-[36px] font-funnel font-normal leading-[1.2] tracking-[-1px] text-foreground mb-8">
            <span className="font-bold">Keep reading.</span>
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {related.slice(0, 3).map((r, idx) => (
              <Link
                key={r._id ?? r.title ?? idx}
                href={`/insights/${(r.slug as any)?.current || r.slug}`}
                className="border border-white/10 bg-surface p-6 hover:border-brand/40 transition-colors"
              >
                {r.category && (
                  <span className="text-[14px] font-funnel uppercase tracking-wider text-brand mb-2 block">
                    {formatCategory(r.category)}
                  </span>
                )}
                <h3 className="text-[24px] font-funnel font-bold text-foreground mb-2">
                  {r.title || 'Untitled'}
                </h3>
                {r.excerpt && (
                  <p className="text-[18px] font-funnel text-foreground/70 line-clamp-3">
                    {r.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Newsletter */}
      <section id="newsletter" className="px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-16 border-t border-border">
        <div className="flex flex-col gap-6 max-w-4xl">
          <h2 className="text-[36px] font-funnel font-normal leading-[1.2] tracking-[-1px] text-foreground">
            <span className="text-foreground/70">Liked this? </span>
            <span className="font-bold">Get the newsletter.</span>
          </h2>
          <p className="max-w-[60ch] text-[18px] font-funnel text-foreground/70">
            One post per month, no fluff, no sales pitch.
          </p>
          <NewsletterForm source={`/insights/${slug}`} />
        </div>
      </section>
    </>
  );
}
