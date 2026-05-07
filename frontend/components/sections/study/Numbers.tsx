import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cleanStega } from "@/sanity/lib/utils";

export type StudyNumbersData = {
  eyebrow?: string;
  heading?: string;
  footnote?: string;
  stats?: Array<{ value?: string; label?: string; description?: string }>;
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
      classNameOverride="w-full pb-0"
    >
      <div className="flex flex-col text-black dark:text-[#efefef]">
        {heading ? (
          <h2 className="px-6 lg:px-16 pt-0 pb-8 lg:pb-12 font-funnel text-4xl leading-[1.2] tracking-[-1px] md:text-[40px] lg:text-5xl">
            {heading}
          </h2>
        ) : null}

        {/* Grid with borders on each card container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-black/15 dark:border-white/15">
          {stats.map((stat, index) => {
            return (
              <div
                key={`${stat.value}-${index}`}
                className="border-b border-r border-black/15 p-6 lg:p-8 dark:border-white/15"
              >
                <div className="flex flex-col justify-between gap-8 border border-black/15 bg-black/5 p-6 lg:p-10 dark:border-white/15 dark:bg-white/5">
                  <p className="font-betatron text-[44px] leading-[1.1] tracking-[-1px] text-brand md:text-[56px]">
                    {stat.value}
                  </p>
                  <div className="flex flex-col gap-1">
                    <p className="font-funnel text-[20px] leading-[1.3] tracking-[-0.4px] text-black dark:text-[#efefef]">
                      {stat.label}
                    </p>
                    {stat.description ? (
                      <p className="font-funnel text-sm leading-[1.4] text-black/50 dark:text-[#efefef]/50">
                        {stat.description}
                      </p>
                    ) : null}
                </div>
                  </div>
                </div>
              );
            })}
          </div>

        {footnote ? (
          <p className="px-6 py-8 lg:px-16 lg:py-12 font-funnel text-[18px] leading-[1.6] tracking-[-0.3px] text-black/65 dark:text-[#efefef]/70">
            {footnote}
          </p>
        ) : null}
      </div>
    </SectionsWrapper>
  );
}
