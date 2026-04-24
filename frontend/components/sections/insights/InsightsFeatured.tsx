import { useMemo } from "react";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { ArticleCard, type ArticleCardData } from "@/components/partials/ArticleCard";
import { cleanStega } from "@/sanity/lib/utils";

export type InsightsFeaturedData = {
  insight?: ArticleCardData & { category?: string | null };
};

export function InsightsFeatured({ data }: { data?: InsightsFeaturedData }) {
  const cleanData = data ? cleanStega(data) : data;
  const featuredInsight = useMemo(() => cleanData?.insight, [cleanData]);

  if (!featuredInsight) {
    return null;
  }

  return (
    <SectionsWrapper
      id="featured"
      eyebrow="FEATURED"
    >
      <div className="px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <ArticleCard article={featuredInsight} featured />
      </div>
    </SectionsWrapper>
  );
}
