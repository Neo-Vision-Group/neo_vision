"use client";

import { Button } from "@/components/partials/Button";
import { SplitTextReveal } from "@/components/partials/motion/SplitTextReveal";
import { RevealOnScroll } from "@/components/partials/motion/RevealOnScroll";
import { closingCta as closingCtaFallback } from "@/lib/content/home";
import { cleanStega } from "@/sanity/lib/utils";

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
      className="relative isolate flex min-h-[400px] w-full items-center justify-center overflow-hidden bg-black px-6 py-24 md:py-32 lg:py-40"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-black" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/cta-graphic.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            filter: "brightness(0.6) sepia(1) saturate(4.5) hue-rotate(-25deg) contrast(1.1)",
          }}
        />
        {/* Top and bottom gradient fades - only middle 30% visible */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgb(4,4,4) 0%, rgba(4,4,4,0) 35%, rgba(4,4,4,0) 65%, rgb(4,4,4) 100%)",
          }}
        />
      </div>

      <div className="flex w-full max-w-[720px] flex-col items-center gap-6 text-center">
        <SplitTextReveal
          as="h2"
          type="words"
          stagger={0.06}
          duration={0.9}
          scrollTriggered
          className="text-[32px] leading-[1.15] tracking-[-0.4px] text-foreground md:text-[40px] md:tracking-[-0.5px] lg:text-[48px] lg:tracking-[-0.6px]"
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
          <p className="text-caption text-foreground/70">{microcopy}</p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
