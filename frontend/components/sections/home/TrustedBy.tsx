"use client";

import { HeroBrandDotsCanvas } from "@/components/partials/HeroBrandDotsMediaProvider";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cleanStega, urlForImage } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useId } from "react";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  { ssr: false }
);

export type Testimonial = {
  name: string;
  attribution: string;
  quote: string;
  profilePicture?: any;
};

export type Logo = {
  name: string;
  logo?: any;
};

export type TrustedByData = {
  eyebrow?: string;
  logos?: Array<Logo>;
  testimonials?: Array<Testimonial>;
};

export function TrustedBy({ data }: { data?: TrustedByData }) {
  const cleanData = data ? cleanStega(data) : data;

  const trustedBy: {
    eyebrow?: string;
    logos: Logo[];
    testimonials: Testimonial[];
  } = {
    eyebrow: cleanData?.eyebrow?.trim(),
    logos:
      cleanData?.logos?.filter((logo) => logo.name?.trim() || logo.logo) ?? [],
    testimonials:
      cleanData?.testimonials?.filter(
        (testimonial) =>
          testimonial.name?.trim() &&
          testimonial.attribution?.trim() &&
          testimonial.quote?.trim(),
      ) ?? [],
  };

  if (trustedBy.logos.length === 0 && trustedBy.testimonials.length === 0) {
    return null;
  }

  const logoRows: Logo[][] = [];
  for (let i = 0; i < trustedBy.logos.length; i += 3) {
    logoRows.push([...trustedBy.logos.slice(i, i + 3)]);
  }

  return (
    <SectionsWrapper id="trusted-by" eyebrow={trustedBy.eyebrow} classNameOverride="px-0">
      <div className="flex flex-col gap-12">
        {/* Logo grid */}
        <div className="flex flex-col -mt-12">
          {logoRows.map((row, rIdx) => (
            <div key={rIdx}>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-x dark:divide-white/20 divide-black/20 lg:grid-cols-3">
                {row.map((logoItem, cIdx) => {
                  const logoUrl = logoItem.logo ? urlForImage(logoItem.logo).width(410).height(230).url() : null;
                  return (
                    <div key={cIdx} className="p-6">
                      <div className="flex flex-col items-center gap-2.5">
                        <div className="relative aspect-[102.5/57.65] w-full overflow-hidden bg-black">
                          <TrustedByLogoPanel />
                          {logoUrl ? (
                            <div className="relative z-10 h-full w-full p-5 md:p-6">
                              <Image
                                src={logoUrl}
                                alt={logoItem.name}
                                className="h-full w-full object-contain"
                                fill
                                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                              />
                            </div>
                          ) : null}
                        </div>
                        {logoItem.name ? (
                          <span className="w-full text-center font-funnel text-[18px] leading-[1.5] text-black dark:text-white">
                            {logoItem.name}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="h-px w-full dark:bg-white/20 bg-black/20" />
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="lg:px-6">
          {trustedBy.testimonials.length > 0 ? (
            <RevealOnScroll
              as="div"
              stagger={0.12}
              from="bottom"
              distance={24}
              className="grid grid-cols-1 gap-6 xl:grid-cols-2"
            >
              {trustedBy.testimonials.map((t, idx) => {
                const profileUrl = t.profilePicture ? urlForImage(t.profilePicture).width(200).height(200).fit("crop").url() : null;
                return (
                  <article
                    key={idx}
                    className="flex flex-col gap-6 bg-[#f7f7f7] p-8 dark:bg-[#0F0F0F] xl:p-12"
                  >
                    <ProfilePicture src={profileUrl} alt={t.attribution} />
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-4">
                        <p className="text-[18px] leading-normal text-brand">{t.name}, {t.attribution}</p>
                      </div>
                      <p className="text-[30px] leading-[1.2] tracking-[-1px] text-foreground 2xl:text-4xl">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                    </div>
                  </article>
                );
              })}
            </RevealOnScroll>
          ) : null}
        </div>
      </div>
    </SectionsWrapper>
  );
}

function ProfilePicture({ src, alt }: { src: string | null; alt: string }) {
  if (!src) return null;

  return (
    <Image
      src={src}
      alt={alt}
      aria-hidden="true"
      className="h-16 w-16 shrink-0 rounded-full object-cover"
      width={96}
      height={96}
    />
  );
}

function TrustedByLogoPanel() {
  const filterId = `${useId().replace(/:/g, "")}-trusted-by-logo-filter`;

  return (
    <>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        focusable="false"
      >
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="
                0.2126 0.7152 0.0722 0 0
                0.0542 0.1823 0.0184 0 0
                0      0      0      0 0
                0.2126 0.7152 0.0722 0 0
              "
            />
          </filter>
        </defs>
      </svg>

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 82% 24%, rgba(255,65,0,0.08) 0%, rgba(255,65,0,0.02) 24%, rgba(255,65,0,0) 40%), linear-gradient(180deg, #040404 0%, #040404 100%)",
        }}
      />
      <HeroBrandDotsCanvas
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: `url(#${filterId})`, opacity: 0.5 }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(193,201,197,0.22) 35.04%, rgba(255,65,0,0.88) 100%)",
          mixBlendMode: "multiply",
        }}
      />
    </>
  );
}
