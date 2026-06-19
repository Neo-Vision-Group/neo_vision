"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import posthog from '@/lib/posthog-client';
import { registerGoogleLinkerDomain, trackBookCall } from "@/lib/marketing-analytics";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import Image from "@/components/SanityImage";
import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";

const SplitTextReveal = dynamic(
  () =>
    import("@/components/partials/motion/SplitTextReveal").then(
      (mod) => mod.SplitTextReveal
    ),
  { ssr: false }
);

export type BookingData = {
  eyebrow?: string;
  heading?: { regular?: string; bold?: string };
  callTitle?: string;
  teamMember?: {
    name?: string;
    role?: string;
    portrait?: {
      hotspot?: {
        x?: number;
        y?: number;
        height?: number;
        width?: number;
      };
      crop?: {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
      };
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

type PortraitData = NonNullable<NonNullable<BookingData["teamMember"]>["portrait"]>;

function toValidHotspot(hotspot?: PortraitData["hotspot"]) {
  if (
    hotspot &&
    typeof hotspot.x === "number" &&
    typeof hotspot.y === "number"
  ) {
    return {
      x: hotspot.x,
      y: hotspot.y,
    };
  }

  return undefined;
}

function toValidCrop(crop?: PortraitData["crop"]) {
  if (
    crop &&
    typeof crop.top === "number" &&
    typeof crop.bottom === "number" &&
    typeof crop.left === "number" &&
    typeof crop.right === "number"
  ) {
    return {
      top: crop.top,
      bottom: crop.bottom,
      left: crop.left,
      right: crop.right,
    };
  }

  return undefined;
}

export function Booking({ data }: { data?: BookingData }) {
  const cleanData = data ? cleanStega(data) : data;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = mounted && resolvedTheme === "dark";
  const iframeScrollRelayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const baseUrl = cleanData?.schedulerUrl || process.env.NEXT_PUBLIC_BOOKING_URL || "https://calendly.com/neovision/neo-vision-strategy-call";
  const calendlyUrl = isDark
    ? `${baseUrl}?embed_type=Inline&hide_event_type_details=1&hide_gdpr_banner=1&background_color=040404&text_color=efefef&primary_color=ff4100`
    : `${baseUrl}?embed_type=Inline&hide_event_type_details=1&hide_gdpr_banner=1&background_color=ffffff&text_color=1a1a1a&primary_color=ff4100`;
  const portraitHotspot = toValidHotspot(cleanData?.teamMember?.portrait?.hotspot);
  const portraitCrop = toValidCrop(cleanData?.teamMember?.portrait?.crop);

  useEffect(() => {
    const relay = iframeScrollRelayRef.current;
    if (!relay || !mounted) return;

    const handleWheel = (e: WheelEvent) => {
      // Suppress native scroll so it doesn't fight Lenis' smooth scroll,
      // then forward a cancelable wheel event for Lenis to handle.
      e.preventDefault();
      window.dispatchEvent(
        new WheelEvent('wheel', {
          deltaX: e.deltaX,
          deltaY: e.deltaY,
          deltaZ: e.deltaZ,
          deltaMode: e.deltaMode,
          bubbles: true,
          cancelable: true,
        })
      );
    };

    const handlePointerDown = () => {
      relay.style.display = 'none';
      const restore = () => { relay.style.display = ''; };
      window.addEventListener('pointerup', restore, { once: true });
      window.addEventListener('pointercancel', restore, { once: true });
    };

    relay.addEventListener('wheel', handleWheel, { passive: false });
    relay.addEventListener('pointerdown', handlePointerDown);

    return () => {
      relay.removeEventListener('wheel', handleWheel);
      relay.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    posthog.capture("calendly_booking_viewed", {
      scheduler_url: baseUrl,
    });
  }, [mounted, baseUrl]);

  useEffect(() => {
    registerGoogleLinkerDomain(baseUrl);
  }, [baseUrl]);

  useEffect(() => {
    const handleCalendlyMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") {
        return;
      }

      const payload = event.data as { event?: string };
      if (payload.event !== "calendly.event_scheduled") {
        return;
      }

      trackBookCall({
        method: 'calendly',
        service: cleanData?.callTitle || cleanData?.heading?.bold || cleanData?.heading?.regular || undefined,
      });
    };

    window.addEventListener('message', handleCalendlyMessage);
    return () => {
      window.removeEventListener('message', handleCalendlyMessage);
    };
  }, [cleanData?.callTitle, cleanData?.heading?.bold, cleanData?.heading?.regular]);

  return (
    <SectionsWrapper eyebrow={cleanData?.eyebrow} id="booking">
      <div className="flex flex-col gap-12">
        {/* Heading */}
        <div>
          {cleanData?.heading && (
            <SplitTextReveal
              colorReveal
              type="words"
              as='h2'
              className="font-funnel text-5xl leading-[1.2] tracking-[-1px] text-black dark:text-white"
            >
              {cleanData.heading.regular} <span className="font-bold">{cleanData.heading.bold}</span>
            </SplitTextReveal>
          )}
        </div>

        {/* Calendly Widget + Details */}
        <div className="flex flex-col gap-12 lg:flex-row md:gap-16">
          {/* Calendly Inline Widget */}
          <div
            className="calendly-theme-shell flex-1"
            data-lenis-prevent
          >
            {mounted && (
              <div style={{ position: 'relative' }}>
                <iframe
                  src={calendlyUrl}
                  width="100%"
                  style={{
                    minWidth: "320px",
                    height: "900px",
                    border: "none",
                    background: isDark ? '#040404' : '#ffffff',
                  }}
                  title="Book a call"
                />
                <div
                  ref={iframeScrollRelayRef}
                  style={{ position: 'absolute', inset: 0 }}
                  aria-hidden="true"
                />
              </div>
            )}
          </div>

          {/* Call Details */}
          <div className="flex w-full flex-col gap-6 md:w-100">
            {cleanData?.callTitle && cleanData?.teamMember?.name && (
              <div>
                <h3 className="font-funnel text-4xl leading-[1.2] tracking-[-1px] text-black dark:text-white whitespace-pre-line">
                  {cleanData.callTitle}
                  {"\n"}with {cleanData.teamMember.name.split(' ')[0]}
                </h3>
              </div>
            )}

            {/* Person Info */}
            {cleanData?.teamMember && (
              <div className="flex items-center gap-5">
                <div className="relative h-12 w-12 shrink-0">
                  <div className="absolute inset-0 overflow-hidden bg-(--bg-card)">
                    {cleanData.teamMember.portrait?.asset?._ref ? (
                      <Image
                        id={cleanData.teamMember.portrait.asset._ref}
                        alt={cleanData.teamMember.name || 'Team member'}
                        className="h-full w-full object-cover object-center"
                        height={50}
                        width={50}
                        hotspot={portraitHotspot}
                        crop={portraitCrop}
                        mode="cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-(--bg-card)" />
                    )}
                  </div>
                  <div className="absolute left-1/2 top-0 h-px w-h-15 -translate-x-1/2 bg-(--brand)" />
                  <div className="absolute bottom-0 left-1/2 h-px w-h-15 -translate-x-1/2 bg-(--brand)" />
                  <div className="absolute left-0 top-1/2 h-h-15 w-px -translate-y-1/2 bg-(--brand)" />
                  <div className="absolute right-0 top-1/2 h-h-15 w-px -translate-y-1/2 bg-(--brand)" />
                </div>
                <div className="flex flex-col">
                  <p className="font-funnel text-[18px] leading-normal text-black dark:text-white">
                    {cleanData.teamMember.name}
                  </p>
                  {cleanData.teamMember.role && (
                    <p className="font-funnel text-[14px] leading-[1.2] tracking-[-0.5px] text-black/70 dark:text-white/70">
                      {cleanData.teamMember.role}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* What to Expect */}
            {cleanData?.whatToExpectHeading && (
              <p className="font-funnel text-100 leading-[1.2] font-bold text-black dark:text-white">
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
