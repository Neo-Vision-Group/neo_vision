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
        "has-hero-pattern relative isolate flex h-[calc(100svh-4rem)] max-h-[calc(100svh-4rem)] w-full flex-col overflow-hidden border-b border-black/10 bg-white text-black dark:border-white/20 dark:bg-background dark:text-white"
      )}
    >
      <HeroBrandDotsBackground />

      {/* Text content — padded */}
      <div className="relative shrink-0 flex flex-col gap-6 px-6 pt-20 pb-6 md:gap-10 md:px-8 md:pt-24 md:pb-6 lg:px-12 xl:px-12 2xl:px-16">
        <div className="font-funnel text-[16px] leading-normal text-black/65 dark:text-white/70 md:text-[18px]">
          <span>Work</span>
          <span className="px-2 text-brand">/</span>
          <span className="text-brand">{heading}</span>
        </div>

        <div className="flex flex-col items-center gap-4 px-0 text-center md:gap-6">
          {eyebrow ? (
            <p className="font-betatron text-[24px] leading-[1.2] uppercase text-brand md:text-[28px]">
              {eyebrow}
            </p>
          ) : null}

          <SplitTextReveal as="h1" className="block w-full">
            <span className="font-funnel text-[40px] capitalize leading-none tracking-[-1px] text-black dark:text-white md:text-[56px] lg:text-[72px]">
              {heading}
            </span>
          </SplitTextReveal>

          {subheading ? (
            <RevealOnScroll
              as="p"
              className="max-w-[600px] font-funnel text-[16px] leading-normal text-black/80 dark:text-white md:text-[18px]"
              delay={0.15}
            >
              {subheading}
            </RevealOnScroll>
          ) : null}
        </div>
      </div>

      {/* Image — 16:9, sits at the bottom, gets clipped by section overflow-hidden */}
      {imageUrl ? (
        <div className="relative mt-auto shrink-0 aspect-video overflow-hidden border-t border-brand/70 bg-[#f2f2f2] dark:bg-[#0f0f0f] mx-6 md:mx-8 lg:mx-12 xl:mx-12 2xl:mx-16">
          <Image
            src={imageUrl}
            alt={heading ?? "Hero image"}
            fill
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      {/* Stats — absolutely pinned to section bottom, over the image */}
      {details.length > 0 ? (
        <div className="absolute inset-x-0 bottom-0 z-20 border-t border-black/10 dark:border-white/20">
          <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
            {details.map((item, index) => (
              <div key={item._key ?? `${item.label}-${item.value}`} className="contents">
                {index > 0 ? (
                  <div
                    aria-hidden="true"
                    className="hidden md:block md:w-px md:self-stretch md:bg-black/10 dark:md:bg-white/20"
                  />
                ) : null}
                <article className="flex min-h-30 flex-1 flex-col justify-between gap-4 border border-black/10 bg-black/4 p-6 dark:border-white/20 dark:bg-[#0f0f0f]">
                  <p className="font-betatron text-[28px] leading-[1.2] text-brand md:text-4xl">
                    {item.value}
                  </p>
                  <p className="font-funnel text-[22px] font-bold leading-[1.2] text-foreground md:text-100">
                    {item.label}
                  </p>
                </article>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
