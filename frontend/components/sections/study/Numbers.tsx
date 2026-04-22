import { SectionsWrapper } from "@/components/SectionsWrapper";
import { MetricStrip, type MetricItem } from "@/components/partials/MetricStrip";
import { cleanStega } from "@/sanity/lib/utils";

export type StudyNumbersData = {
  eyebrow?: string;
  heading?: string;
  footnote?: string;
  stats?: Array<{ value?: string; label?: string }>;
};

export function StudyNumbers({ data }: { data?: StudyNumbersData }) {
  const cleanData = data ? cleanStega(data) : data;

  const eyebrow = cleanData?.eyebrow ?? "THE NUMBERS";
  const heading = cleanData?.heading;
  const footnote = cleanData?.footnote;
  const stats = cleanData?.stats ?? [];

  if (stats.length === 0) {
    return null;
  }

  const metrics: MetricItem[] = stats.map((s) => ({
    value: s.value ?? "",
    label: s.label ?? "",
  }));

  return (
    <SectionsWrapper
      id="numbers"
      eyebrow={eyebrow}
    >
      <div className="flex flex-col gap-6">
        {heading ? (
          <h2 className="text-[28px] leading-[36px] tracking-[-0.3px] text-foreground md:text-[36px] md:leading-[46px] lg:text-[44px] lg:leading-[54px]">
            {heading}
          </h2>
        ) : null}
        <MetricStrip items={metrics} variant="brand" />
        {footnote ? (
          <p className="font-betatron text-caption text-muted">{footnote}</p>
        ) : null}
      </div>
    </SectionsWrapper>
  );
}
