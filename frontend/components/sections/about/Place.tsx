"use client";

import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";
import Image from 'next/image'

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  { ssr: false }
);

const INLINE_SEPARATOR = "\u00B7";
const DEFAULT_MESSAGE =
  `Serving clients in Romania, UK, US, and Western Europe ${INLINE_SEPARATOR} Remote-first with on-site FDE deployment`;

export type PlaceData = {
  message?: string | null;
  backgroundGraphic?: {
    asset?: {
      _ref?: string;
      url?: string;
    } | null;
    hotspot?: {
      x?: number;
      y?: number;
    } | null;
    crop?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    } | null;
  } | null;
  locations?: Array<{
    city?: string | null;
    address?: string | null;
    note?: string | null;
  }> | null;
  cta?: {
    label?: string | null;
    href?: string | null;
  } | null;
};

export function Place({ data }: { data?: PlaceData }) {
  const cleanData = data ? cleanStega(data) : data;

  const message = cleanData?.message?.trim() || DEFAULT_MESSAGE;

  return (
    <section
      className="overflow-hidden bg-transparent"
      style={{
        ['--place-fade' as string]: 'var(--color-white, #ffffff)',
      } as React.CSSProperties}
    >
      <RevealOnScroll
        as="div"
        stagger={0.1}
        from="bottom"
        distance={24}
        className="w-full overflow-hidden"
      >
        <div className="flex w-full flex-col bg-white dark:bg-[#040404] md:block md:relative md:isolate md:max-w-full md:aspect-[4.5/2] md:min-h-90 lg:min-h-105 md:overflow-hidden">
          {/* Image area — full height on md+, fixed height on mobile */}
          <div className="relative min-h-70 w-full overflow-hidden md:absolute md:inset-0 md:min-h-0" style={{ perspective: '800px' }}>
            <Image
              src="/images/map.min.svg"
              alt=""
              aria-hidden="true"
              fill
              sizes="100vw"
              className="absolute inset-0 object-cover object-center"
              style={{
                transform: 'rotateX(38deg) scale(1.6) translateY(-8%)',
                transformOrigin: 'center 65%',
              }}
            />
          </div>

          {/* City badge — flat overlay, not affected by the 3D map transform */}
          <div
            className="absolute z-10 flex flex-col items-center gap-3 pointer-events-none"
            style={{ left: '54%', top: '25%' }}
          >
            <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
              <span className="pin-pulse absolute rounded-full border-2 border-[#ff4100] opacity-80" style={{ width: 50, height: 50 }} />
              <span className="pin-pulse absolute rounded-full border border-[#ff4100] opacity-40" style={{ width: 90, height: 90, animationDelay: '1s' }} />
              <span className="absolute rounded-full bg-[#ff4100]" style={{ width: 20, height: 20 }} />
            </div>
            <div
              className="flex items-center h-11 mt-5 px-4 rounded-lg border"
            >
              <span className="font-funnel text-lg font-bold tracking-tight text-black dark:text-white leading-none">
                Bucharest, Romania
              </span>
            </div>
          </div>

          <div
            className="hidden md:block absolute inset-0 dark:[--place-fade:var(--color-dark,#040404)]"
            style={{
              background:
                'linear-gradient(180deg, var(--place-fade) 5.3%, transparent 30.5%), linear-gradient(0deg, var(--place-fade) 5.3%, transparent 24.4%)',
            }}
          />

          {/* Text — below image on mobile, overlaid at bottom on md+ */}
          <div className="relative z-10 flex w-full items-center justify-center px-6 py-10 md:absolute md:inset-0 md:px-10 lg:px-24">
            <p className="max-w-[18ch] lg:mt-30 2xl:mt-15 text-center font-funnel text-[28px] font-normal leading-[1.2] tracking-[-0.8px] text-dark dark:text-[#efefef] md:max-w-[24ch] md:text-[36px] md:tracking-[-0.9px] lg:max-w-230 lg:text-5xl lg:tracking-[-1px]">
              {message}
            </p>
          </div>
        </div>
      </RevealOnScroll>
    </section >
  );
}
