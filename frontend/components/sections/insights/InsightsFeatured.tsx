import { SectionsWrapper } from "@/components/SectionsWrapper";
import { ArticleCard, type ArticleCardData } from "@/components/partials/ArticleCard";
import { cleanStega } from "@/sanity/lib/utils";

export type InsightsFeaturedData = {
  insight?: ArticleCardData & { category?: string | null };
};

export function InsightsFeatured({ data }: { data?: InsightsFeaturedData }) {
  const cleanData = data ? cleanStega(data) : data;

  if (!cleanData?.insight) {
    return null;
  }

  return (
    <SectionsWrapper
      id="featured"
      eyebrow="FEATURED"
    >
      <div className="px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <ArticleCard article={cleanData.insight} featured />
      </div>
    </SectionsWrapper>
  );
}
