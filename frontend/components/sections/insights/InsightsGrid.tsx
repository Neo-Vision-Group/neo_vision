"use client";

import { useMemo, useState } from "react";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { ArticleCard, type ArticleCardData } from "@/components/partials/ArticleCard";
import { RevealOnScroll } from "@/components/partials/motion/RevealOnScroll";
import { cleanStega } from "@/sanity/lib/utils";

export type InsightsGridData = {
  items?: Array<ArticleCardData & { category?: string | null }>;
  categoryFilters?: Array<{ label?: string; value?: string }>;
};

export function InsightsGrid({ data }: { data?: InsightsGridData }) {
  const cleanData = data ? cleanStega(data) : data;

  const categoryOptions = (
    cleanData?.categoryFilters ?? [
      { label: "All", value: "all" },
      { label: "AI Transformation", value: "ai-transformation" },
      { label: "Engineering", value: "engineering" },
      { label: "Original Research", value: "original-research" },
      { label: "Guides & Playbooks", value: "guides-playbooks" },
      { label: "Operator Notes", value: "operator-notes" },
    ]
  ).map((f) => ({ label: f.label ?? "All", value: f.value ?? "all" }));

  const items: Array<ArticleCardData & { category?: string | null }> =
    cleanData?.items ?? [];

  const [categoryFilter, setCategoryFilter] = useState(categoryOptions[0]?.value ?? "all");

  const filtered = useMemo(() => {
    if (categoryFilter === "all") return items;
    return items.filter((item) => item.category === categoryFilter);
  }, [items, categoryFilter]);

  // Category filter component to display in eyebrow
  const categoryFilterEyebrow = (
    <div className="flex flex-col gap-5">
      <p className="font-betatron text-[32px] leading-[1.2] text-[var(--text,#efefef)] dark:text-[var(--text,#efefef)]">Category</p>
      <div className="flex flex-col gap-5">
        {categoryOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setCategoryFilter(option.value)}
            className={`relative p-2.5 text-left text-[18px] leading-[1.5] transition-colors ${
              categoryFilter === option.value
                ? "bg-[rgba(255,65,0,0.3)] text-[var(--text,#efefef)]"
                : "bg-[var(--bg-card,#0f0f0f)] text-[var(--text,#efefef)]/60 hover:text-[var(--text,#efefef)]"
            }`}
          >
            {option.label}
            {categoryFilter === option.value && (
              <>
                <div className="absolute -left-1.5 top-0 h-px w-[calc(100%+12px)] bg-[var(--brand,#ff4100)]" />
                <div className="absolute -bottom-1.5 left-0 h-px w-[calc(100%+12px)] bg-[var(--brand,#ff4100)]" />
                <div className="absolute -left-1.5 top-0 h-[calc(100%+6px)] w-px bg-[var(--brand,#ff4100)]" />
                <div className="absolute -right-1.5 bottom-0 h-[calc(100%+6px)] w-px bg-[var(--brand,#ff4100)]" />
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <SectionsWrapper
      id="all-insights"
      eyebrow={categoryFilterEyebrow}
    >
      <div className="px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {filtered.length === 0 ? (
          <p className="text-body text-foreground/60">
            No posts in this category yet. Check back soon.
          </p>
        ) : (
          <RevealOnScroll
            as="div"
            stagger={0.06}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {filtered.map((article, idx) => (
              <ArticleCard key={article._id ?? article.title + idx} article={article} />
            ))}
          </RevealOnScroll>
        )}
      </div>
    </SectionsWrapper>
  );
}
