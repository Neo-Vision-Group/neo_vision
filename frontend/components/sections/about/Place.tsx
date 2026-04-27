"use client";

import { Section } from "@/components/layout/Section";
import { cleanStega, urlForImage } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";
import Image from "next/image";

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

  const backgroundGraphic = cleanData?.backgroundGraphic;
  const bgImageUrl = backgroundGraphic ? urlForImage(backgroundGraphic)?.url() : null;
  const message = cleanData?.message?.trim() || DEFAULT_MESSAGE;

  return (
    <Section id="place" variant="bare" className="overflow-hidden bg-transparent">
      <RevealOnScroll
        as="div"
        stagger={0.1}
        from="bottom"
        distance={24}
        className="w-full overflow-hidden"
      >
        <div className="relative isolate flex w-full max-w-full aspect-[1024/461] min-h-[280px] items-end overflow-hidden dark:bg-[#040404] md:min-h-[360px] lg:min-h-[420px]">
          {bgImageUrl ? (
            <Image
              src={bgImageUrl}
              alt=""
              fill
              className="object-cover object-center dark:invert"
              priority={false}
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(255,255,255,0.1),transparent_38%),radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.04),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
              <div className="absolute inset-x-[8%] top-[11%] h-px bg-white/[0.045]" />
              <div className="absolute inset-x-[14%] bottom-[18%] h-px bg-white/[0.05]" />
            </>
          )}

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,4,4,0.96)_5.3%,rgba(4,4,4,0)_30.5%),linear-gradient(0deg,rgba(4,4,4,0.96)_5.3%,rgba(4,4,4,0)_24.4%)]" />

          <div className="relative z-10 flex w-full items-end justify-center px-6 pb-8 pt-24 md:px-10 md:pb-10 md:pt-28 lg:px-12 lg:pb-12 lg:pt-32">
            <p className="max-w-[18ch] break-words text-center font-funnel text-[28px] font-normal leading-[1.2] tracking-[-0.8px] text-[#efefef] md:max-w-[24ch] md:text-[36px] md:tracking-[-0.9px] lg:max-w-[920px] lg:text-[48px] lg:tracking-[-1px]">
              {message}
            </p>
          </div>
        </div>
      </RevealOnScroll>
    </Section>
  );
}
