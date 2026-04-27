import Image from "next/image";
import Link from "next/link";
import { HeroBrandDotsBackground } from "@/components/partials/HeroBrandDotsBackground";
import type { InsightDoc } from "@/lib/types/insight";
import { urlForImage } from "@/sanity/lib/utils";

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

export function InsightHero({ post }: { post: InsightDoc }) {
  const publishedDate = formatDate(post.publishedAt);
  const categoryLabel = formatCategory(post.category);
  const slug = resolveSlug(post.slug);
  const coverImageUrl = post.coverImage
    ? urlForImage(post.coverImage)?.width(1600).height(900).fit("crop").url()
    : post.cover || null;

  return (
    <section className="has-hero-pattern relative isolate overflow-hidden border-b border-border bg-white text-[#111111] dark:bg-background dark:text-[#efefef]">
      <HeroBrandDotsBackground />
      <div className="absolute inset-0 bg-white/55 dark:bg-black/35" />

      <div className="relative px-4 pt-12 pb-14 md:px-6 md:pt-16 md:pb-20 xl:px-8 xl:pt-20 xl:pb-24">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-10">
          <nav className="flex flex-wrap items-center gap-2 text-[14px] leading-[1.4] text-black/55 dark:text-white/55 md:text-[18px]">
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

          <div className="flex max-w-[760px] flex-col gap-6 md:gap-8">
            {categoryLabel ? (
              <div className="inline-flex self-start bg-brand/25 px-3 py-1.5 text-[16px] leading-[1.2] text-black dark:text-white md:text-[18px]">
                {categoryLabel}
              </div>
            ) : null}

            <div className="flex flex-col gap-5 md:gap-6">
              <h1 className="max-w-[12ch] text-[44px] font-normal leading-[1.02] tracking-[-0.04em] md:text-[72px] xl:text-[88px]">
                {post.title}
              </h1>
              {post.excerpt ? (
                <p className="max-w-[34ch] text-[20px] leading-[1.45] text-black/80 dark:text-white/78 md:text-[24px]">
                  {post.excerpt}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 md:gap-5">
            {post.author?.name ? (
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-black/6 dark:bg-white/6">
                  {post.author.portrait ? (
                    <Image
                      src={urlForImage(post.author.portrait)?.width(112).height(112).fit("crop").url() || ""}
                      alt={post.author.name}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[18px] text-black/35 dark:text-white/35">
                      {post.author.name.charAt(0)}
                    </div>
                  )}
                  <span className="absolute inset-x-[-8px] top-0 h-px bg-brand" />
                  <span className="absolute inset-x-[-8px] bottom-0 h-px bg-brand" />
                  <span className="absolute inset-y-[-8px] left-0 w-px bg-brand" />
                  <span className="absolute inset-y-[-8px] right-0 w-px bg-brand" />
                </div>

                <div className="flex flex-col">
                  <p className="text-[24px] leading-[1.2] tracking-[-0.02em]">{post.author.name}</p>
                  <p className="text-[14px] leading-[1.2] tracking-[-0.03em] text-black/60 dark:text-white/60 md:text-[15px]">
                    {[post.author.role, publishedDate, post.readTime ? `${post.readTime} min read` : null]
                      .filter(Boolean)
                      .join(" | ")}
                  </p>
                </div>
              </div>
            ) : null}

            {slug ? (
              <div className="flex items-center gap-3 md:ml-4">
                <Link
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://twelveten.com/insights/${slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on LinkedIn"
                  className="flex h-12 w-12 items-center justify-center bg-white/75 text-black transition-colors hover:bg-brand hover:text-white dark:bg-white/10 dark:text-white dark:hover:bg-brand"
                >
                  <span className="text-[20px] font-semibold leading-none">in</span>
                </Link>
                <Link
                  href={`https://x.com/intent/post?url=${encodeURIComponent(`https://twelveten.com/insights/${slug}`)}&text=${encodeURIComponent(post.title ?? "Insight")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on X"
                  className="flex h-12 w-12 items-center justify-center bg-white/75 text-black transition-colors hover:bg-brand hover:text-white dark:bg-white/10 dark:text-white dark:hover:bg-brand"
                >
                  <span className="text-[20px] font-semibold leading-none">X</span>
                </Link>
                <Link
                  href={`mailto:?subject=${encodeURIComponent(post.title ?? "Insight")}&body=${encodeURIComponent(`https://twelveten.com/insights/${slug}`)}`}
                  aria-label="Share by email"
                  className="flex h-12 w-12 items-center justify-center bg-white/75 text-black transition-colors hover:bg-brand hover:text-white dark:bg-white/10 dark:text-white dark:hover:bg-brand"
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
                </Link>
              </div>
            ) : null}
          </div>

          {coverImageUrl ? (
            <div className="relative aspect-[16/9] w-full overflow-hidden border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
              <Image
                src={coverImageUrl}
                alt={post.title ?? "Insight cover image"}
                fill
                sizes="(min-width: 1280px) 1320px, (min-width: 768px) calc(100vw - 48px), calc(100vw - 32px)"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
