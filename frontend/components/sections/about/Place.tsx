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
        <div className="relative isolate flex w-full max-w-full aspect-4.5/2 min-h-70 items-end overflow-hidden bg-white dark:bg-[#040404] md:min-h-90 lg:min-h-105">
          <div className="absolute inset-0 overflow-hidden" style={{ perspective: '800px' }}>
            <Image
              src="/images/map.min.svg"
              alt=""
              aria-hidden="true"
              fill
              className="absolute inset-0 object-cover object-center"
              style={{
                transform: 'rotateX(38deg) scale(1.6) translateY(-8%)',
                transformOrigin: 'center 65%',
              }}
            />
          </div>

          <div
            className="absolute inset-0 dark:[--place-fade:var(--color-dark,#040404)]"
            style={{
              background:
                'linear-gradient(180deg, var(--place-fade) 5.3%, transparent 30.5%), linear-gradient(0deg, var(--place-fade) 5.3%, transparent 24.4%)',
            }}
          />

          <div className="relative z-10 flex w-full items-end justify-center px-6 pb-16 pt-24 md:px-10 md:pb-20 md:pt-28 lg:px-24 lg:pb-48 lg:pt-32">
            <p className="max-w-[18ch] text-center font-funnel text-[28px] font-normal leading-[1.2] tracking-[-0.8px] text-dark dark:text-[#efefef] md:max-w-[24ch] md:text-[36px] md:tracking-[-0.9px] lg:max-w-230 lg:text-5xl lg:tracking-[-1px]">
              {message}
            </p>
          </div>
        </div>
      </RevealOnScroll>
    </section >
  );
}
