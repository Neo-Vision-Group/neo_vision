"use client";

import { useState } from "react";
import { AnimatedBorder } from "@/components/AnimatedBorder";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { ArticleCard, type ArticleCardData } from "@/components/partials/ArticleCard";
import { cn } from "@/lib/utils";
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

function InsightsFilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={cn(
        "relative inline-flex bg-[#f0f0f0] dark:bg-[#1a1a1a] min-h-7 items-center justify-center self-start px-2 py-2 font-funnel text-[18px] leading-normal transition-colors duration-200",
        active
          ? "bg-[rgba(255,65,0,0.3)]"
          : " hover:bg-black/5 dark:hover:bg-white/5"
      )}
    >
      <AnimatedBorder isHovered={active || isHovered} />
      <span className="text-black dark:text-white">{label}</span>
    </button>
  );
}

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

  const items = cleanData?.items;

  const [categoryFilter, setCategoryFilter] = useState(categoryOptions[0]?.value ?? "all");

  const filtered = (items ?? []).filter((item) => {
    return (
      categoryFilter === "all" ||
      item.category?.toLowerCase().includes(categoryFilter.toLowerCase())
    );
  });

  const eyebrow = (
    <div className="flex flex-col items-start gap-5">
      <p className="font-betatron dark:text-white text-black text-4xl leading-[1.2]">
        Category
      </p>

      <div className="flex flex-col items-start gap-5">
        {categoryOptions.map((option) => (
          <InsightsFilterButton
            key={option.value}
            label={option.label}
            active={categoryFilter === option.value}
            onClick={() => setCategoryFilter(option.value)}
          />
        ))}
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
          className="grid grid-cols-1 gap-4 2xl:grid-cols-3 lg:grid-cols-2"
        >
          {filtered.map((article) => (
            <ArticleCard key={getArticleKey(article)} article={article} />
          ))}
        </RevealOnScroll>
      )}
    </SectionsWrapper>
  );
}
