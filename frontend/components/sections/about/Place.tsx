"use client";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/partials/Button";  
import { cleanStega } from "@/sanity/lib/utils";
import { urlForImage } from "@/sanity/lib/utils";
import Image from "next/image";
import dynamic from 'next/dynamic';

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  { ssr: false }
);  

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
  const headingRegular = cleanData?.headingRegular ?? "Want to meet the team?";
  const headingBold = cleanData?.headingBold ?? "Come say hi.";
  const body = cleanData?.body ?? "We're based in Bucharest with remote teammates across Europe. Offices open to clients and collaborators by appointment.";
  const locations = cleanData?.locations ?? [];
  const cta = cleanData?.cta;
  const backgroundGraphic = cleanData?.backgroundGraphic;

  // Get image URL if background graphic exists
  const bgImageUrl = backgroundGraphic
    ? urlForImage(backgroundGraphic)?.url()
    : null;

  return (
    <Section id="place" eyebrow={eyebrow} contentClassName="px-0 md:px-0">
      <RevealOnScroll
        as="div"
        stagger={0.1}
        from="bottom"
        distance={24}
        className="relative flex flex-col gap-12 px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16"
      >
        {/* Background Graphic */}
        {bgImageUrl && (
          <div className="absolute inset-0 -z-10 overflow-hidden opacity-30">
            <Image
              src={bgImageUrl}
              alt=""
              fill
              className="object-cover object-center"
              priority={false}
            />
          </div>
        )}

        <h2 className="text-[28px] leading-[36px] tracking-[-0.3px] text-foreground md:text-[36px] md:leading-[46px] lg:text-[44px] lg:leading-[54px] 2xl:text-[48px] 2xl:leading-[58px] 2xl:tracking-[-0.4px]">
          <span>{headingRegular} </span>
          <span className="font-bold">{headingBold}</span>
        </h2>

        {body ? (
          <p className="max-w-[68ch] text-body text-foreground/70 md:text-[20px] md:leading-[28px]">
            {body}
          </p>
        ) : null}

        {locations.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {locations.map((place, idx) => (
              <li
                key={(place.city ?? "loc") + idx}
                className="flex flex-col gap-2 border border-white/10 bg-surface p-6"
              >
                {place.note ? (
                  <p className="font-mono uppercase text-caption tracking-wider text-muted">
                    {place.note}
                  </p>
                ) : null}
                <p className="text-h4 font-medium text-foreground">{place.city}</p>
                {place.address ? (
                  <p className="text-body text-foreground/70">{place.address}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        {cta?.label && cta?.href ? (
          <div>
            <Button href={cta.href} variant="primary">
              {cta.label}
            </Button>
          </div>
        ) : null}
      </RevealOnScroll>
    </Section>
  );
}
