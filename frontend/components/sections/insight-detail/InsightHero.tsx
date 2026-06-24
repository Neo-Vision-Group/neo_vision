"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/partials/Badge";
import { AnimatedBorder } from "@/components/AnimatedBorder";
import type { InsightDoc } from "@/app/insights/[slug]/page";
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

function formatCategory(value?: string | {title?: string | null} | null) {
  if (!value) return null;
  // Handle new object format from Sanity reference
  if (typeof value === 'object' && value.title) {
    return value.title;
  }
  // Handle old string format (slug)
  if (typeof value === 'string') {
    return value
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return null;
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

export function InsightHero({ post, origin = '' }: { post: InsightDoc; origin?: string }) {
  const publishedDate = formatDate(post.publishedAt);
  const categoryLabel = formatCategory(post.category);
  const slug = resolveSlug(post.slug);
  const coverImageUrl = post.coverImage
    ? urlForImage(post.coverImage)?.width(1200).height(1200).fit("crop").url()
    : post.cover || null;

  return (
    <section className="has-hero-pattern bg-transparent relative isolate min-h-screen text-[#111111] dark:text-[#efefef]">
      <div className="relative flex flex-col pt-8 pb-8 md:pt-10 md:pb-10">
        {/* Breadcrumb — padded to match navbar */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 px-4 text-[14px] leading-[1.4] text-black/55 dark:text-white/55 md:px-12 md:text-[16px] lg:px-16 2xl:px-30">
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

        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
          {/* Left column — text content, padded to match navbar */}
          <div className="flex flex-col gap-8 px-4 md:gap-12 md:px-12 lg:w-1/2 lg:shrink-0 lg:gap-16 lg:px-16 2xl:px-30">
            {categoryLabel ? (
              <div className="self-start">
                <Badge text={categoryLabel} />
              </div>
            ) : null}

            <div className="flex flex-col gap-2 md:gap-2">
              <h1 className="text-[28px]! font-normal! leading-[1.1]! tracking-[-0.02em]! md:text-[40px]! xl:text-[52px]! 2xl:text-[72px]!">
                {post.title}
              </h1>
              {post.excerpt ? (
                <p className="text-[16px] leading-[1.4] text-black/80 dark:text-white/78 md:text-[18px] xl:text-[20px]">
                  {post.excerpt}
                </p>
              ) : null}
            </div>

            <div className="mt-auto flex flex-col items-start gap-4 md:gap-5">
              {post.author?.name ? (
                <div className="flex items-center gap-4 md:gap-5">
                  <div className="relative h-10 w-10 shrink-0 bg-black/6 dark:bg-white/6">
                    {post.author.portrait ? (
                      <BorderWrapper className="h-full w-full">
                        <Image
                          src={urlForImage(post.author.portrait)?.width(112).height(112).fit("crop").url() || ""}
                          alt={post.author.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </BorderWrapper>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[16px] text-black/35 dark:text-white/35">
                        {post.author.name.charAt(0)}
                      </div>
                    )}
                    <span className="absolute inset-x-0 top-0 h-px bg-brand" />
                    <span className="absolute inset-x-0 bottom-0 h-px bg-brand" />
                    <span className="absolute inset-y-0 left-0 w-px bg-brand" />
                    <span className="absolute inset-y-0 right-0 w-px bg-brand" />
                  </div>

                  <div className="flex flex-col">
                    <p className="text-[16px] leading-[1.2] tracking-[-0.02em] md:text-[18px]">{post.author.name}</p>
                    <p className="text-[12px] leading-[1.2] tracking-[-0.02em] text-black/60 dark:text-white/60 md:text-[14px] xl:text-[16px]">
                      {[post.author.role, publishedDate, post.readTime ? `${post.readTime} min read` : null]
                        .filter(Boolean)
                        .join(" | ")}
                    </p>
                  </div>
                </div>
              ) : null}

              {slug ? (
                <div className="flex items-center gap-4 md:gap-6">
                  <ShareButton
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${origin}/insights/${slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on LinkedIn"
                  >
                    <span className="text-[22px] font-semibold leading-none">in</span>
                  </ShareButton>
                  <ShareButton
                    href={`https://x.com/intent/post?url=${encodeURIComponent(`${origin}/insights/${slug}`)}&text=${encodeURIComponent(post.title ?? "Insight")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on X"
                  >
                    <span className="text-[22px] font-semibold leading-none">X</span>
                  </ShareButton>
                  <ShareButton
                    href={`mailto:?subject=${encodeURIComponent(post.title ?? "Insight")}&body=${encodeURIComponent(`${origin}/insights/${slug}`)}`}
                    aria-label="Share by email"
                  >
                    <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden="true">
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

          {/* Right column — fixed square ~70vh, flush to right */}
          {coverImageUrl ? (
            <div className="flex min-w-0 flex-1 items-center justify-center lg:justify-end lg:pr-0 px-6 md:px-0">
              <div
                className="relative shrink-0 aspect-video"
                style={{ width: "min(90vh, 100%)" }}
              >
                <div className="absolute inset-0 overflow-hidden bg-[#f2f2f2] dark:bg-[#0f0f0f]">
                  <Image
                    src={coverImageUrl}
                    alt={post.title ?? "Insight cover image"}
                    fill
                    priority
                    sizes="(min-width: 1024px) 70vh, (min-width: 768px) calc(100vw - 96px), calc(100vw - 32px)"
                    className="object-cover"
                  />
                </div>
                {/* BorderWrapper-style overflow corners — spans live on the outer wrapper so they aren't clipped */}
                <span aria-hidden="true" className="pointer-events-none absolute left-0 top-[-2.5%] h-[105%] w-px bg-brand" />
                <span aria-hidden="true" className="pointer-events-none absolute left-[-2.5%] top-0 h-px w-[105%] bg-brand" />
                <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-[-2.5%] h-px w-[105%] bg-brand" />
                <span
                  aria-hidden="true"
                  className="absolute lg:hidden right-0 top-[-2.5%] h-[105%] w-px bg-brand"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
