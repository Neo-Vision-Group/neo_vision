import { Button } from "../../../components/partials/Button";
import { HeroBrandDotsBackground } from "../../../components/partials/HeroBrandDotsBackground";
import type { DereferencedLink } from "../../../sanity/lib/types";
import { cleanStega, linkResolver } from "../../../sanity/lib/utils";
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

export type HeroData = {
  label?: string;
  heading?: string;
  body?: string;
  primaryCta?: { buttonText?: string; link?: DereferencedLink | null } | null;
  stats?: string;
  dimensionLine?: string;
  ctaText?: string;
  secondaryCta?: { buttonText?: string; link?: DereferencedLink | null } | null;
};

export function Hero({ data }: { data?: HeroData }) {
  const cleanData = data ? cleanStega(data) : data;
  const primaryCtaLabel = cleanData?.primaryCta?.buttonText?.trim();
  const primaryCtaHref = linkResolver(cleanData?.primaryCta?.link ?? undefined);
  const secondaryCtaLabel = cleanData?.secondaryCta?.buttonText?.trim();
  const secondaryCtaHref = linkResolver(cleanData?.secondaryCta?.link ?? undefined);
  const ctaTextLines =
    cleanData?.ctaText
      ?.split("\n")
      .map((line) => line.trim())
      .filter(Boolean) ?? [];

  const hero = {
    label: cleanData?.label?.trim(),
    heading: cleanData?.heading?.trim(),
    body: cleanData?.body?.trim(),
    primaryCtaLabel,
    primaryCtaHref,
    stats: cleanData?.stats?.trim(),
    dimensionLine: cleanData?.dimensionLine?.trim(),
    mergerNote: ctaTextLines,
    secondaryCtaLabel,
    secondaryCtaHref,
  };

  if (
    !hero.label &&
    !hero.heading &&
    !hero.body &&
    !hero.stats &&
    !hero.dimensionLine &&
    hero.mergerNote.length === 0 &&
    !hero.primaryCtaLabel &&
    !hero.secondaryCtaLabel
  ) {
    return null;
  }

  return (
    <section
      id="hero"
      className="has-hero-pattern relative isolate flex h-[calc(100svh-4rem)] min-h-145 flex-col justify-between overflow-hidden bg-background"
    >
      <HeroBrandDotsBackground />

      <div className="relative flex flex-1 flex-col justify-center gap-6 px-4 pt-16 md:gap-10 md:px-12 md:pt-20 lg:px-16 lg:pt-20 2xl:gap-12 2xl:px-30 2xl:pt-24">
        <div className="flex w-full flex-col gap-3 md:gap-4">
          <SplitTextReveal
            as="span"
            type="chars"
            stagger={0.025}
            duration={0.8}
            className="inline-block font-light uppercase text-[28px] font-betatron dark:text-white text-black leading-none tracking-tight md:text-[36px] lg:text-[40px] 2xl:text-[200px]"
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
              <p className="text-4xl font-medium leading-8 tracking-[-0.3px] md:text-4xl md:leading-10 lg:text-[36px] lg:leading-12">
                {hero.heading}
              </p>
            ) : null}
            {hero.body ? <p className="text-[18px]">{hero.body}</p> : null}
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

      <div className="relative w-full shrink-0">
        <div className="flex flex-col md:grid md:grid-cols-[210px_1px_1fr] lg:grid-cols-[minmax(240px,360px)_1px_1fr] 2xl:grid-cols-[480px_1px_1fr]">
          {/* Stats */}
          <RevealOnScroll
            as="div"
            from="bottom"
            distance={16}
            className="flex items-center px-6 py-6 md:p-5 lg:p-8 2xl:p-12"
          >
            {hero.stats ? (
              <p className="w-full text-foreground font-funnel">{hero.stats}</p>
            ) : null}
          </RevealOnScroll>

          {/* Vertical / horizontal divider */}
          <div aria-hidden="true" className="h-px w-full bg-border md:hidden" />
          <div aria-hidden="true" className="hidden self-stretch bg-border md:block md:w-px" />

          {/* Display line + merger note + CTA */}
          <div className="flex min-w-0 flex-col items-start gap-6 px-6 py-6 md:flex-row md:items-center md:gap-4 md:p-5 lg:gap-6 lg:p-8 2xl:gap-8 2xl:p-12">
            <SplitTextReveal
              as="p"
              type="words"
              stagger={0.015}
              duration={0.9}
              scrollTriggered
              className="min-w-0 flex-1 font-betatron text-wrap uppercase leading-[1.1] tracking-[-0.8px] text-foreground text-4xl [text-shadow:0_1px_6px_rgba(0,0,0,0.16)] dark:[text-shadow:0_1px_10px_rgba(0,0,0,0.42)] md:text-[28px] md:whitespace-normal md:leading-[1.2] lg:text-[52px] lg:whitespace-pre-line xl:text-[72px] 2xl:text-[96px]"
            >
              {hero.dimensionLine}
            </SplitTextReveal>
            <RevealOnScroll
              as="div"
              from="right"
              distance={24}
              delay={0.15}
              className="flex w-full shrink-0 flex-col items-start gap-4 md:w-auto md:items-end"
            >
              <div className="text-body-2 text-foreground font-funnel md:text-right 2xl:text-body">
                {hero.mergerNote.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              {hero.secondaryCtaLabel && hero.secondaryCtaHref ? (
                <Button
                  href={hero.secondaryCtaHref}
                  variant="secondary"
                  size="sm"
                  className="w-full justify-between bg-black text-white md:w-auto md:justify-center dark:bg-white dark:text-black"
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
