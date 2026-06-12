"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { HeroBrandDotsBackground } from "@/components/partials/HeroBrandDotsBackground";
import { HeroStats, type HeroStat } from "@/components/sections/contact/HeroStats";
import { cleanStega } from "@/sanity/lib/utils";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/components/partials/motion/gsap-setup";
import { ContactFormSection } from "./ContactFormSection";
import { AnimatedBorder } from "@/components/AnimatedBorder";

export type ContactHeroData = {
  eyebrow?: string;
  heading?: string | LegacyHeadingFormat;
  description?: string;
  stats?: HeroStat[];
  steps?: Array<{
    title: string;
    description: string;
  }>;
  formConfig?: {
    services?: string[];
    budgetRanges?: string[];
    timelines?: string[];
    hearAboutUs?: string[];
  };
};

type LegacyHeadingFormat = {
  faded?: string;
  bold?: string;
};

export function ContactHero({ data }: { data?: ContactHeroData }) {
  const cleanData = data ? cleanStega(data) : data;

  const [callTabHovered, setCallTabHovered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const stepsWrapperRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    const line = lineRef.current;
    if (!section || !line) return;

    const mm = gsap.matchMedia();
    mm.add({
      reduced: "(prefers-reduced-motion: reduce)",
      motion: "(prefers-reduced-motion: no-preference)",
    }, (ctx) => {
      if (ctx.conditions?.reduced) {
        gsap.set(line, { scaleY: 1, visibility: "visible" });
        return;
      }
      gsap.set(line, { scaleY: 0, transformOrigin: "top", visibility: "visible" });
      gsap.to(line, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    });
  }, { scope: sectionRef });

  const eyebrow = cleanData?.eyebrow || "LET'S TALK";
  
  // Handle both new string format and legacy object format
  let heading = "Every project starts\nwith a conversation.";
  if (cleanData?.heading) {
    if (typeof cleanData.heading === 'string') {
      heading = cleanData.heading;
    } else if (typeof cleanData.heading === 'object' && 'faded' in cleanData.heading) {
      // Legacy format: { faded, bold }
      const legacyHeading = cleanData.heading as LegacyHeadingFormat;
      const parts = [];
      if (legacyHeading.faded) parts.push(legacyHeading.faded);
      if (legacyHeading.bold) parts.push(legacyHeading.bold);
      heading = parts.join(' ');
    }
  }
  
  const description = cleanData?.description || "No pitch. No slides. Just a 30-minute call about whether Neo Vision is the right partner for what you're building. We respond within 24 hours.";
  const stats = cleanData?.stats;
  const steps = cleanData?.steps || [];
  
  return (
    <section ref={sectionRef} className="has-hero-pattern relative isolate flex w-full flex-col overflow-hidden bg-transparent">

      <div className="relative flex flex-col gap-12 px-6 pb-12 pt-16 lg:px-12">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start">
          {/* Left column - intro and steps */}
          <div className="flex flex-1 flex-col gap-6">
            <div className="flex flex-col gap-6 font-funnel text-black dark:text-[#efefef]">
              <p className="font-clash text-4xl leading-[1.2] text-brand">
                {eyebrow}
              </p>

              <h2 className="text-5xl leading-[1.2] tracking-[-1px]">
                {heading.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < heading.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </h2>
              <p className="max-w135 text-[18px] leading-normal">
                {description}
              </p>
            </div>

            {/* Timeline steps */}
            {steps.length > 0 && (
              <div ref={stepsWrapperRef} className="relative flex flex-col gap-10">
                {/* Single continuous line spanning first dot to last dot */}
                {steps.length > 1 && (
                  <div className="absolute left-[5.5px] top-[22px] bottom-[22px] w-px bg-black/20 dark:bg-white/20 -translate-x-1/2">
                    <div ref={lineRef} style={{ visibility: "hidden" }} className="absolute inset-0 w-full bg-brand will-change-transform" />
                  </div>
                )}
                {steps.map((step, idx) => (
                  <article key={idx} className="grid grid-cols-[12px_minmax(0,1fr)] gap-x-4">
                    {/* Dot column */}
                    <div className="relative flex flex-col items-center">
                      <div className="flex-none h-4" />
                      <div className="relative z-10 h-3 w-3 shrink-0 bg-brand" />
                      <div className="w-px flex-1" />
                    </div>

                    {/* Step content */}
                    <div className="pl-4">
                      <div className="flex items-start gap-6">
                        <p className="font-clash text-4xl leading-[1.2] text-brand">
                          0{idx + 1}.
                        </p>
                        <div className="flex flex-1 flex-col gap-1 pt-1">
                          <p className="font-funnel text-[20px] font-bold leading-[1.2] text-black dark:text-[#efefef]">
                            {step.title}
                          </p>
                          <p className="font-funnel text-[18px] leading-normal text-black/70 dark:text-[#efefef]/70">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Right column - Form container */}
          <div suppressHydrationWarning className="flex flex-1 flex-col gap-12 bg-[#f7f7f7] dark:bg-[#040404] p-6 lg:p-6">
            {/* Tab buttons */}
            <div className="flex gap-6">
              <button
                type="button"
                className="relative flex flex-1 flex-col items-center justify-center p-2.5 font-funnel text-[18px] leading-normal text-black dark:text-[#efefef] transition-colors duration-300 bg-brand/30"
              >
                Send a message
                <div className="absolute -left-1.25 -right-1.25 -top-px h-px bg-brand" />
                <div className="absolute -bottom-px -left-1.25 -right-1.25 h-px bg-brand" />
                <div className="absolute -left-px -top-1.25 -bottom-1.25 w-px bg-brand" />
                <div className="absolute -right-px -top-1.25 -bottom-1.25 w-px bg-brand" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCallTabHovered(false);
                  document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
                }}
                onMouseEnter={() => setCallTabHovered(true)}
                onMouseLeave={() => setCallTabHovered(false)}
                className="relative flex flex-1 flex-col items-center justify-center p-2.5 font-funnel text-[18px] leading-normal text-black dark:text-[#efefef] transition-colors duration-300 bg-[#e8e8e8] hover:bg-brand/20 dark:bg-[#0f0f0f] dark:hover:bg-brand/20"
              >
                <AnimatedBorder isHovered={callTabHovered} />
                Book a call
              </button>
            </div>

            <div>
              <ContactFormSection formConfig={cleanData?.formConfig} />
            </div>
          </div>
        </div>

        <div className="w-full border-t pt-3 border-black/10 dark:border-white/20">
          <HeroStats stats={stats} delay={0.15} variant="contactDark" />
        </div>
      </div>
    </section>
  );
}
