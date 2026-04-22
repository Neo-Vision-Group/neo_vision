import { SectionsWrapper } from "@/components/SectionsWrapper";
import { RevealOnScroll } from "@/components/partials/motion/RevealOnScroll";
import { cleanStega } from "@/sanity/lib/utils";

export type StudyWhatWeBuiltData = {
  eyebrow?: string;
  heading?: string;
  features?: Array<{ number?: string; title?: string; body?: string; image?: string }>;
};

export function StudyWhatWeBuilt({ data }: { data?: StudyWhatWeBuiltData }) {
  const cleanData = data ? cleanStega(data) : data;

  const eyebrow = cleanData?.eyebrow ?? "WHAT WE BUILT";
  const heading = cleanData?.heading;
  const features = cleanData?.features ?? [];

  if (features.length === 0) {
    return null;
  }

  return (
    <SectionsWrapper
      id="what-we-built"
      eyebrow={eyebrow}
    >
      <div className="flex flex-col gap-12">
        {heading ? (
          <h2 className="text-[28px] leading-[36px] tracking-[-0.3px] text-foreground md:text-[36px] md:leading-[46px] lg:text-[44px] lg:leading-[54px]">
            {heading}
          </h2>
        ) : null}
        <RevealOnScroll
          as="div"
          stagger={0.1}
          className="flex flex-col gap-0 border-t border-white/20"
        >
          {features.map((f, idx) => (
            <article
              key={(f.title ?? "ft") + idx}
              className="grid grid-cols-1 gap-6 border-b border-white/20 px-6 py-8 md:grid-cols-[auto_1fr_1fr] md:items-start md:gap-12 md:px-6 md:py-12 lg:px-8 xl:px-12"
            >
              <span className="font-betatron text-[48px] leading-none tracking-tight text-brand-hover md:text-[72px]">
                {f.number}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="text-h4 font-medium text-foreground md:text-[24px]">{f.title}</h3>
                <p className="text-body text-foreground/70">{f.body}</p>
              </div>
              {f.image ? (
                <div className="aspect-[4/3] w-full overflow-hidden border border-white/10 bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.image}
                    alt={f.title ?? ""}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="hidden aspect-[4/3] w-full border border-white/10 bg-surface md:block" />
              )}
            </article>
          ))}
        </RevealOnScroll>
      </div>
    </SectionsWrapper>
  );
}
