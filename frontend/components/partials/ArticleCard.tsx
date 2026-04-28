'use client'

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import ArrowRight from "@/components/icons/ArrowRightPixel";
import Image from "next/image";

export type ArticleCardData = {
  _id?: string;
  title: string;
  slug?: { current?: string } | string | null;
  excerpt?: string | null;
  category?: string | null;
  publishedAt?: string | null;
  readTime?: number | null;
  cover?: string | null;
  author?: {
    name?: string | null;
    role?: string | null;
  };
};

function resolveSlug(slug: ArticleCardData["slug"]): string {
  if (!slug) return "";
  if (typeof slug === "string") return slug;
  return slug.current ?? "";
}

function formatCategory(value?: string | null) {
  if (!value) return null;
  return value
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function ArticleCard({
  article,
  featured = false,
  className,
}: {
  article: ArticleCardData;
  featured?: boolean;
  className?: string;
}) {
  const slug = resolveSlug(article.slug);
  const href = slug ? `/insights/${slug}` : "#";
  const category = formatCategory(article.category);

  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === "dark";
    const buttonColor = isDarkTheme
    ? "#EFEFEF"
    : "#040404";

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden border border-black/10 dark:border-white/10 bg-[#f0f0f0] dark:bg-black transition-all duration-300 ease-out hover:border-(--brand,#ff4100)/40 hover:-translate-y-0.5",
        featured ? "md:flex-row" : "",
        className
      )}
    >
      <div
        className={cn(
          "relative bg-gray-100 dark:bg-black",
          featured
            ? "aspect-video md:aspect-3/2 md:w-1/2"
            : "aspect-16/10"
        )}
      >
        {article.cover ? (
          <>
            <Image
              src={article.cover}
              alt={article.title}
              fill
              sizes={featured ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 1024px) 50vw, 100vw"}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-b from-[#c1c9c5]/20 from-35% to-[#ff4100]/30" />
          </>
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-gray-200 via-gray-100 to-brand/10" />
        )}
        
        {/* Author + read time badge */}
        <div className="absolute w-full left-2 bottom-2 bg-[rgba(255,65,0,0.3)] p-2">
          <p className="font-funnel-display text-[14px] leading-[1.2] tracking-[-0.5px] text-black dark:text-white">
            {article.author?.name ? `${article.author.name} · ` : ''}
            {article.readTime ? `${article.readTime} min` : ''}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col gap-12 p-6 md:p-8",
          featured ? "md:justify-center" : ""
        )}
      >
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            {/* Category badge */}
            {category ? (
              <div className="bg-[rgba(255,65,0,0.3)] p-2.5 self-start">
                <p className="font-funnel-display text-[18px] leading-normal text-black dark:text-white">
                  {category}
                </p>
              </div>
            ) : null}
            
            <h3
              className={cn(
                "font-funnel-display-bold tracking-[-0.2px] text-black dark:text-white",
                featured
                  ? "text-100 leading-8 md:text-deco-h4 md:leading-10"
                  : "text-100 leading-[1.2]"
              )}
            >
              {article.title}
            </h3>
          </div>
          
          {article.excerpt ? (
            <p className="font-funnel-display text-[18px] leading-normal text-black/70 dark:text-white/70">
              {article.excerpt}
            </p>
          ) : null}
        </div>
        
        <div className="mt-auto flex items-center gap-3 pt-4">
          <ArrowRight width={38.4} height={24} color={buttonColor} />
          <span className="font-funnel-display-bold text-100 leading-[1.2] text-black dark:text-white transition-transform duration-200 group-hover:translate-x-0.5">
            Read
          </span>
        </div>
      </div>
    </Link>
  );
}
