"use client";

import { SectionsWrapper } from "@/components/SectionsWrapper";
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
                      <div className="group/logo relative aspect-[102.5/57.65] w-full overflow-hidden bg-black">
                        {/* Client logo */}
                        {logoUrl && (
                          <Image
                            src={logoUrl}
                            alt={logoItem.name}
                            className="absolute inset-0 h-full w-full object-contain p-4"
                            fill
                            sizes="(min-width: 768px) 33vw, 50vw"
                          />
                        )}
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
