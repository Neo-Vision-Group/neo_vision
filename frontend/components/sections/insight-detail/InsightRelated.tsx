import { ArticleCard, type ArticleCardData } from "@/components/partials/ArticleCard";

interface InsightRelatedProps {
  related: ArticleCardData[];
}

export function InsightRelated({ related }: InsightRelatedProps) {
  if (related.length === 0) return null;

  return (
    <section id="related" className="px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-16">
      <h2 className="text-[36px] font-normal leading-[1.2] tracking-[-1px] text-foreground mb-8 md:text-[44px]">
        <span className="font-bold">Keep reading.</span>
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {related.slice(0, 3).map((r, idx) => (
          <ArticleCard key={r._id ?? r.title + idx} article={r} />
        ))}
      </div>
    </section>
  );
}