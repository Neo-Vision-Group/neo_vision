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
        "has-hero-pattern relative isolate overflow-hidden border-b border-black/10 bg-white text-black dark:border-white/20 dark:bg-background dark:text-white"
      )}
    >
      <HeroBrandDotsBackground />

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-6 pb-0 pt-24 md:gap-8 md:px-8 md:pt-28 xl:px-12 2xl:px-16">
        <div className="font-funnel text-[18px] leading-normal text-black/65 dark:text-white/70">
          <span>Work</span>
          <span className="px-2 text-brand">/</span>
          <span className="text-brand">{heading}</span>
        </div>

        <div className="flex flex-col items-center gap-6 px-0 py-2 text-center md:gap-8 md:py-4">
          {eyebrow ? (
            <p className="font-betatron text-[28px] leading-[1.2] uppercase text-brand md:text-[32px]">
              {eyebrow}
            </p>
          ) : null}

          <SplitTextReveal as="h1" className="block w-full">
            <span className="font-funnel text-[56px] capitalize leading-none tracking-[-1px] text-black dark:text-white md:text-[72px] lg:text-[96px]">
              {heading}
            </span>
          </SplitTextReveal>

          {subheading ? (
            <RevealOnScroll
              as="p"
              className="max-w-[683px] font-funnel text-[18px] leading-normal text-black/80 dark:text-white"
              delay={0.15}
            >
              {subheading}
            </RevealOnScroll>
          ) : null}
        </div>

        <div className="relative mt-2 flex w-full justify-center overflow-visible pb-[108px] sm:pb-[116px] md:pb-[124px] lg:pb-[134px]">

          <div className="relative w-full max-w-[1000px] overflow-hidden border border-brand/70 bg-[#f2f2f2] dark:bg-[#0f0f0f]">
            <div className="pointer-events-none absolute inset-x-[-20px] top-0 h-px bg-brand" />
            <div className="pointer-events-none absolute inset-x-[-20px] bottom-0 h-px bg-brand" />
            <div className="pointer-events-none absolute inset-y-[-20px] left-0 w-px bg-brand" />
            <div className="pointer-events-none absolute inset-y-[-20px] right-0 w-px bg-brand" />

            <div className="relative aspect-[16/10] w-full md:aspect-video">
              {imageUrl ? (
                <>
                  <Image
                    src={imageUrl}
                    alt={heading ?? "Hero image"}
                    fill
                    sizes="(min-width: 1280px) 1000px, (min-width: 768px) min(1000px, calc(100vw - 128px)), calc(100vw - 48px)"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_35%,rgba(4,4,4,0.28)_100%)] dark:bg-[linear-gradient(180deg,rgba(4,4,4,0.04)_0%,rgba(4,4,4,0)_42%,rgba(4,4,4,0.32)_100%)]" />
                </>
              ) : (
                <div className="h-full w-full bg-[#f2f2f2] dark:bg-[#0f0f0f]" />
              )}
            </div>
          </div>

          {details.length > 0 ? (
            <div className="absolute bottom-1/5 z-10 w-full">
              <div className="border-t border-black/10 bg-transparent p-3 dark:border-white/15">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                  {details.map((item) => (
                    <article
                      key={item._key ?? `${item.label}-${item.value}`}
                      className="flex min-h-[92px] flex-col justify-between border border-black/10 bg-white p-6 backdrop-blur-[8px] dark:border-white/15 dark:bg-[#0f0f0f]"
                    >
                      <p className="font-betatron text-4xl leading-[1.2] text-brand">
                        {item.label}
                      </p>
                      <p className="font-funnel text-[14px] leading-[1.2] tracking-[-0.5px] text-black/85 dark:text-white">
                        {item.value}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
