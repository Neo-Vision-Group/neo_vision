"use client";

import { SectionsWrapper } from "@/components/SectionsWrapper";
import { RevealOnScroll } from "@/components/partials/motion/RevealOnScroll";
import { methodology as methodologyFallback } from "@/lib/content/home";
import { cleanStega } from "@/sanity/lib/utils";

/**
 * Our Methodology — frame 141:10843.
 *
 * "NeoFlow" 6-step process presented as a 3×2 grid of cards. Each card
 * has a massive Betatron-style number in brand orange (96px, -5.76px
 * tracking), then step name + one-liner description.
 *
 * Card styling: bg-surface, white/10 border, p-8 (32px in Figma).
 *
 * Sanity-aware: pass `data` to override content (e.g. reused on About
 * with different copy). Falls back to home.ts if `data` is omitted or
 * null.
 */

export type MethodologyData = {
  eyebrow?: string;
  heading?: string;
  steps?: Array<{ title: string; body: string }>;
};

export function Methodology({ data }: { data?: MethodologyData }) {
  const cleanData = data ? cleanStega(data) : data;

  const methodology = {
    eyebrow: cleanData?.eyebrow ?? methodologyFallback.eyebrow,
    heading: cleanData?.heading
      ? cleanData.heading
      : `${methodologyFallback.heading.faded}\n${methodologyFallback.heading.bold}`,
    steps:
      cleanData?.steps && cleanData.steps.length > 0
        ? cleanData.steps.map((step, idx) => ({
            number: `${String(idx + 1).padStart(2, "0")}.`,
            title: step.title,
            body: step.body,
          }))
        : methodologyFallback.steps,
  };

  return (
    <SectionsWrapper id="methodology" eyebrow={methodology.eyebrow}>
      <div className="flex flex-col gap-16">
        <h2 className="text-[28px] leading-[36px] tracking-[-0.3px] text-foreground md:text-[36px] md:leading-[46px] lg:text-[44px] lg:leading-[54px] 2xl:text-[48px] 2xl:leading-[58px] 2xl:tracking-[-0.4px]">
          {methodology.heading.split("\n").map((line, idx) => (
            <span key={idx}>
              {line}
              {idx < methodology.heading.split("\n").length - 1 && <br />}
            </span>
          ))}
        </h2>

        <RevealOnScroll
          as="div"
          stagger={0.08}
          from="bottom"
          distance={24}
          className="grid grid-cols-1 border-t border-border md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-2"
        >
          {methodology.steps.map((step, idx) => (
            <MethodologyCard key={step.number} step={step} idx={idx} />
          ))}
        </RevealOnScroll>
      </div>
    </SectionsWrapper>
  );
}

function MethodologyCard({
  step,
  idx,
}: {
  step: { number: string; title: string; body: string };
  idx: number;
}) {
  return (
    <div
      className={`relative border-b border-border p-4 md:p-6 ${
        idx % 2 === 0 ? "md:border-r" : ""
      } xl:border-r ${idx % 3 === 2 ? "xl:border-r-0" : ""}`}
    >
      <div className="group/card flex h-full flex-col gap-8 border border-white/10 dark:bg-[#0F0F0F] bg-[#f7f7f7] p-6 transition-all duration-300 ease-out hover:border-brand/40 hover:-translate-y-0.5 md:p-8">
        <span className="font-betatron text-[64px] leading-none tracking-[-3.84px] text-brand md:text-[80px] md:tracking-[-4.8px] xl:text-[96px] xl:tracking-[-5.76px]">
          {step.number}
        </span>
        <div className="flex flex-col">
          <h3 className="text-[24px] font-medium leading-[32px] tracking-[-0.2px] text-foreground md:text-[28px] md:leading-[36px] xl:text-[32px] xl:leading-[38px]">
            {step.title}
          </h3>
          <p className="text-funnel dark:text-[#EFEFEFB3] text-[#333333]">
            {step.body}
          </p>
        </div>
      </div>
    </div>
  );
}
