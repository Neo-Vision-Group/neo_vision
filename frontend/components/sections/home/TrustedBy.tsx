"use client";

import { HeroBrandDotsCanvas } from "@/components/partials/HeroBrandDotsMediaProvider";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cleanStega, urlForImage } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useId } from "react";
import { useTheme } from "next-themes";

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
  logoLight?: any;
  logoDark?: any;
};

export type TrustedByData = {
  eyebrow?: string;
  logos?: Array<Logo>;
  testimonials?: Array<Testimonial>;
};

function LogoItem({ logoItem }: { logoItem: Logo }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Use light logo for SSR to ensure consistency, then switch after mount
  const logo = mounted && resolvedTheme === 'dark' ? logoItem.logoDark : logoItem.logoLight;
  const logoUrl = logo ? urlForImage(logo).width(410).height(230).url() : null;

  return (
    <div className="group/logo flex flex-col items-center gap-2.5">
      <div className="relative aspect-[102.5/57.65] w-full overflow-hidden">
        {logoUrl ? (
          <div className="relative z-10 h-full w-full p-5 md:p-6 transition-all duration-300 group-hover/logo:drop-shadow-[0_0_20px_rgba(249,115,22,0.75)]">
            <Image
              src={logoUrl}
              alt={logoItem.name}
              className="h-full w-full object-contain"
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
              suppressHydrationWarning
            />
          </div>
        ) : null}
      </div>
      {logoItem.name ? (
        <span className="w-full text-center font-funnel text-[18px] leading-normal text-black dark:text-white">
          {logoItem.name}
        </span>
      ) : null}
    </div>
  );
}

export function TrustedBy({ data }: { data?: TrustedByData }) {
  const cleanData = data ? cleanStega(data) : data;

  const trustedBy: {
    eyebrow?: string;
    logos: Logo[];
    testimonials: Testimonial[];
  } = {
    eyebrow: cleanData?.eyebrow?.trim(),
    logos:
      cleanData?.logos?.filter((logo) => logo.name?.trim() || logo.logoLight || logo.logoDark) ?? [],
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

  return (
    <SectionsWrapper id="trusted-by" eyebrow={trustedBy.eyebrow} classNameOverride="px-0">
      <div className="flex flex-col gap-12">
        {/* Logo grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 -mt-12">
          {trustedBy.logos.map((logoItem, idx) => (
            <div
              key={idx}
              className="p-6 border-b border-r dark:border-white/20 border-black/20"
            >
              <LogoItem logoItem={logoItem} />
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
              className="grid grid-cols-1 gap-6 xl:grid-cols-2 px-6"
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
