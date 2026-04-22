import { SectionsWrapper } from "@/components/SectionsWrapper";
import { ComparisonTable } from "@/components/partials/ComparisonTable";
import { cleanStega } from "@/sanity/lib/utils";

export type StudyKeyWinsData = {
  eyebrow?: string;
  heading?: string;
  comparison?: {
    beforeLabel?: string;
    afterLabel?: string;
    rows?: Array<{ label?: string; before?: string; after?: string }>;
  };
};

export function StudyKeyWins({ data }: { data?: StudyKeyWinsData }) {
  const cleanData = data ? cleanStega(data) : data;

  const eyebrow = cleanData?.eyebrow ?? "THE KEY WINS";
  const heading = cleanData?.heading;
  const comparison = cleanData?.comparison;

  if (!comparison?.rows || comparison.rows.length === 0) {
    return null;
  }

  return (
    <SectionsWrapper
      id="key-wins"
      eyebrow={eyebrow}
    >
      <div className="flex flex-col gap-8">
        {heading ? (
          <h2 className="text-[28px] leading-[36px] tracking-[-0.3px] text-foreground md:text-[36px] md:leading-[46px] lg:text-[44px] lg:leading-[54px]">
            {heading}
          </h2>
        ) : null}
        <ComparisonTable
          beforeLabel={comparison.beforeLabel}
          afterLabel={comparison.afterLabel}
          rows={(comparison.rows ?? []).map((r) => ({
            label: r.label ?? "",
            before: r.before ?? "",
            after: r.after ?? "",
          }))}
        />
      </div>
    </SectionsWrapper>
  );
}
