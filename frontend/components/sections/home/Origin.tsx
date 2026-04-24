"use client";

import { SectionsWrapper } from "@/components/SectionsWrapper";
import { origin as originFallback } from "@/lib/content/home";
import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";

const SplitTextReveal = dynamic(
  () =>
    import("@/components/partials/motion/SplitTextReveal").then(
      (mod) => mod.SplitTextReveal
    ),
  { ssr: false }
);

export type OriginData = {
  eyebrow?: string;
  heading?: string;
  body?: string;
  subtext?: string;
};

export function Origin({ data }: { data?: OriginData }) {
  const cleanData = data ? cleanStega(data) : data;
  
  const origin = {
    eyebrow: cleanData?.eyebrow ?? originFallback.eyebrow,
    heading: cleanData?.heading ?? `${originFallback.heading.full}${originFallback.heading.medium}${originFallback.heading.faded}`,
    body: cleanData?.body ?? `${originFallback.body.prefix}${originFallback.body.bold}${originFallback.body.suffix}`,
    subtext: cleanData?.subtext ?? null,
  };

  return (
    <SectionsWrapper id="origin" eyebrow={origin.eyebrow}>
      <div className="flex max-w-7xl flex-col gap-6">
        <SplitTextReveal
          as="p"
          type="words"
          stagger={0.04}
          colorReveal
          className="text-[58px]P font-normal font-funnel leading-17 tracking-[-0.3px] md:text-[58px] md:leading-17 lg:text-[40px] lg:leading-13 2xl:text-[48px] 2xl:leading-14.5 2xl:tracking-[-0.4px]"
        >
          {origin.heading} {origin.body}
        </SplitTextReveal>
        <div className="flex flex-col gap-4">
          {origin.subtext && (
            <p className="text-[24px] text-[#EFEFEFB3] font-funnel leading-8">
              {origin.subtext}
            </p>
          )}
        </div>
      </div>
    </SectionsWrapper>
  );
}
