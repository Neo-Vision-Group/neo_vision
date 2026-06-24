"use client";

import { useMemo, useState } from "react";
import posthog from '@/lib/posthog-client';
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { ArticleCard, type ArticleCardData } from "@/components/partials/ArticleCard";
import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";
import FilterButton from "@/components/partials/FilterButton";
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
    <div className="flex flex-col gap-4.5">
      <h3 className="font-clash uppercase text-[24px] leading-[1.2] text-black dark:text-[#efefef] lg:text-3xl">
        Category
      </h3>

      <div className="flex flex-wrap gap-3 lg:-ml-2.5">
        {categoryOptions.length === 0 ? (
          <p className="text-body text-foreground/60">No categories available.</p>
        ) : (
          categoryOptions.map((option) => (
            <FilterButton
              key={option.value}
              label={option.label}
              isActive={selectedCategories.includes(option.value)}
              onClick={() => toggleCategory(option.value)}
            />
          ))
        )}
      </div>
    </div>
  );

  return (
    <SectionsWrapper id="all-insights" eyebrow={eyebrow} overrideEyebrowSize="text-[18px]">
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
