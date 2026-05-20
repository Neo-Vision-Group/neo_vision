'use client'

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import ArrowRight from "@/components/icons/ArrowRightPixel";
import Image from "next/image";
import { AnimatedBorder } from "../AnimatedBorder";
import Badge from "./Badge";
import { useEffect, useState } from "react";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkTheme = resolvedTheme === "dark";
  const buttonColor = mounted && isDarkTheme
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
        {(article.author?.name || article.readTime) ? (
          <div className="absolute left-2 bottom-2">
            <Badge text={`${article.author?.name ? `${article.author.name} · ` : ''}${article.readTime ? `${article.readTime} min` : ''}`} />
          </div>
        ) : null}
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
            {category ? <Badge text={category} /> : null}
            
            <h3
              className={cn(
                "font-funnel-display-bold tracking-[-0.2px] text-black dark:text-white",
                featured
                  ? "text-100 leading-8 md:text-4xl md:leading-10"
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
          <span className="relative inline-flex items-center gap-3 self-start px-2 py-1 transition-colors duration-200 text-black dark:text-[#efefef] group-hover:text-brand">
            <AnimatedBorder groupHover />
            <ArrowRight
              color="currentColor"
              width={38}
              height={24}
              className="relative z-10 h-6 w-10 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
            />
            <span className="relative z-10 font-funnel text-100 font-bold leading-[1.2]">
              Read case study
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
