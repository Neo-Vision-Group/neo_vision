"use client";

import { useRef } from "react";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { origin as originFallback } from "@/lib/content/home";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import "@/components/partials/motion/gsap-setup";
import { cleanStega } from "@/sanity/lib/utils";

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
  const headingRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const el = headingRef.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          reduced: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          if (ctx.conditions?.reduced) {
            gsap.set(el, { color: "rgba(239,239,239,1)" });
            return;
          }

          const split = SplitText.create(el, { type: "words" });
          gsap.set(split.words, { color: "rgba(239,239,239,0.25)" });
          gsap.to(split.words, {
            color: "rgba(239,239,239,1)",
            stagger: 0.04,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 75%",
              end: "top 25%",
              scrub: 1,
            },
          });

          return () => {
            split.revert();
          };
        }
      );
    },
    { dependencies: [] }
  );

  return (
    <SectionsWrapper id="origin" eyebrow={origin.eyebrow}>
      <div className="flex max-w-[1280px] flex-col gap-6">
        <p
          ref={headingRef}
          className="text-[58px] font-normal font-funnel leading-[68px] tracking-[-0.3px] md:text-[58px] md:leading-[68px] lg:text-[40px] lg:leading-[52px] 2xl:text-[48px] 2xl:leading-[58px] 2xl:tracking-[-0.4px]"
        >
          {origin.heading} {origin.body}
        </p>
        <div className="flex flex-col gap-4">
          {origin.subtext && (
            <p className="text-[24px] font-funnel leading-[32px] text-foreground/70">
              {origin.subtext}
            </p>
          )}
        </div>
      </div>
    </SectionsWrapper>
  );
}
