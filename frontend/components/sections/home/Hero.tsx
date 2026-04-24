import { Button } from "../../../components/partials/Button";
import { resolveHeroContent } from "../../../lib/content/home";
import type { DereferencedLink } from "../../../sanity/lib/types";
import { cleanStega } from "../../../sanity/lib/utils";
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

const HERO_VIDEO_POSTER =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f4efe9" />
          <stop offset="100%" stop-color="#ece3db" />
        </linearGradient>
        <radialGradient id="glowA" cx="78%" cy="24%" r="28%">
          <stop offset="0%" stop-color="#9d2b03" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#9d2b03" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="glowB" cx="24%" cy="82%" r="32%">
          <stop offset="0%" stop-color="#9d2b03" stop-opacity="0.16" />
          <stop offset="100%" stop-color="#9d2b03" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#bg)" />
      <rect width="1600" height="900" fill="url(#glowA)" />
      <rect width="1600" height="900" fill="url(#glowB)" />
    </svg>
  `);

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
  const hero = resolveHeroContent(cleanData);

  return (
    <section
      id="hero"
      className="relative isolate flex h-[calc(100svh-4rem)] min-h-[580px] flex-col justify-between overflow-hidden bg-background"
    >
      {/* Light mode keeps the video inversion, but dials down how much orange the bright dots receive. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 dark:hidden">
        <div className="absolute inset-0 bg-[#f4efe9]" />
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg, rgba(244,239,233,0.98) 0%, rgba(244,239,233,0.92) 32%, rgba(244,239,233,0.84) 62%, rgba(244,239,233,0.94) 100%),
              radial-gradient(circle at 24% 78%, rgba(157,43,3,0.12) 0%, rgba(157,43,3,0.03) 32%, rgba(157,43,3,0) 58%),
              radial-gradient(circle at 82% 22%, rgba(157,43,3,0.05) 0%, rgba(157,43,3,0) 34%)
            `,
          }}
        />
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={HERO_VIDEO_POSTER}
          className="absolute inset-0 h-full w-full object-cover mix-blend-difference opacity-[0.92]"
          style={{ filter: "brightness(0.82) contrast(0.92) grayscale(1)" }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-brand mix-blend-screen opacity-[0.14]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(244,239,233,0.16) 0%, rgba(244,239,233,0.08) 38%, rgba(244,239,233,0.06) 62%, rgba(244,239,233,0.18) 100%)",
          }}
        />
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-0 hidden dark:block">
        <div className="absolute inset-0 bg-[#040404]" />

        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={HERO_VIDEO_POSTER}
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          style={{
            filter:
              "brightness(0.42) contrast(1.18) saturate(0.72) sepia(0.28) hue-rotate(-14deg)",
          }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg, rgba(4,4,4,0.78) 0%, rgba(4,4,4,0.42) 26%, rgba(4,4,4,0.18) 48%, rgba(4,4,4,0.54) 72%, rgba(4,4,4,0.82) 100%),
              radial-gradient(circle at 82% 26%, rgba(157,43,3,0.18) 0%, rgba(157,43,3,0.02) 28%, rgba(157,43,3,0) 50%),
              radial-gradient(circle at 24% 78%, rgba(157,43,3,0.34) 0%, rgba(157,43,3,0.12) 26%, rgba(157,43,3,0) 56%)
            `,
          }}
        />
      </div>

      <div className="relative flex flex-1 flex-col justify-center gap-6 px-4 pt-16 md:gap-10 md:px-12 md:pt-20 lg:px-16 lg:pt-20 2xl:gap-12 2xl:px-30 2xl:pt-24">
        <div className="flex w-full flex-col gap-3 md:gap-4">
          <SplitTextReveal
            as="span"
            type="chars"
            stagger={0.025}
            duration={0.8}
            className="inline-block font-light uppercase text-[28px] font-betatron dark:text-white text-black leading-none tracking-tight md:text-[36px] lg:text-[40px] 2xl:text-[200px]"
          >
            {hero.label}
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
            <p className="text-[32px] font-medium leading-[32px] tracking-[-0.3px] md:text-[32px] md:leading-[42px] lg:text-[36px] lg:leading-[48px]">
              {hero.heading}
            </p>
            <p className="text-[18px]">{hero.body}</p>
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

      <div className="relative w-full shrink-0 border-t border-border">
        <div
          className="absolute inset-0 dark:hidden"
          style={{ background: "linear-gradient(to top, white 0%, white 70%, transparent 100%)" }}
        />
        <div
          className="absolute inset-0 hidden dark:block"
          style={{ background: "linear-gradient(to top, black 0%, black 70%, transparent 100%)" }}
        />
        <div className="flex flex-col md:grid md:grid-cols-[210px_1px_1fr] lg:grid-cols-[minmax(240px,360px)_1px_1fr] 2xl:grid-cols-[480px_1px_1fr]">
          {/* Stats */}
          <RevealOnScroll
            as="div"
            from="bottom"
            distance={16}
            className="flex items-center px-6 py-6 md:p-5 lg:p-8 2xl:p-12"
          >
            <p className="w-full text-foreground font-funnel">{hero.stats}</p>
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
              className="min-w-0 flex-1 font-betatron uppercase leading-[1.1] tracking-[-0.8px] text-foreground text-[32px] whitespace-pre-line [text-shadow:0_1px_6px_rgba(0,0,0,0.16)] dark:[text-shadow:0_1px_10px_rgba(0,0,0,0.42)] md:text-[28px] md:whitespace-normal md:leading-[1.2] lg:text-[52px] lg:whitespace-pre-line xl:text-[72px] 2xl:text-[96px]"
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
              <Button
                href={hero.secondaryCtaHref}
                variant="secondary"
                size="sm"
                className="w-full justify-between bg-black text-white md:w-auto md:justify-center dark:bg-white dark:text-black"
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
