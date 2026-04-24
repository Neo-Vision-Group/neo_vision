"use client";

import { useMemo, useState } from "react";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { ArticleCard, type ArticleCardData } from "@/components/partials/ArticleCard";
import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  { ssr: false }
);

export type InsightsGridData = {
  items?: Array<ArticleCardData & { category?: string | null }>;
  categoryFilters?: Array<{ label?: string; value?: string }>;
};

function getArticleKey(article: ArticleCardData) {
  if (article._id) return article._id;
  const slug = typeof article.slug === "string" ? article.slug : article.slug?.current;
  if (slug) return slug;
  if (article.publishedAt) return `${article.title}-${article.publishedAt}`;
  return article.title;
}

export function InsightsGrid({ data }: { data?: InsightsGridData }) {
  const cleanData = data ? cleanStega(data) : data;

  const categoryOptions = (
    cleanData?.categoryFilters ?? [
      { label: "All", value: "all" },
      { label: "Engineering", value: "engineering" },
      { label: "AI Transformation", value: "ai-transformation" },
      { label: "Both", value: "both" },
    ]
  ).map((f) => ({ label: f.label ?? "All", value: f.value ?? "all" }));

  const items: Array<ArticleCardData & { category?: string | null }> =
    cleanData?.items ?? [];

  const [categoryFilter, setCategoryFilter] = useState(categoryOptions[0]?.value ?? "all");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      return (
        categoryFilter === "all" ||
        item.category?.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    });
  }, [items, categoryFilter]);

  const eyebrow = (
    <div className="flex flex-col gap-12">
      <p className="font-betatron text-[32px] leading-[1.2] text-black dark:text-[#efefef]">
        BY CATEGORY
      </p>

      {/* Category Filters */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-5">
          {categoryOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setCategoryFilter(option.value)}
              className={`relative text-left text-[18px] leading-[1.5] transition-colors ${
                categoryFilter === option.value
                  ? "bg-brand text-white"
                  : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
              }`}
            >
              <span className="relative z-10 px-2 py-2 inline-block">{option.label}</span>
              {categoryFilter === option.value && (
                <>
                  <div className="absolute -left-1 -top-0 h-[calc(100%+4px)] w-px bg-brand" />
                  <div className="absolute -right-1 bottom-0 h-[calc(100%+4px)] w-px bg-brand" />
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <SectionsWrapper id="all-insights" eyebrow={eyebrow}>
      {filtered.length === 0 ? (
        <p className="text-body text-foreground/60">
          No posts match this filter. Try a different combination.
        </p>
      ) : (
        <RevealOnScroll
          as="div"
          stagger={0.06}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {filtered.map((article) => (
            <ArticleCard key={getArticleKey(article)} article={article} />
          ))}
        </RevealOnScroll>
      )}
    </SectionsWrapper>
  );
}
