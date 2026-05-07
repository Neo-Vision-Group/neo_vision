import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cleanStega } from "@/sanity/lib/utils";

export type PortfolioMetricsData = {
  items?: Array<{ value?: string; label?: string }>;
};

export function PortfolioMetrics({ data }: { data?: PortfolioMetricsData }) {
  const cleanData = data ? cleanStega(data) : data;

  const items = cleanData?.items ?? [];

  if (items.length === 0) {
    return null;
  }

  return (
    <SectionsWrapper eyebrow="" classNameOverride="dark:bg-black bg-white px-6 py-8 md:px-12 md:py-10" hideBorders>
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 xl:grid-cols-4 xl:gap-6">
        {items.map((item, index) => (
          <article key={`${item.label ?? "metric"}-${index}`} className="flex flex-col gap-6">
            <p className="font-betatron text-[44px] leading-[1.2] tracking-[-1px] text-brand md:text-[56px]">
              {item.value ?? ""}
            </p>
            <p className="max-w-[10ch] font-funnel text-[28px] leading-[1.2] tracking-[-1px] dark:text-[#efefef] text-black md:text-4xl">
              {item.label ?? ""}
            </p>
          </article>
        ))}
      </div>
    </SectionsWrapper>
  );
}
