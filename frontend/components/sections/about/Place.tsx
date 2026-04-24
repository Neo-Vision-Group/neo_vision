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

const DEFAULT_HEADLINE = "Serving clients across Romania, the UK, the US, and Western Europe.";
const DEFAULT_BODY = "Remote-first, with on-site collaboration when the work needs it.";

export type PlaceData = {
  eyebrow?: string | null;
  headingRegular?: string | null;
  headingBold?: string | null;
  body?: string | null;
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

  const eyebrow = cleanData?.eyebrow ?? "WHERE WE ARE";
  const backgroundGraphic = cleanData?.backgroundGraphic;
  const bgImageUrl = backgroundGraphic ? urlForImage(backgroundGraphic)?.url() : null;

  const combinedHeading = [cleanData?.headingRegular, cleanData?.headingBold]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ")
    .trim();

  const body = cleanData?.body?.trim() || "";
  const headline = combinedHeading || body || DEFAULT_HEADLINE;
  const supportingText =
    combinedHeading && body ? body : combinedHeading ? null : body && body !== headline ? body : DEFAULT_BODY;

  return (
    <Section id="place" eyebrow={eyebrow} contentClassName="px-0 md:px-0">
      <RevealOnScroll
        as="div"
        stagger={0.1}
        from="bottom"
        distance={24}
        className="px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16"
      >
        <div className="relative isolate min-h-[360px] overflow-hidden bg-[#e8e8e8] dark:bg-[#111111] md:min-h-[440px] lg:min-h-[520px] xl:min-h-[576px]">
          {bgImageUrl ? (
            <Image
              src={bgImageUrl}
              alt=""
              fill
              className="object-cover object-center"
              priority={false}
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.92),transparent_32%),radial-gradient(circle_at_78%_24%,rgba(255,255,255,0.72),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.35),rgba(255,255,255,0)_48%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_32%),radial-gradient(circle_at_78%_24%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0)_48%)]" />
              <div className="absolute -left-[8%] top-[18%] h-[28%] w-[60%] rotate-[-8deg] rounded-full border border-black/8 bg-white/35 blur-[2px] dark:border-white/10 dark:bg-white/8" />
              <div className="absolute right-[-10%] top-[8%] h-[34%] w-[44%] rounded-full border border-black/8 bg-white/25 blur-[2px] dark:border-white/10 dark:bg-white/6" />
              <div className="absolute bottom-[20%] left-[14%] h-px w-[72%] bg-black/10 dark:bg-white/12" />
              <div className="absolute bottom-[32%] left-[10%] h-px w-[46%] bg-black/10 dark:bg-white/12" />
            </>
          )}

          <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-white via-white/82 to-transparent dark:from-background dark:via-background/78" />

          <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-8 lg:p-10 xl:p-12">
            <div className="max-w-[860px]">
              <h2 className="font-funnel text-[28px] leading-[1.12] tracking-[-0.8px] text-black dark:text-[#efefef] md:text-[36px] md:tracking-[-1px] lg:text-[44px] xl:text-[48px]">
                {headline}
              </h2>

              {supportingText ? (
                <p className="mt-4 max-w-[58ch] font-funnel text-[18px] leading-[1.5] text-black/70 dark:text-[#efefef]/72">
                  {supportingText}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </Section>
  );
}
