import { cn } from "@/lib/utils";
import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";

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

export type StudyHeroData = {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  chapters?: string[];
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

  const eyebrow = cleanData?.eyebrow;
  const heading = cleanData?.heading;
  const subheading = cleanData?.subheading;
  const heroImage = cleanData?.heroImage;

  const imageUrl = heroImage?.asset?.url;

  return (
    <>
      <section
        className={cn(
          "relative isolate flex w-full flex-col overflow-hidden border-b border-border bg-white dark:bg-background"
        )}
      >
        <div className="relative flex flex-col gap-10 px-6 py-16 md:gap-14 md:px-6 md:py-24 lg:px-8 lg:py-28 xl:px-12 xl:py-32 2xl:px-16 2xl:py-40">
          {eyebrow ? (
            <p className="font-betatron text-[32px] leading-[1.2] uppercase text-brand">
              {eyebrow}
            </p>
          ) : null}

          <SplitTextReveal as="h1" className="block">
            <span className="font-funnel text-[96px] capitalize leading-[1.2] tracking-[-1px] text-foreground">
              {heading}
            </span>
          </SplitTextReveal>

          {subheading ? (
            <RevealOnScroll
              as="p"
              className="max-w-[683px] font-funnel text-[18px] leading-normal text-foreground"
              delay={0.15}
            >
              {subheading}
            </RevealOnScroll>
          ) : null}
        </div>
      </section>

      {imageUrl ? (
        <section id="hero-image" className="border-b border-border">
          <div className="px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="aspect-[16/9] w-full overflow-hidden border border-white/10 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={heading ?? "Hero image"}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}