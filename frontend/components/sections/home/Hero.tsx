import { Button } from "../../../components/partials/Button";
import { HeroBrandDotsBackground } from "../../../components/partials/HeroBrandDotsBackground";
import type { DereferencedLink } from "../../../sanity/lib/types";
import { cleanStega, linkResolver } from "../../../sanity/lib/utils";
import dynamic from "next/dynamic";
import type { PortableTextBlock } from "@portabletext/react";
import { PortableTextRenderer } from "@/components/partials/PortableTextRenderer";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    )
);

const SplitTextReveal = dynamic(
  () =>
    import("@/components/partials/motion/SplitTextReveal").then(
      (mod) => mod.SplitTextReveal
    )
);

export type HeroData = {
  label?: string;
  heading?: string;
  body?: string;
  primaryCta?: { buttonText?: string; link?: DereferencedLink | null } | null;
  stats?: string;
  dimensionLine?: string;
  ctaText?: PortableTextBlock[] | null;
  secondaryCta?: { buttonText?: string; link?: DereferencedLink | null } | null;
};

export function Hero({ data }: { data?: HeroData }) {
  const cleanData = data ? cleanStega(data) : data;
  const primaryCtaLabel = cleanData?.primaryCta?.buttonText?.trim();
  const primaryCtaHref = linkResolver(cleanData?.primaryCta?.link ?? undefined);
  const secondaryCtaLabel = cleanData?.secondaryCta?.buttonText?.trim();
  const secondaryCtaHref = linkResolver(cleanData?.secondaryCta?.link ?? undefined);
  const ctaTextLines = cleanData?.ctaText ?? null;

  const hero = {
    label: cleanData?.label?.trim(),
    heading: cleanData?.heading?.trim(),
    body: cleanData?.body?.trim(),
    primaryCtaLabel,
    primaryCtaHref,
    stats: cleanData?.stats?.trim(),
    dimensionLine: cleanData?.dimensionLine?.trim(),
    mergerNote: ctaTextLines as PortableTextBlock[] | null | undefined,
    secondaryCtaLabel,
    secondaryCtaHref,
  };

  if (
    !hero.label &&
    !hero.heading &&
    !hero.body &&
    !hero.stats &&
    !hero.dimensionLine &&
    !hero.primaryCtaLabel &&
    !hero.secondaryCtaLabel
  ) {
    return null;
  }

  return (
    <section
      id="hero"
      className="relative isolate flex h-[calc(100svh-4rem)] flex-col justify-between overflow-hidden bg-transparent"
    >

      <div className="relative flex flex-col justify-center gap-6 px-3 pt-16 md:gap-10 md:px-12 md:pt-10 lg:px-16 lg:pt-10 2xl:gap-12 2xl:px-28 2xl:pt-20">
        <div className="flex w-full flex-col gap-3 md:gap-4">
          <SplitTextReveal
            as="span"
            type="chars"
            stagger={0.025}
            duration={0.8}
            className="inline-block font-light uppercase text-[70px] font-betatron dark:text-white text-black leading-none tracking-tight md:text-[128px] lg:text-[100px] xl:text-[200px]"
          >
            {hero?.label}
          </SplitTextReveal>
        </div>

        <RevealOnScroll
          as="div"
          from="bottom"
          distance={24}
          duration={0.8}
          delay={0.7}
          stagger={0.15}
          className="flex w-full max-w-165.25 flex-col gap-5 md:gap-6"
        >
          <div className="flex flex-col gap-2 text-foreground">
            {hero.heading ? (
              <p className="text-2xl md:text-4xl leading-8 tracking-[-0.3px] md:leading-10 lg:leading-12">
                {hero.heading}
              </p>
            ) : null}
            {hero.body ? <p className="text-[18px] text-xl">{hero.body}</p> : null}
          </div>
          {hero.primaryCtaLabel && hero.primaryCtaHref ? (
            <div className="flex w-full">
              <Button
                href={hero.primaryCtaHref}
                variant="primary"
                className="w-full justify-between md:w-auto md:justify-center"
              >
                {hero.primaryCtaLabel}
              </Button>
            </div>
          ) : null}
        </RevealOnScroll>
      </div>

      <div className="relative w-full mt-16 md:mt-0 border-t border-decoration-dark dark:border-decoration-light shrink-0">
        <div className="flex flex-col md:flex-row">
          {/* Stats */}
          <RevealOnScroll
            as="div"
            from="bottom"
            distance={16}
            className="flex pb-3 items-center py-6 text-left md:max-w-1/4 md:py-6 lg:py-0 2xl:py-8 md:px-1 lg:px-16 2xl:pl-30"
          >
            {hero.stats ? (
              <p className="w-full font-funnel text-[18px] text-center px-1.5 leading-normal">
                {hero.stats}
              </p>
            ) : null}
          </RevealOnScroll>

          {/* Vertical / horizontal divider */}
          <div aria-hidden="true" className="h-px w-full shrink-0 bg-decoration-dark dark:bg-decoration-light md:hidden" />
          <div aria-hidden="true" className="hidden shrink-0 self-stretch bg-decoration-dark dark:bg-decoration-light md:block md:w-px" />

          {/* Display line + merger note + CTA */}
          <div className="py-3 flex min-w-0 flex-1 flex-col items-start gap-8 md:flex-row md:items-start md:justify-between md:gap-6 md:pl-6 lg:pl-12 px-6 md:px-12 lg:px-16 2xl:px-30 md:py-6">
            <SplitTextReveal
              as="p"
              type="words"
              stagger={0.015}
              duration={0.9}
              scrollTriggered
              className="font-betatron flex-1 text-5xl uppercase leading-[1.12] tracking-[-0.8px] text-foreground [text-shadow:0_1px_6px_rgba(0,0,0,0.16)] dark:[text-shadow:0_1px_10px_rgba(0,0,0,0.42)] text-[32px] md:text-[32px] md:leading-[1.18] lg:text-[68px] lg:tracking-[-1px] 2xl:text-[76px]"
            >
              {hero.dimensionLine}
            </SplitTextReveal>
            <RevealOnScroll
              as="div"
              from="right"
              distance={24}
              delay={0.15}
              className="flex shrink-0 flex-col items-start gap-[18px] md:items-end"
            >
              <PortableTextRenderer
                value={hero.mergerNote}
                className="font-funnel text-[18px] leading-normal text-foreground md:text-right [&_p]:my-0"
              />
              {hero.secondaryCtaLabel && hero.secondaryCtaHref ? (
                <Button
                  href={hero.secondaryCtaHref}
                  variant="secondary"
                  size="md"
                  className="w-full justify-between whitespace-nowrap md:w-auto md:justify-center"
                >
                  {hero.secondaryCtaLabel}
                </Button>
              ) : null}
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
