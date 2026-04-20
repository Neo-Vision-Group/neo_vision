import { Button } from "../partials/Button";
import { hero as heroFallback } from "../../lib/content/home";
import { RevealOnScroll } from "../partials/motion/RevealOnScroll";
import { SplitTextReveal } from "../partials/motion/SplitTextReveal";
import { cleanStega } from "@/sanity/lib/utils";

/** Hero data shape — loose, to match Sanity's optional fields. Full
 *  types via `npm run typegen` once we freeze the schema. */
export type HeroData = {
  label?: string;
  heading?: string;
  body?: string;
  primaryCta?: { buttonText?: string; link?: any } | null;
  stats?: string;
  dimensionLine?: string;
  ctaText?: string;
  secondaryCta?: { buttonText?: string; link?: any } | null;
};

/**
 * Hero — responsive across 4 Figma variants (1920 / 1280 / 800 / 375).
 *
 * Data source: props.data (from Sanity) with hardcoded `home.ts`
 * fallback. Each field is resolved individually so partial Sanity
 * data still renders with sensible defaults.
 *
 * Motion:
 *  - "TwelveTen" label: SplitText char reveal on mount (0.02s stagger)
 *  - 1210 logotype: mask-reveal bottom → top (300ms delay after label)
 *  - Headline: SplitText words reveal (0.05s stagger, starts at 0.6s)
 *  - Body + CTA: fade-up stagger
 *  - Bottom bar: fades in when scrolled into view
 */
export function Hero({ data }: { data?: HeroData }) {
  const cleanData = data ? cleanStega(data) : data;
  
  const hero = {
    label: cleanData?.label ?? heroFallback.label,
    heading: cleanData?.heading ?? heroFallback.heading,
    body: cleanData?.body ?? heroFallback.body,
    primaryCtaLabel: cleanData?.primaryCta?.buttonText ?? heroFallback.primaryCtaLabel,
    primaryCtaHref: cleanData?.primaryCta?.link?.href ?? cleanData?.primaryCta?.link?.page ?? cleanData?.primaryCta?.link?.post ?? heroFallback.primaryCtaHref,
    stats: cleanData?.stats ?? heroFallback.stats,
    dimensionLine: cleanData?.dimensionLine ?? heroFallback.dimensionLine,
    mergerNote: cleanData?.ctaText ? cleanData.ctaText.split('\n').filter(Boolean) : [...heroFallback.mergerNote],
    secondaryCtaLabel: cleanData?.secondaryCta?.buttonText ?? heroFallback.secondaryCtaLabel,
    secondaryCtaHref: cleanData?.secondaryCta?.link?.href ?? cleanData?.secondaryCta?.link?.page ?? cleanData?.secondaryCta?.link?.post ?? heroFallback.secondaryCtaHref,
  };

  return (
    <section
      id="hero"
      className="relative isolate flex h-[calc(100svh-4rem)] min-h-[580px] flex-col justify-between overflow-hidden bg-background"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(0deg, #9D2B03 0%, #9D2B03 100%)",
        }}
      />
      <video
        autoPlay
        loop
        muted
        playsInline
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Main content block — flex-1 so it distributes space between
          top padding and the bottom bar, keeping the whole hero within
          one viewport. Internal spacing compresses at larger viewports
          to prevent overflow on 1600–1920 displays. */}
      <div className="relative flex flex-1 flex-col justify-center gap-6 px-4 pt-16 md:gap-10 md:px-12 md:pt-20 lg:px-16 lg:pt-20 2xl:gap-12 2xl:px-[120px] 2xl:pt-24">
        {/* Brand block: label + 1210 logotype */}
        <div className="flex w-full flex-col gap-3 md:gap-4">
          <SplitTextReveal
            as="span"
            type="chars"
            stagger={0.025}
            duration={0.8}
            className="inline-block font-light text-white text-[28px] leading-none tracking-tight md:text-[36px] lg:text-[40px] 2xl:text-[48px]"
          >
            {hero.label}
          </SplitTextReveal>
          <RevealOnScroll
            as="div"
            from="bottom"
            distance={40}
            duration={1.1}
            delay={0.35}
            className="w-full max-w-[260px] md:max-w-[340px] lg:max-w-[520px] xl:max-w-[620px] 2xl:max-w-[760px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/figma/1210-logotype.svg"
              alt="1210"
              className="block h-auto w-full select-none"
              draggable={false}
            />
          </RevealOnScroll>
        </div>

        {/* Copy + CTA block — stagger reveal */}
        <RevealOnScroll
          as="div"
          from="bottom"
          distance={24}
          duration={0.8}
          delay={0.7}
          stagger={0.15}
          className="flex w-full max-w-[661px] flex-col gap-5 md:gap-6"
        >
          <div className="flex flex-col gap-2 text-foreground">
            <p className="text-[24px] font-medium leading-[32px] tracking-[-0.3px] md:text-[32px] md:leading-[42px] lg:text-[36px] lg:leading-[48px]">
              {hero.heading}
            </p>
            <p className="text-body-2">{hero.body}</p>
          </div>
          <div className="flex w-full">
            <Button
              href={hero.primaryCtaHref}
              variant="primary"
              className="w-full justify-between md:w-auto md:justify-center"
            >
              {hero.primaryCtaLabel}
            </Button>
          </div>
        </RevealOnScroll>
      </div>

      {/* Bottom bar: stats | A NEW DIMENSION | merger note + secondary CTA.
          No mt-* — the flex-1 middle takes leftover space, so the bar
          sits flush to the bottom of the viewport on any viewport size. */}
      <div className="relative w-full shrink-0 border-t border-border">
        <div className="flex flex-col md:grid md:grid-cols-[210px_1px_1fr] lg:grid-cols-[minmax(240px,360px)_1px_1fr] 2xl:grid-cols-[480px_1px_1fr]">
          {/* Stats */}
          <RevealOnScroll
            as="div"
            from="bottom"
            distance={16}
            className="flex items-center px-6 py-6 md:p-5 lg:p-8 2xl:p-12"
          >
            <p className="w-full text-center text-body text-foreground md:text-left md:text-body lg:text-center 2xl:text-body">
              {hero.stats}
            </p>
          </RevealOnScroll>

          {/* Vertical / horizontal divider */}
          <div aria-hidden="true" className="h-px w-full bg-border md:hidden" />
          <div aria-hidden="true" className="hidden self-stretch bg-border md:block md:w-px" />

          {/* Display line + merger note + CTA */}
          <div className="flex min-w-0 flex-col items-start gap-6 px-6 py-6 md:flex-row md:items-center md:gap-4 md:p-5 lg:gap-6 lg:p-8 2xl:gap-8 2xl:p-12">
            <SplitTextReveal
              as="p"
              type="chars"
              stagger={0.015}
              duration={0.9}
              scrollTriggered
              className="min-w-0 flex-1 font-display uppercase leading-[1.1] tracking-[-0.8px] text-foreground text-[32px] md:text-[28px] md:whitespace-normal md:leading-[1.2] lg:text-[52px] lg:whitespace-nowrap xl:text-[72px] 2xl:text-[96px]"
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
              <div className="text-body-2 text-foreground md:text-right 2xl:text-body">
                {hero.mergerNote.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <Button
                href={hero.secondaryCtaHref}
                variant="secondary"
                size="sm"
                className="w-full justify-between md:w-auto md:justify-center"
              >
                {hero.secondaryCtaLabel}
              </Button>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
