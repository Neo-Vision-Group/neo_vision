import { cn } from "@/lib/utils";
import { HeroBrandDotsBackground } from "@/components/partials/HeroBrandDotsBackground";
import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";
import Image from "next/image";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  { ssr: false }
);

const SplitTextReveal = dynamic(
  () =>
    import("@/components/partials/motion/SplitTextReveal").then(
      (mod) => mod.SplitTextReveal
    ),
  { ssr: false }
);

type StudyHeroDetail = {
  _key?: string;
  label?: string;
  value?: string;
};

export type StudyHeroData = {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  chapters?: string[];
  details?: StudyHeroDetail[];
  heroImage?: {
    asset?: {
      url?: string;
    };
  };
};

export function StudyHero({ data }: { data?: StudyHeroData }) {
  const cleanData = data ? cleanStega(data) : data;

  if (!cleanData) {
    return null;
  }

  const eyebrow = cleanData.eyebrow;
  const heading = cleanData.heading;
  const subheading = cleanData.subheading;
  const details =
    cleanData.details?.filter((item) => item?.label && item?.value) ?? [];
  const imageUrl = cleanData.heroImage?.asset?.url;

  return (
    <section
      className={cn(
        "has-hero-pattern relative isolate overflow-hidden bg-[#040404] text-[#efefef] dark:bg-background dark:text-foreground"
      )}
    >
      <HeroBrandDotsBackground />

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-6 pb-0 pt-24 md:gap-8 md:px-8 md:pt-28 xl:px-12 2xl:px-16">
        <div className="font-funnel text-[18px] leading-[1.5] text-[#efefef]/70">
          <span>Work</span>
          <span className="px-2 text-brand">/</span>
          <span className="text-brand">{heading}</span>
        </div>

        <div className="flex flex-col items-center gap-6 py-2 text-center md:gap-8 md:py-4">
          {eyebrow ? (
            <p className="font-betatron text-[32px] leading-[1.2] uppercase text-brand">
              {eyebrow}
            </p>
          ) : null}

          <SplitTextReveal as="h1" className="block w-full">
            <span className="font-funnel text-[56px] capitalize leading-none tracking-[-1px] text-[#efefef] md:text-[72px] lg:text-[96px]">
              {heading}
            </span>
          </SplitTextReveal>

          {subheading ? (
            <RevealOnScroll
              as="p"
              className="max-w-[683px] font-funnel text-[18px] leading-[1.5] text-[#efefef]"
              delay={0.15}
            >
              {subheading}
            </RevealOnScroll>
          ) : null}
        </div>

        <div className="relative mt-2 overflow-hidden border border-brand/70 bg-[#0f0f0f]">
          <div className="aspect-[16/9] w-full">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={heading ?? "Hero image"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-[#0f0f0f]" />
            )}
          </div>

          {details.length > 0 ? (
            <div className="relative border-t border-white/15 bg-black/45 backdrop-blur-[6.8px]">
              <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                {details.map((item) => (
                  <article
                    key={item._key ?? `${item.label}-${item.value}`}
                    className="flex min-h-[92px] flex-col justify-between border border-white/15 bg-[#0f0f0f] p-6"
                  >
                    <p className="font-betatron text-[32px] leading-[1.2] text-brand">
                      {item.label}
                    </p>
                    <p className="font-funnel text-[14px] leading-[1.2] tracking-[-0.5px] text-[#efefef]">
                      {item.value}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
