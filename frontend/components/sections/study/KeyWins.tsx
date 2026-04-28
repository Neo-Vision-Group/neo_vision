import { SectionsWrapper } from "@/components/SectionsWrapper";
import { HeroBrandDotsBackground } from "@/components/partials/HeroBrandDotsBackground";
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
      <div className="flex flex-col gap-12 text-[#efefef]">
        {heading ? (
          <h2 className="text-deco-h4 leading-[1.2] tracking-[-1px] md:text-[40px] lg:text-12">
            {heading}
          </h2>
        ) : null}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <article className="border border-white/15 bg-[#0f0f0f] p-8 md:p-12">
            <h3 className="max-w-[14ch] text-deco-h4 leading-[1.2] tracking-[-1px] text-[#efefef]">
              {comparison.beforeLabel}
            </h3>
            <div className="mt-12 flex flex-col">
              {comparison.rows?.map((row, index) => (
                <div
                  key={`${row.label}-${index}`}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 border-b border-white/15 py-3 text-[18px] leading-normal"
                >
                  <p className="text-[#efefef]">{row.label}</p>
                  <p className="text-right text-[#efefef]/70">{row.before}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="relative overflow-hidden border border-white/15 bg-[#0f0f0f] p-8 md:p-12">
            <div className="absolute inset-0 opacity-35">
              <HeroBrandDotsBackground />
            </div>
            <div className="relative">
              <h3 className="max-w-[14ch] text-deco-h4 leading-[1.2] tracking-[-1px] text-brand">
                {comparison.afterLabel}
              </h3>
              <div className="mt-12 flex flex-col">
                {comparison.rows?.map((row, index) => (
                  <div
                    key={`${row.label}-after-${index}`}
                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 border-b border-white/15 py-3 text-[18px] leading-normal"
                  >
                    <p className="text-[#efefef]">{row.label}</p>
                    <p className="text-right text-[#efefef]/70">{row.after}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </SectionsWrapper>
  );
}
