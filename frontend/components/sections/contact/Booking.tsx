"use client";

import { useEffect, useState } from "react";
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

export function Booking({ data }: { data?: BookingData }) {
  const cleanData = data ? cleanStega(data) : data;
  const [isDark, setIsDark] = useState(false);

  // Simple theme detection
  useEffect(() => {
    const checkTheme = () => {
      const htmlDark = document.documentElement.classList.contains('dark');
      const mediaDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(htmlDark || mediaDark);
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkTheme);
    };
  }, []);

  const baseUrl = cleanData?.schedulerUrl || process.env.NEXT_PUBLIC_BOOKING_URL || "https://calendly.com/neovision/neo-vision-strategy-call";
  const calendlyUrl = isDark
    ? `${baseUrl}?hide_event_type_details=1&hide_gdpr_banner=1&background_color=0f0f0f&text_color=efefef&primary_color=ff4100`
    : `${baseUrl}?hide_event_type_details=1&hide_gdpr_banner=1&background_color=ffffff&text_color=1a1a1a&primary_color=ff4100`;

  useEffect(() => {
    const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]') as HTMLScriptElement;
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      script.onload = () => {
        const win = window as any;
        if (win.Calendly) {
          win.Calendly.initInlineWidgets();
        }
      };
      document.body.appendChild(script);
    } else {
      const win = window as any;
      if (win.Calendly) {
        win.Calendly.initInlineWidgets();
      }
    }
  }, [calendlyUrl]);

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
          <div className="flex-1 bg-white dark:bg-[#0f0f0f]">
            <div
              key={calendlyUrl}
              className="calendly-inline-widget w-full h-auto bg-white dark:bg-[#0f0f0f]"
              data-url={calendlyUrl}
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
