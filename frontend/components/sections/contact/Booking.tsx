"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import Image from "@/components/SanityImage";
import { cleanStega } from "@/sanity/lib/utils";

export type BookingData = {
  eyebrow?: string;
  heading?: { regular?: string; bold?: string };
  callTitle?: string;
  teamMember?: {
    name?: string;
    role?: string;
    portrait?: {
      asset?: {
        _ref?: string;
        _type?: string;
      };
    };
  };
  whatToExpectHeading?: string;
  expectations?: string[];
  schedulerUrl?: string;
};

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
      }) => void;
    };
  }
}

const CALENDLY_SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";

function loadCalendlyScript() {
  return new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector(
      `script[src="${CALENDLY_SCRIPT_SRC}"]`
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (window.Calendly) {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Calendly")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = CALENDLY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Calendly"));
    document.body.appendChild(script);
  });
}

export function Booking({ data }: { data?: BookingData }) {
  const cleanData = data ? cleanStega(data) : data;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const calendlyContainerRef = useRef<HTMLDivElement>(null);
  const isDark = mounted && resolvedTheme === "dark";
  const calendlyThemeStyles = {
    "--calendly-bg": isDark ? "#0f0f0f" : "#ffffff",
    colorScheme: "light",
  } as CSSProperties;

  useEffect(() => {
    setMounted(true);
  }, []);

  const baseUrl = cleanData?.schedulerUrl || process.env.NEXT_PUBLIC_BOOKING_URL || "https://calendly.com/neovision/neo-vision-strategy-call";
  const calendlyUrl = isDark
    ? `${baseUrl}?hide_event_type_details=1&hide_gdpr_banner=1&background_color=0f0f0f&text_color=efefef&primary_color=ff4100`
    : `${baseUrl}?hide_event_type_details=1&hide_gdpr_banner=1&background_color=ffffff&text_color=1a1a1a&primary_color=ff4100`;

  useEffect(() => {
    if (!mounted || !calendlyContainerRef.current) {
      return;
    }

    let isCancelled = false;

    const renderCalendly = async () => {
      try {
        await loadCalendlyScript();

        if (isCancelled || !calendlyContainerRef.current || !window.Calendly) {
          return;
        }

        calendlyContainerRef.current.replaceChildren();
        window.Calendly.initInlineWidget({
          url: calendlyUrl,
          parentElement: calendlyContainerRef.current,
        });
      } catch {
        if (!isCancelled) {
          calendlyContainerRef.current?.replaceChildren();
        }
      }
    };

    renderCalendly();

    return () => {
      isCancelled = true;
      calendlyContainerRef.current?.replaceChildren();
    };
  }, [calendlyUrl, mounted]);

  const eyebrow = (
    <div className="flex flex-col gap-5">
      {cleanData?.eyebrow && (
        <p className="font-betatron text-[32px] leading-[1.2] text-black dark:text-white">
          {cleanData.eyebrow}
        </p>
      )}
    </div>
  );

  return (
    <SectionsWrapper eyebrow={eyebrow} id="booking">
      <div className="flex flex-col gap-12 px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white dark:bg-[#0f0f0f]">
        {/* Heading */}
        <div className="px-6">
          {cleanData?.heading && (
            <h2 className="font-funnel text-[48px] leading-[1.2] tracking-[-1px] text-black dark:text-white">
              {cleanData.heading.regular} <span className="font-bold">{cleanData.heading.bold}</span>
            </h2>
          )}
        </div>

        {/* Calendly Widget + Details */}
        <div className="flex flex-col gap-12 md:flex-row md:gap-16 bg-white dark:bg-[#0f0f0f]">
          {/* Calendly Inline Widget */}
          <div
            className="calendly-theme-shell flex-1 bg-white dark:bg-[#0f0f0f]"
            style={calendlyThemeStyles}
          >
            <div
              ref={calendlyContainerRef}
              className="w-full bg-white dark:bg-[#0f0f0f]"
              style={{ minWidth: "320px", minHeight: "2000px", height: "2000px" }}
            />
          </div>

          {/* Call Details */}
          <div className="flex w-full flex-col gap-6 md:w-[400px]">
            {cleanData?.callTitle && cleanData?.teamMember?.name && (
              <div>
                <h3 className="font-funnel text-[32px] leading-[1.2] tracking-[-1px] text-black dark:text-white whitespace-pre-line">
                  {cleanData.callTitle}
                  {"\n"}with {cleanData.teamMember.name.split(' ')[0]}
                </h3>
              </div>
            )}

            {/* Person Info */}
            {cleanData?.teamMember && (
              <div className="flex items-center gap-4">
                <div className="relative h-[50px] w-[50px]">
                  {cleanData.teamMember.portrait?.asset?._ref ? (
                    <Image
                      id={cleanData.teamMember.portrait.asset._ref}
                      alt={cleanData.teamMember.name || 'Team member'}
                      className="h-full w-full object-cover"
                      height={50}
                      width={50}
                      mode="cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-(--bg-card)" />
                  )}
                  <div className="absolute -left-2 top-0 h-px w-[60px] bg-(--brand)" />
                  <div className="absolute -left-2 bottom-0 h-px w-[60px] bg-(--brand)" />
                  <div className="absolute -left-2 top-1/2 h-[60px] w-px -translate-y-1/2 bg-(--brand)" />
                  <div className="absolute right-0 top-1/2 h-[60px] w-px -translate-y-1/2 bg-(--brand)" />
                </div>
                <div className="flex flex-col">
                  <p className="font-funnel text-[18px] leading-normal text-black dark:text-white">
                    {cleanData.teamMember.name}
                  </p>
                  {cleanData.teamMember.role && (
                    <p className="font-funnel text-[14px] leading-[1.2] tracking-[-0.5px] text-black dark:text-white">
                      {cleanData.teamMember.role}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* What to Expect */}
            {cleanData?.whatToExpectHeading && (
              <p className="font-funnel text-[24px] leading-[1.2] font-bold text-black dark:text-white">
                {cleanData.whatToExpectHeading}
              </p>
            )}

            {cleanData?.expectations && cleanData.expectations.length > 0 && (
              <ul className="flex flex-col gap-3">
                {cleanData.expectations.map((exp, idx) => (
                  <li key={idx} className="flex gap-6">
                    <div className="flex pt-2">
                      <div className="h-3 w-3 shrink-0 bg-brand" />
                    </div>
                    <span className="flex-1 font-funnel text-[18px] leading-normal text-black dark:text-white">
                      {exp}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </SectionsWrapper>
  );
}
