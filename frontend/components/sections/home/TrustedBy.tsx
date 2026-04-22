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

  const trustedBy = {
    eyebrow: cleanData?.eyebrow ?? trustedByFallback.eyebrow,
    logos:
      cleanData?.logos && cleanData.logos.length > 0
        ? cleanData.logos
        : trustedByFallback.logos.map(name => ({ name, logo: null })),
    testimonials:
      cleanData?.testimonials && cleanData.testimonials.length > 0
        ? cleanData.testimonials
        : trustedByFallback.testimonials,
  };

  const logoRows: Logo[][] = [];
  for (let i = 0; i < trustedBy.logos.length; i += 3) {
    logoRows.push([...trustedBy.logos.slice(i, i + 3)]);
  }

  return (
    <SectionsWrapper id="trusted-by" eyebrow={trustedBy.eyebrow}>
      <div className="flex flex-col gap-12">
        {/* Logo grid */}
        <div className="flex flex-col">
          {logoRows.map((row, rIdx) => (
            <div key={rIdx}>
              {rIdx === 0 ? <div className="h-px w-full bg-border" /> : null}
              <div className="grid grid-cols-2 md:grid-cols-3">
                {row.map((logoItem, cIdx) => {
                  const logoUrl = logoItem.logo ? urlForImage(logoItem.logo).width(410).height(230).url() : null;
                  return (
                    <div
                      key={cIdx}
                      className={`flex flex-col items-center justify-center gap-2 p-6 ${
                        cIdx !== row.length - 1 ? "md:border-r border-border" : ""
                      }`}
                    >
                      <div className="group/logo relative aspect-[102.5/57.65] w-full overflow-hidden bg-black">
                        {/* Dotted texture placeholder background */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/figma/logo-card-bg.png"
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover opacity-45 transition-opacity duration-500 group-hover/logo:opacity-65"
                        />
                        {/* Client logo */}
                        {logoUrl && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={logoUrl}
                            alt={logoItem.name}
                            className="absolute inset-0 h-full w-full object-contain p-4 transition-opacity duration-300 group-hover/logo:opacity-90"
                          />
                        )}
                      </div>
                      <p className="text-center text-[20px] text-foreground">{logoItem.name}</p>
                    </div>
                  );
                })}
              </div>
              <div className="h-px w-full bg-border" />
            </div>
          ))}
        </div>

        {/* Testimonials */}
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
                className="group flex flex-col gap-10 border border-transparent dark:bg-[#0F0F0F] bg-[#f7f7f7] p-6 transition-all duration-300 ease-out hover:border-brand/30 hover:-translate-y-0.5 lg:p-10"
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
                    <p className="text-body text-brand">{t.attribution}</p>
                  </div>
                  <p className="text-[22px] leading-[30px] tracking-[-0.2px] text-foreground md:text-[24px] md:leading-[32px] xl:text-[28px] xl:leading-[36px] 2xl:text-[32px] 2xl:leading-[38px]">
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
      className="h-12 w-8 shrink-0"
      style={{ transform: "scaleY(-1) rotate(180deg)" }}
    />
  );
}
