"use client";

import { useMemo, useState } from "react";
import posthog from '@/lib/posthog-client';
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
  items?: Array<ArticleCardData & { category?: { _id: string; title: string; slug?: { current?: string } } | null }>;
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
        "relative inline-flex items-center justify-start text-left border border-transparent bg-surface px-2.5 py-2 font-funnel text-[14px] leading-[1.2] transition-colors md:text-[18px] md:leading-normal",
        active
          ? "bg-brand/30 text-black dark:text-[#efefef]"
          : "text-black/85 hover:text-black dark:text-[#efefef]/85 dark:hover:text-[#efefef]"
      )}
    >
      <AnimatedBorder isHovered={active || isHovered} />
      <span className="relative z-10">{label}</span>
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

function extractUniqueCategories(
  items: InsightsGridData["items"]
): Array<{ label: string; value: string; id: string }> {
  const unique = new Map<string, { label: string; value: string; id: string }>();
  items?.forEach((item) => {
    const category = item?.category;
    if (category?._id && category?.title) {
      const slug = category.slug?.current ?? category._id;
      unique.set(slug, {
        label: category.title,
        value: slug,
        id: category._id,
      });
    }
  });
  return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export function InsightsGrid({ data }: { data?: InsightsGridData }) {
  const cleanData = data ? cleanStega(data) : data;

  const items = cleanData?.items ?? [];

  // Extract unique categories from items
  const categoryOptions = useMemo(() => extractUniqueCategories(items), [items]);

  // Multiple filter selection state (array of category slugs)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (value: string) => {
    setSelectedCategories((prev) => {
      const exists = prev.includes(value);
      const next = exists ? prev.filter((v) => v !== value) : [...prev, value];
      return next;
    });
    posthog.capture("insights_category_filtered", {
      category: value,
      selected_count: selectedCategories.length + (selectedCategories.includes(value) ? -1 : 1),
    });
  };

  const filtered = useMemo(() => {
    return items.filter((item) => {
      // No filters selected = show all
      if (selectedCategories.length === 0) return true;
      // Match any selected category
      const itemCategorySlug = item.category?.slug?.current ?? item.category?._id;
      return itemCategorySlug && selectedCategories.includes(itemCategorySlug);
    });
  }, [items, selectedCategories]);

  const eyebrow = (
    <div className="flex flex-col items-start gap-5">
      <p className="font-betatron dark:text-white text-black text-4xl leading-[1.2]">
        Category
      </p>

      <div className="flex flex-col items-start gap-5">
        {categoryOptions.length === 0 ? (
          <p className="text-body text-foreground/60">No categories available.</p>
        ) : (
          categoryOptions.map((option) => (
            <InsightsFilterButton
              key={option.value}
              label={option.label}
              active={selectedCategories.includes(option.value)}
              onClick={() => toggleCategory(option.value)}
            />
          ))
        )}
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
          key={selectedCategories.join(',')}
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
