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
        "has-hero-pattern relative isolate flex h-[calc(100svh-4rem)] max-h-[calc(100svh-4rem)] min-h-0 w-full flex-col overflow-hidden border-b border-black/10 bg-white text-black dark:border-white/20 dark:bg-background dark:text-white"
      )}
    >
      <HeroBrandDotsBackground />

      <div className="relative flex w-full min-h-0 flex-1 flex-col gap-6 px-6 pt-20 pb-6 md:gap-10 md:px-8 md:pt-24 md:pb-8 lg:px-12 lg:pb-10 xl:px-12 2xl:px-16">
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

        {/* Container for image and overlaying metrics */}
        <div className="relative mt-auto w-full shrink-0 pb-0">
          {/* Image - positioned absolutely from top:0, extends downward and gets cut */}
          {imageUrl ? (
            <div className="absolute inset-x-0 top-0 w-full overflow-hidden border border-brand/70 bg-[#f2f2f2] dark:bg-[#0f0f0f]" style={{ height: '80vh' }}>
              <div className="pointer-events-none absolute inset-x-[-20px] top-0 h-px bg-brand" />
              <div className="pointer-events-none absolute inset-x-[-20px] bottom-0 h-px bg-brand" />
              <div className="pointer-events-none absolute inset-y-[-20px] left-0 w-px bg-brand" />
              <div className="pointer-events-none absolute inset-y-[-20px] right-0 w-px bg-brand" />

              <div className="relative h-full w-full">
                <Image
                  src={imageUrl}
                  alt={heading ?? "Hero image"}
                  fill
                  sizes="(min-width: 1280px) 1280px, 100vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_35%,rgba(4,4,4,0.5)_100%)] dark:bg-[linear-gradient(180deg,rgba(4,4,4,0.04)_0%,rgba(4,4,4,0)_42%,rgba(4,4,4,0.6)_100%)]" />
              </div>
            </div>
          ) : null}

          {/* Metrics rail - overlays the image with higher z-index */}
          {details.length > 0 ? (
            <div className="relative z-10 flex flex-col">
              <RevealOnScroll
                as="div"
                className="flex w-full flex-col"
                stagger={0.08}
              >
                <div className="flex flex-col gap-0 md:flex-row md:items-stretch">
                  {details.map((item, index) => (
                    <div key={item._key ?? `${item.label}-${item.value}`} className="contents">
                      {index > 0 ? (
                        <div
                          aria-hidden="true"
                          className="hidden md:block md:w-px md:self-stretch md:bg-white/20"
                        />
                      ) : null}
                      <article className="flex min-h-30 flex-1 flex-col justify-between gap-4 border border-white/20 bg-black/70 p-6 backdrop-blur-md dark:bg-black/80">
                        <p className="font-betatron text-[28px] leading-[1.2] text-brand md:text-4xl">
                          {item.value}
                        </p>
                        <p className="font-funnel text-[22px] font-bold leading-[1.2] text-white md:text-100">
                          {item.label}
                        </p>
                      </article>
                    </div>
                  ))}
                </div>
              </RevealOnScroll>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

