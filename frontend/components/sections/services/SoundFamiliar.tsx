import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cleanStega } from "@/sanity/lib/utils";
import { RevealOnScroll } from "@/components/partials/motion/RevealOnScroll";

export type SoundFamiliarData = {
  eyebrow?: string;
  heading?: string;
  painPoints?: Array<{
    _key?: string;
    title?: string;
    body?: string;
  }>;
};

export function SoundFamiliar({ data }: { data?: SoundFamiliarData }) {
  const cleanData = data ? cleanStega(data) : data;

  if (!cleanData?.painPoints || cleanData.painPoints.length === 0) {
    return null;
  }

  return (
    <SectionsWrapper
      id="sound-familiar"
      eyebrow={cleanData?.eyebrow ?? "SOUND FAMILIAR?"}
      contentClassName="px-0 md:px-0"
    >
      <div className="flex flex-col gap-12">
        {cleanData?.heading && (
          <div className="px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <h2 className="text-[28px] leading-[36px] tracking-[-0.3px] text-foreground md:text-[36px] md:leading-[46px] lg:text-[44px] lg:leading-[54px]">
              {cleanData.heading}
            </h2>
          </div>
        )}
        <RevealOnScroll
          as="div"
          stagger={0.08}
          className="grid grid-cols-1 gap-4 px-6 md:grid-cols-2 md:px-6 lg:px-8 xl:px-12 2xl:px-16"
        >
          {cleanData.painPoints.map((p, idx) => (
            <article
              key={(p.title ?? "pp") + idx}
              className="flex flex-col gap-3 border border-white/10 bg-surface p-6"
            >
              <h3 className="text-h4 font-medium text-foreground">{p.title}</h3>
              <p className="text-body-2 text-foreground/70">{p.body}</p>
            </article>
          ))}
        </RevealOnScroll>
      </div>
    </SectionsWrapper>
  );
}