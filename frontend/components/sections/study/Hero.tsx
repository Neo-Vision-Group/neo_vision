import { cn } from "@/lib/utils";
import { HeroBrandDotsBackground } from "@/components/partials/HeroBrandDotsBackground";
import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";
import Image from "next/image";
import { CountingNumber } from "@/components/partials/motion/CountingNumber";

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

  // Parse details to extract numeric values for CountingNumber
  const parsedDetails = details.map((item) => {
    const numericMatch = item.value?.match(/^([0-9,]+)(.*)$/);
    const number = numericMatch ? parseInt(numericMatch[1].replace(/,/g, ""), 10) : 0;
    const suffix = numericMatch ? numericMatch[2].trim() : "";
    return {
      ...item,
      number,
      suffix,
      displayValue: item.value,
    };
  });

  return (
    <section
      className={cn(
        "has-hero-pattern relative isolate flex h-[calc(100svh-4rem)] max-h-[calc(100svh-4rem)] min-h-0 w-full flex-col overflow-hidden border-b border-black/10 bg-white text-black dark:border-white/20 dark:bg-background dark:text-white"
      )}
    >
      <HeroBrandDotsBackground />

      <div className="relative mx-auto flex w-full min-h-0 flex-1 flex-col gap-4 px-6 pt-20 md:gap-6 md:px-8 md:pt-24 xl:px-12 2xl:px-16">
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

        <div className="relative mt-auto flex w-full min-h-0 flex-1 justify-center overflow-hidden pt-4">
          <div className="relative w-full max-w-[900px] overflow-hidden border border-brand/70 bg-[#f2f2f2] dark:bg-[#0f0f0f]">
            <div className="pointer-events-none absolute inset-x-[-20px] top-0 h-px bg-brand" />
            <div className="pointer-events-none absolute inset-x-[-20px] bottom-0 h-px bg-brand" />
            <div className="pointer-events-none absolute inset-y-[-20px] left-0 w-px bg-brand" />
            <div className="pointer-events-none absolute inset-y-[-20px] right-0 w-px bg-brand" />

            <div className="relative h-full w-full">
              {imageUrl ? (
                <>
                  <Image
                    src={imageUrl}
                    alt={heading ?? "Hero image"}
                    fill
                    sizes="(min-width: 1280px) 900px, (min-width: 768px) min(900px, calc(100vw - 128px)), calc(100vw - 48px)"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_35%,rgba(4,4,4,0.5)_100%)] dark:bg-[linear-gradient(180deg,rgba(4,4,4,0.04)_0%,rgba(4,4,4,0)_42%,rgba(4,4,4,0.6)_100%)]" />
                </>
              ) : (
                <div className="h-full w-full bg-[#f2f2f2] dark:bg-[#0f0f0f]" />
              )}

              {parsedDetails.length > 0 ? (
                <RevealOnScroll
                  as="div"
                  className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/20 bg-black/40 backdrop-blur-[8px] p-3 dark:bg-black/50"
                  stagger={0.08}
                  delay={0.3}
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-stretch md:gap-0">
                    {parsedDetails.map((item, idx) => (
                      <div key={item._key ?? `${item.label}-${item.value}`} className="contents">
                        <div className="flex flex-1 flex-col items-start justify-center p-3 md:p-4">
                          <div className="flex flex-col gap-1">
                            <div className="font-betatron text-2xl leading-[1.2] text-brand md:text-3xl">
                              {item.number > 0 ? (
                                <CountingNumber
                                  value={item.number}
                                  suffix={item.suffix}
                                  duration={2000}
                                  className="font-betatron text-2xl leading-[1.2] text-brand md:text-3xl"
                                />
                              ) : (
                                <span>{item.displayValue}</span>
                              )}
                            </div>
                            <p className="w-full font-funnel text-[13px] leading-[1.2] tracking-[-0.3px] text-white">
                              {item.label}
                            </p>
                          </div>
                        </div>
                        {idx < parsedDetails.length - 1 ? (
                          <div className="hidden md:flex md:flex-row md:items-center md:self-stretch">
                            <div className="h-8 w-px bg-white/20" />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </RevealOnScroll>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
