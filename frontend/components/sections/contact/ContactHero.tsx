"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { HeroBrandDotsBackground } from "@/components/partials/HeroBrandDotsBackground";
import { HeroStats, type HeroStat } from "@/components/sections/contact/HeroStats";
import { cleanStega } from "@/sanity/lib/utils";

export type ContactHeroData = {
  eyebrow?: string;
  heading?: string;
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

import { ContactFormSection } from "./ContactFormSection";

export function ContactHero({ data }: { data?: ContactHeroData }) {
  const cleanData = data ? cleanStega(data) : data;

  const [activeTab, setActiveTab] = useState<"message" | "call">("message");

  const eyebrow = cleanData?.eyebrow || "LET'S TALK";
  
  // Handle both new string format and legacy object format
  let heading = "Every project starts\nwith a conversation.";
  if (cleanData?.heading) {
    if (typeof cleanData.heading === 'string') {
      heading = cleanData.heading;
    } else if (typeof cleanData.heading === 'object' && 'faded' in cleanData.heading) {
      // Legacy format: { faded, bold }
      const parts = [];
      if (cleanData.heading) parts.push(cleanData.heading);
      if ((cleanData.heading as any).bold) parts.push((cleanData.heading as any).bold);
      heading = parts.join(' ');
    }
  }
  
  const description = cleanData?.description || "No pitch. No slides. Just a 30-minute call about whether TwelveTen is the right partner for what you're building. We respond within 24 hours.";
  const stats = cleanData?.stats;
  const steps = cleanData?.steps || [];
  
  return (
    <section className="has-hero-pattern relative isolate flex w-full flex-col overflow-hidden border-b border-border bg-white dark:bg-background">
      <HeroBrandDotsBackground />

      <div className="relative flex flex-col gap-12 px-6 pb-12 pt-16 lg:px-[48px]">
        <div className="flex flex-col gap-[48px] lg:flex-row lg:items-start">
          {/* Left column - intro and steps */}
          <div className="flex flex-1 flex-col gap-6">
            <div className="flex flex-col gap-6 font-funnel text-black dark:text-[#efefef]">
              <p className="font-betatron text-[32px] leading-[1.2] text-brand">
                {eyebrow}
              </p>

              <h2 className="text-[48px] leading-[1.2] tracking-[-1px]">
                {heading.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < heading.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </h2>
              <p className="max-w-[540px] text-[18px] leading-normal">
                {description}
              </p>
            </div>

            {/* Timeline steps */}
            <div className="flex flex-col">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-[15px]">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className="h-[12px] w-[12px] shrink-0 bg-brand" />
                    {idx < steps.length - 1 && (
                      <div className="w-px flex-1 bg-black/20 dark:bg-white/20" />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start gap-[24px] p-3">
                      <p className="font-betatron text-[32px] leading-[1.2] text-brand">
                        0{idx + 1}.
                      </p>
                      <div className="flex flex-1 flex-col gap-1">
                        <p className="font-funnel text-[24px] font-bold leading-[1.2] text-black dark:text-[#efefef]">
                          {step.title}
                        </p>
                        <p className="font-funnel text-[18px] leading-normal text-black/70 dark:text-[#efefef]/70">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Form container */}
          <div className="flex flex-1 flex-col gap-[48px] bg-[#f7f7f7] dark:bg-[#040404] p-6 lg:p-[24px]">
            {/* Tab buttons */}
            <div className="flex gap-[24px]">
              <button
                type="button"
                onClick={() => setActiveTab("message")}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center p-[10px] font-funnel text-[18px] leading-normal text-black dark:text-[#efefef]",
                  activeTab === "message" ? "bg-brand/30" : "bg-[#e8e8e8] dark:bg-[#0f0f0f]"
                )}
              >
                Send a message
                {activeTab === "message" && (
                  <>
                    <div className="absolute -left-[5px] -right-[5px] -top-px h-px bg-brand" />
                    <div className="absolute -bottom-px -left-[5px] -right-[5px] h-px bg-brand" />
                    <div className="absolute -left-px -top-[5px] -bottom-[5px] w-px bg-brand" />
                    <div className="absolute -right-px -top-[5px] -bottom-[5px] w-px bg-brand" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("call")}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center p-[10px] font-funnel text-[18px] leading-normal text-black dark:text-[#efefef]",
                  activeTab === "call" ? "bg-brand/30" : "bg-[#e8e8e8] dark:bg-[#0f0f0f]"
                )}
              >
                Book a call
                {activeTab === "call" && (
                  <>
                    <div className="absolute -left-[5px] -right-[5px] -top-px h-px bg-brand" />
                    <div className="absolute -bottom-px -left-[5px] -right-[5px] h-px bg-brand" />
                    <div className="absolute -left-px -top-[5px] -bottom-[5px] w-px bg-brand" />
                    <div className="absolute -right-px -top-[5px] -bottom-[5px] w-px bg-brand" />
                  </>
                )}
              </button>
            </div>

            {activeTab === "message" ? (
              <div>
                <ContactFormSection formConfig={cleanData?.formConfig} />
              </div>
            ) : (
              <div className="flex flex-col gap-4 p-8">
                <p className="font-funnel text-[18px] text-black/70 dark:text-[#efefef]/70">
                  Calendar booking integration coming soon.
                </p>
              </div>
            )}
          </div>
        </div>

        <HeroStats stats={stats} delay={0.15} variant="contactDark" />
      </div>
    </section>
  );
}
