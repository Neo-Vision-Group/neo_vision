import { ArticleCard, type ArticleCardData } from "@/components/partials/ArticleCard";

interface InsightRelatedProps {
  related: ArticleCardData[];
}

export function InsightRelated({ related }: InsightRelatedProps) {
  if (related.length === 0) return null;

  return (
    <section id="related" className="px-4 py-16 md:px-6 xl:px-8">
      <div className="mx-auto max-w-[1320px]">
        <h2 className="mb-8 text-[36px] font-normal leading-[1.2] tracking-[-1px] text-foreground md:text-[44px]">
          <span className="font-bold">Keep reading.</span>
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {related.slice(0, 3).map((r, idx) => (
            <ArticleCard key={r._id ?? r.title + idx} article={r} />
          ))}
        </div>
      </div>
    </section>
  );
}
