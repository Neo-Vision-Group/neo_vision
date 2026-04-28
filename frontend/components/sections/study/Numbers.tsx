import { SectionsWrapper } from "@/components/SectionsWrapper";
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

  return (
    <SectionsWrapper
      id="numbers"
      eyebrow={eyebrow}
    >
      <div className="flex flex-col gap-12 text-black dark:text-[#efefef]">
        {heading ? (
          <h2 className="max-w-[14ch] font-funnel text-deco-h4 leading-[1.2] tracking-[-1px] md:text-[40px] lg:text-12">
            {heading}
          </h2>
        ) : null}
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => {
            return (
              <div
                key={`${stat.value}-${index}`}
                className="flex w-full max-w-full flex-col items-start gap-6 xl:max-w-[185px]"
              >
                <p className="font-betatron text-[44px] leading-[1.2] tracking-[-1px] text-brand md:text-[56px]">
                  {stat.value}
                </p>
                <p className="font-funnel text-[28px] leading-[1.2] tracking-[-1px] text-black dark:text-[#efefef] md:text-deco-h4 whitespace-pre-line">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
        {footnote ? (
          <p className="max-w-[48rem] font-funnel text-[20px] leading-[1.4] tracking-[-0.4px] text-black/65 dark:text-[#efefef]/70 md:text-6">
            {footnote}
          </p>
        ) : null}
      </div>
    </SectionsWrapper>
  );
}
