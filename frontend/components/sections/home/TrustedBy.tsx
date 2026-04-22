"use client";

import { SectionsWrapper } from "@/components/SectionsWrapper";
import { RevealOnScroll } from "@/components/partials/motion/RevealOnScroll";
import { trustedBy as trustedByFallback } from "@/lib/content/home";
import { cleanStega, urlForImage } from "@/sanity/lib/utils";

/**
 * Trusted By — frame 141:10693 (Desktop - 40).
 *
 *   ─── 3×2 logo-card grid (placeholder thumbnails + label) ───
 *   2×2 testimonial cards (quote mark + attribution + quote)
 */

export type Testimonial = {
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
    eyebrow: string;
    logos: Logo[];
    testimonials: Testimonial[];
  } = {
    eyebrow: cleanData?.eyebrow ?? trustedByFallback.eyebrow,
    logos:
      cleanData?.logos && cleanData.logos.length > 0
        ? cleanData.logos
        : trustedByFallback.logos.map(name => ({ name, logo: null })),
    testimonials:
      cleanData?.testimonials && cleanData.testimonials.length > 0
        ? cleanData.testimonials
        : (trustedByFallback.testimonials as Testimonial[]),
  };

  const logoRows: Logo[][] = [];
  for (let i = 0; i < trustedBy.logos.length; i += 3) {
    logoRows.push([...trustedBy.logos.slice(i, i + 3)]);
  }

  return (
    <SectionsWrapper id="trusted-by" eyebrow={trustedBy.eyebrow}>
      <div className="flex flex-col gap-12">
        {/* Logo grid */}
        <div className="-mx-6 flex flex-col">
          {logoRows.map((row, rIdx) => (
            <div key={rIdx}>
              {rIdx === 0 ? <div className="h-px w-full dark:bg-white/20 bg-black/20" /> : null}
              <div className="grid grid-cols-2 divide-x dark:divide-white/20 divide-black/20 md:grid-cols-3">
                {row.map((logoItem, cIdx) => {
                  const logoUrl = logoItem.logo ? urlForImage(logoItem.logo).width(410).height(230).url() : null;
                  return (
                    <div key={cIdx} className="p-6">
                      <div className="group/logo relative aspect-[102.5/57.65] w-full overflow-hidden bg-black">
                        <div className="absolute inset-0 bg-black" />
                        {/* Dotted texture placeholder background */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/figma/logo-card-bg.png"
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover opacity-20"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#c1c9c5] from-[35.039%] to-[#ff4100] mix-blend-multiply" />
                        {/* Client logo */}
                        {logoUrl && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={logoUrl}
                            alt={logoItem.name}
                            className="absolute inset-0 h-full w-full object-contain p-4"
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
        <RevealOnScroll
          as="div"
          stagger={0.12}
          from="bottom"
          distance={24}
          className="grid grid-cols-1 gap-6 px-6 xl:grid-cols-2"
        >
          {trustedBy.testimonials.map((t, idx) => {
            const profileUrl = t.profilePicture ? urlForImage(t.profilePicture).width(200).height(200).fit("crop").url() : null;
            return (
              <article
                key={idx}
                className="flex flex-col gap-12 bg-[#f7f7f7] p-8 dark:bg-[#0F0F0F] xl:p-12"
              >
                <QuoteMark />
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    {profileUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={profileUrl}
                        alt={t.attribution}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    )}
                    <p className="text-[18px] leading-[1.5] text-brand">{t.attribution}</p>
                  </div>
                  <p className="text-[30px] leading-[1.2] tracking-[-1px] text-foreground 2xl:text-[32px]">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
              </article>
            );
          })}
        </RevealOnScroll>
      </div>
    </SectionsWrapper>
  );
}

function QuoteMark() {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/figma/quote-mark.svg"
      alt=""
      aria-hidden="true"
      className="h-12 w-[31.689px] shrink-0"
      style={{ transform: "scaleY(-1) rotate(180deg)" }}
    />
  );
}
