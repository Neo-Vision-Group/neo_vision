"use client";

import { SectionsWrapper } from "@/components/SectionsWrapper";
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
    eyebrow: cleanData?.eyebrow?.trim(),
    heading: cleanData?.heading?.trim(),
    body: cleanData?.body?.trim(),
    subtext: cleanData?.subtext?.trim(),
  };

  if (!origin.heading && !origin.body && !origin.subtext) {
    return null;
  }

  return (
    <SectionsWrapper id="origin" eyebrow={origin.eyebrow}>
      <div className="flex max-w-7xl flex-col gap-6">
        <SplitTextReveal
          as="p"
          type="words"
          stagger={0.04}
          colorReveal
          className="text-3xl font-funnel tracking-[-0.2px] md:text-[58px] md:leading-17 lg:text-[40px] lg:leading-13 2xl:text-5xl 2xl:leading-14.5 2xl:tracking-[-0.4px]"
        >
          {[origin.heading, origin.body].filter(Boolean).join(" ")}
        </SplitTextReveal>
        <div className="flex flex-col gap-4">
          {origin.subtext && (
            <p className="text-xl dark:text-[#efefefb3] text-[#040404b3] font-funnel leading-8">
              {origin.subtext}
            </p>
          )}
        </div>
      </div>
    </SectionsWrapper>
  );
}
