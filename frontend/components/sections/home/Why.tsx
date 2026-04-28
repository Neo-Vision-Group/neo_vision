"use client";

import { SectionsWrapper } from "@/components/SectionsWrapper";
import { whyTwelveTen as whyFallback } from "@/lib/content/home";
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

export type WhyData = {
  eyebrow?: string;
  heading?: string;
  points?: Array<{
    title: string;
    body: string;
  }>;
};

export function Why({ data }: { data?: WhyData }) {
  const cleanData = data ? cleanStega(data) : data;

  const why = {
    eyebrow: cleanData?.eyebrow ?? whyFallback.eyebrow,
    heading: cleanData?.heading ?? whyFallback.heading,
    points:
      cleanData?.points?.map((point) => ({
        title: point.title,
        body: point.body.split("\n").filter(Boolean),
      })) ??
      whyFallback.points,
  };

  return (
    <SectionsWrapper id="why" eyebrow={why.eyebrow}>
      <div className="flex flex-col gap-12">
        <SplitTextReveal
          as="h2"
          type="words"
          stagger={0.04}
          colorReveal
          className="text-[28px] leading-9 tracking-[-0.3px] text-foreground md:text-[36px] md:leading-12 lg:text-[44px] lg:leading-14 2xl:text-5xl 2xl:leading-14.5 2xl:tracking-[-0.4px]"
        >
          {why.heading}
        </SplitTextReveal>

        <RevealOnScroll
          as="div"
          stagger={0.1}
          from="bottom"
          distance={24}
          className="flex flex-col gap-6"
        >
          {why.points.map((point) => (
            <article
              key={point.title}
              className="group/why dark:bg-[#0F0F0F] bg-[#f7f7f7] relative isolate flex flex-col gap-8 overflow-hidden border border-white/10 p-6 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-brand/40 lg:p-8 2xl:gap-12 2xl:p-12"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 ease-out dark:group-hover/why:opacity-100"
              >
                <img
                  src="/figma/signature-texture.png"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-40"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "#4a0e00" }}
                />
                <div
                  className="absolute inset-0 mix-blend-multiply"
                  style={{ background: "#7a1a00" }}
                />
              </div>
              <h3 className="text-[22px] leading-7 tracking-[-0.2px] text-foreground md:text-100 md:leading-8 lg:text-[28px] lg:leading-9 xl:text-deco-h4 xl:leading-9">
                {point.title}
              </h3>
              <div className="text-body text-foreground/70">
                {point.body.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            </article>
          ))}
        </RevealOnScroll>
      </div>
    </SectionsWrapper>
  );
}
