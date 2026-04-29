"use client";

import { SectionsWrapper } from "@/components/SectionsWrapper";
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

export type MethodologyData = {
  eyebrow?: string;
  heading?: string;
  steps?: Array<{ title: string; body: string }>;
};

export function Methodology({ data }: { data?: MethodologyData }) {
  const cleanData = data ? cleanStega(data) : data;

  const methodology = {
    eyebrow: cleanData?.eyebrow?.trim(),
    heading: cleanData?.heading?.trim(),
    steps:
      cleanData?.steps
        ?.map((step, idx) => {
          const title = step.title?.trim();
          const body = step.body?.trim();

          if (!title || !body) {
            return null;
          }

          return {
            number: `${String(idx + 1).padStart(2, "0")}.`,
            title,
            body,
          };
        })
        .filter((step): step is NonNullable<typeof step> => Boolean(step)) ?? [],
  };

  if (!methodology.heading && methodology.steps.length === 0) {
    return null;
  }

  return (
    <SectionsWrapper id="methodology" eyebrow={methodology.eyebrow}>
      <div className="flex flex-col gap-16">
        <SplitTextReveal
          as="h2"
          type="words"
          stagger={0.04}
          colorReveal
          className="text-[28px] leading-9 tracking-[-0.3px] text-foreground md:text-[36px] md:leading-12 lg:text-[44px] lg:leading-14 2xl:text-5xl 2xl:leading-14.5 2xl:tracking-[-0.4px]"
        >
          {methodology.heading}
        </SplitTextReveal>

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
      className={`relative border-b border-border py-4 md:p-6 ${
        idx % 2 === 0 ? "md:border-r" : ""
      } xl:border-r ${idx % 3 === 2 ? "xl:border-r-0" : ""}`}
    >
      <div className="group/card flex h-full flex-col gap-8 border border-white/10 dark:bg-[#0F0F0F] bg-[#f7f7f7] p-6 transition-all duration-300 ease-out hover:border-brand/40 hover:-translate-y-0.5 md:p-8">
        <span className="font-betatron text-5xl leading-none tracking-[-3.84px] text-brand md:text-80 md:tracking-[-4.8px] xl:text-[96px] xl:tracking-[-5.76px]">
          {step.number}
        </span>
        <div className="flex flex-col">
          <h3 className="text-100 font-medium leading-8 tracking-[-0.2px] text-foreground md:text-[28px] md:leading-9 xl:text-4xl xl:leading-9">
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
