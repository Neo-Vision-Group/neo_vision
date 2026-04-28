"use client";

import { Button } from "@/components/partials/Button";
import { closingCta as closingCtaFallback } from "@/lib/content/home";
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

export type CtaData = {
  heading?: string;
  body?: string;
  cta?: {
    buttonText?: string;
    link?: any;
  };
  subtext?: string;
};

export function ClosingCta({ data }: { data?: CtaData }) {
  const cleanData = data ? cleanStega(data) : data;

  const heading = cleanData?.heading
    ? {
        regular: cleanData.heading.split("**")[0] || "",
        bold: cleanData.heading.split("**")[1]?.replace(/\*\*/g, "") || "",
      }
    : closingCtaFallback.heading;

  const body = cleanData?.body
    ? cleanData.body.split("\n").filter((line) => line.trim())
    : closingCtaFallback.body;

  const ctaLabel = cleanData?.cta?.buttonText || closingCtaFallback.ctaLabel;
  const ctaHref =
    cleanData?.cta?.link?.href ||
    cleanData?.cta?.link?.page ||
    closingCtaFallback.ctaHref;

  const microcopy = cleanData?.subtext || closingCtaFallback.microcopy;

  return (
    <section
      id="closing-cta"
      className="relative isolate flex min-h-100 w-full items-center justify-center overflow-hidden bg-background px-6 py-24 md:py-32 lg:py-40"
    >
      {/* Light mode background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dark:hidden">
        <div className="absolute inset-0 bg-white" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/cta-graphic.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover mix-blend-difference"
          style={{
            filter: "brightness(0.8) sepia(1) saturate(3) hue-rotate(-30deg) contrast(1.1)",
            opacity: 0.4,
          }}
        />
        <div className="absolute inset-0 bg-brand mix-blend-screen opacity-25" />
        {/* Gradient mask */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.95) 20%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.95) 80%, #ffffff 100%),
              linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.95) 15%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.95) 85%, #ffffff 100%)
            `,
          }}
        />
      </div>

      {/* Dark mode background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hidden dark:block">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(0deg, #9D2B03 0%, #9D2B03 100%)" }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/cta-graphic.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
          style={{
            filter: "brightness(0.7) sepia(1) saturate(4) hue-rotate(-25deg) contrast(1.1)",
          }}
        />
        {/* Gradient mask */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(180deg, #0b0b0b 0%, rgba(11,11,11,0.9) 25%, rgba(11,11,11,0) 40%, rgba(11,11,11,0) 60%, rgba(11,11,11,0.9) 75%, #0b0b0b 100%),
              linear-gradient(90deg, #0b0b0b 0%, rgba(11,11,11,0.9) 15%, rgba(11,11,11,0) 30%, rgba(11,11,11,0) 70%, rgba(11,11,11,0.9) 85%, #0b0b0b 100%)
            `,
          }}
        />
      </div>

      <div className="flex w-full max-w-180 flex-col items-center gap-6 text-center">
        <SplitTextReveal
          as="h2"
          type="words"
          stagger={0.06}
          duration={0.9}
          scrollTriggered
          className="text-deco-h4 leading-[1.15] tracking-[-0.4px] text-foreground md:text-[40px] md:tracking-[-0.5px] lg:text-5xl lg:tracking-[-0.6px]"
        >
          <span className="font-normal">{heading.regular} </span>
          <span className="font-bold">{heading.bold}</span>
        </SplitTextReveal>
        <RevealOnScroll
          as="div"
          stagger={0.1}
          from="bottom"
          distance={20}
          delay={0.2}
          className="flex w-full flex-col items-center gap-6"
        >
          <div className="flex flex-col text-body text-foreground">
            {body.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
          <Button href={ctaHref} variant="primary">
            {ctaLabel}
          </Button>
          <p className="text-funnel dark:text-[#EFEFEFB3] text-[#333333]">{microcopy}</p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
