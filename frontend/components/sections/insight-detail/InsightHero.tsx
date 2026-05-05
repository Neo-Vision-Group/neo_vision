"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeroBrandDotsBackground } from "@/components/partials/HeroBrandDotsBackground";
import Badge from "@/components/partials/Badge";
import { AnimatedBorder } from "@/components/AnimatedBorder";
import type { InsightDoc } from "@/lib/types/insight";
import { urlForImage } from "@/sanity/lib/utils";
import { BorderWrapper } from "@/components/BorderWrapper";

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
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function resolveSlug(slug?: InsightDoc["slug"]) {
  if (!slug) return "";
  if (typeof slug === "string") return slug;
  return slug.current ?? "";
}

function ShareButton({
  href,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link> & { children: React.ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Link
      href={href}
      {...props}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex h-12 w-12 items-center justify-center hover:bg-brand-dark text-dark transition-colors duration-300 active:bg-brand dark:text-white"
    >
      <AnimatedBorder isHovered={isHovered} />
      {children}
    </Link>
  );
}

export function InsightHero({ post }: { post: InsightDoc }) {
  const publishedDate = formatDate(post.publishedAt);
  const categoryLabel = formatCategory(post.category);
  const slug = resolveSlug(post.slug);
  const coverImageUrl = post.coverImage
    ? urlForImage(post.coverImage)?.width(1600).height(900).fit("crop").url()
    : post.cover || null;

  return (
    <section className="has-hero-pattern relative isolate overflow-hidden bg-white text-[#111111] dark:bg-background dark:text-[#efefef]">
      <HeroBrandDotsBackground />
      <div className="absolute inset-0 bg-white/55 dark:bg-black/35" />

      <div className="relative pt-12 pb-14 md:pt-16 md:pb-20 xl:pt-20 xl:pb-24">
        {/* Breadcrumb — padded to match navbar */}
        <nav className="mb-10 flex flex-wrap items-center gap-2 px-4 text-[14px] leading-[1.4] text-black/55 dark:text-white/55 md:px-12 md:text-[18px] lg:px-16 2xl:px-30">
          <Link href="/insights" className="transition-colors hover:text-black dark:hover:text-white">
            Insights
          </Link>
          <span>/</span>
          {categoryLabel ? (
            <>
              <Link href="/insights" className="transition-colors hover:text-black dark:hover:text-white">
                {categoryLabel}
              </Link>
              <span className="text-brand">/</span>
            </>
          ) : null}
          <span className="text-brand">{post.title}</span>
        </nav>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch">
          {/* Left column — text content, padded to match navbar */}
          <div className="flex flex-col gap-6 px-4 md:gap-8 md:px-12 lg:w-1/2 lg:shrink-0 lg:px-16 2xl:px-30">
            {categoryLabel ? (
              <div className="self-start">
                <Badge text={categoryLabel} />
              </div>
            ) : null}

            <div className="flex flex-col gap-5 md:gap-6">
              <h1 className="text-[44px] font-normal leading-[1.02] tracking-[-0.04em] md:text-[72px] xl:text-[80px]">
                {post.title}
              </h1>
              {post.excerpt ? (
                <p className="max-w-[34ch] text-[20px] leading-[1.45] text-black/80 dark:text-white/78 md:text-100">
                  {post.excerpt}
                </p>  
              ) : null}
            </div>

            <div className="mt-auto flex flex-col items-start gap-4 md:gap-5">
              {post.author?.name ? (
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-black/6 dark:bg-white/6">
                    {post.author.portrait ? (
                      <BorderWrapper>
                        <Image
                          src={urlForImage(post.author.portrait)?.width(112).height(112).fit("crop").url() || ""}
                          alt={post.author.name}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      </BorderWrapper>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[18px] text-black/35 dark:text-white/35">
                        {post.author.name.charAt(0)}
                      </div>
                    )}
                    <span className="absolute -inset-x-2 top-0 h-px bg-brand" />
                    <span className="absolute -inset-x-2 bottom-0 h-px bg-brand" />
                    <span className="absolute -inset-y-2 left-0 w-px bg-brand" />
                    <span className="absolute -inset-y-2 right-0 w-px bg-brand" />
                  </div>

                  <div className="flex flex-col">
                    <p className="text-100 leading-[1.2] tracking-[-0.02em]">{post.author.name}</p>
                    <p className="text-[14px] leading-[1.2] tracking-[-0.03em] text-black/60 dark:text-white/60 md:text-64">
                      {[post.author.role, publishedDate, post.readTime ? `${post.readTime} min read` : null]
                        .filter(Boolean)
                        .join(" | ")}
                    </p>
                  </div>
                </div>
              ) : null}

              {slug ? (
                <div className="flex items-center gap-3">
                  <ShareButton
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://Neo Vision.com/insights/${slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on LinkedIn"
                  >
                    <span className="text-[20px] font-semibold leading-none">in</span>
                  </ShareButton>
                  <ShareButton
                    href={`https://x.com/intent/post?url=${encodeURIComponent(`https://Neo Vision.com/insights/${slug}`)}&text=${encodeURIComponent(post.title ?? "Insight")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on X"
                  >
                    <span className="text-[20px] font-semibold leading-none">X</span>
                  </ShareButton>
                  <ShareButton
                    href={`mailto:?subject=${encodeURIComponent(post.title ?? "Insight")}&body=${encodeURIComponent(`https://Neo Vision.com/insights/${slug}`)}`}
                    aria-label="Share by email"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <path
                        d="M2.25 4.5H15.75V13.5H2.25V4.5ZM3.75 6L9 9.75L14.25 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </ShareButton>
                </div>
              ) : null}
            </div>
          </div>

          {/* Right column — cover image, bleeds to right viewport edge */}
          {coverImageUrl ? (
            <div className="relative min-h-64 w-full overflow-hidden border-y border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5 lg:min-h-0 lg:flex-1">
              <Image
                src={coverImageUrl}
                alt={post.title ?? "Insight cover image"}
                fill
                sizes="(min-width: 1024px) 50vw, (min-width: 768px) calc(100vw - 48px), calc(100vw - 32px)"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
