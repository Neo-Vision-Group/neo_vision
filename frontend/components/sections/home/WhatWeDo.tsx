"use client";

import { SectionsWrapper } from "@/components/SectionsWrapper";
import ServicesPreviewCard from "@/components/partials/ServicesPreviewCard";
import { Button } from "@/components/partials/Button";
import ResolvedLink from "@/components/ResolvedLink";
import { cleanStega, linkResolver, urlForImage } from "@/sanity/lib/utils";
import type { SanityImageSource } from "@sanity/image-url";
import dynamic from "next/dynamic";
import { SplitTextReveal } from "@/components/partials/motion/SplitTextReveal";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  { ssr: false }
);

export type WhatWeDoData = {
  eyebrow?: string;
  heading?: string;
  cards?: Array<{
    _key?: string;
    kind: "engineering" | "ai";
    label?: string;
    labelImage?: SanityImageSource | null;
    labelImageLight?: SanityImageSource | null;
    labelImageDark?: SanityImageSource | null;
    title: string;
    body: string;
    services?: Array<{ name?: string, price?: string }>;
    cta: { buttonText?: string; link?: any };
    texture?: boolean;
  }>;
  ctaSection?: {
    heading?: string;
    subheading?: string;
    cta?: { buttonText?: string; link?: any };
  };
};

export function WhatWeDo({ data }: { data?: WhatWeDoData }) {
  const cleanData = data ? cleanStega(data) : data;

  const ctaSectionLink = cleanData?.ctaSection?.cta?.link;
  const ctaSectionHref = linkResolver(ctaSectionLink);
  const ctaSectionLabel = cleanData?.ctaSection?.cta?.buttonText?.trim();
  const ctaSectionHeading = cleanData?.ctaSection?.heading?.trim();
  const ctaSectionSubheading = cleanData?.ctaSection?.subheading?.trim();
  const hasCtaButton = ctaSectionLabel && ctaSectionHref;
  const hasCtaSection = ctaSectionHeading || ctaSectionSubheading || hasCtaButton;

  const whatWeDo = {
    eyebrow: cleanData?.eyebrow?.trim(),
    heading: cleanData?.heading,
    cards:
      cleanData?.cards
        ?.map((card) => {
          const title = card.title?.trim();
          const body = card.body?.trim();
          const hasServices = card.services && card.services.length > 0;

          if ((!title || !body) && !hasServices) {
            return null;
          }

          return {
            _key: card._key,
            kind: card.kind,
            label: card.label?.trim(),
      labelImage: card.labelImage
        ? urlForImage(card.labelImage).width(640).fit("max").url()
        : undefined,
      labelImageLight: card.labelImageLight
        ? urlForImage(card.labelImageLight).width(640).fit("max").url()
        : undefined,
      labelImageDark: card.labelImageDark
        ? urlForImage(card.labelImageDark).width(640).fit("max").url()
        : undefined,
            title,
            body,
            services:
              card.services?.map((service) => ({
                name: service.name?.trim(),
                price: service.price?.trim(),
              })) ?? [],
            cta:
              card.cta?.buttonText?.trim() && linkResolver(card.cta?.link)
                ? {
                    label: card.cta.buttonText.trim(),
                    href: linkResolver(card.cta.link)!,
                    variant: (card.kind === "ai" ? "primary" : "secondary") as
                      | "primary"
                      | "secondary",
                  }
                : undefined,
      texture: card.texture ?? false,
          };
        })
        .filter((card): card is NonNullable<typeof card> => Boolean(card)) ?? [],
  };

  if (whatWeDo.cards.length === 0 && !whatWeDo.heading?.length && !hasCtaSection) {
    return null;
  }

  return (
    <SectionsWrapper id="what-we-do" eyebrow={whatWeDo.eyebrow}>
      <div className="flex flex-col gap-12 md:gap-16">
        {whatWeDo.heading?.length ? (
            <SplitTextReveal
              as="p"
              type="words"
              stagger={0.04}
              colorReveal
              className="text-3xl font-funnel tracking-[-0.2px] md:text-[58px] md:leading-17 lg:text-[40px] lg:leading-13 2xl:text-5xl 2xl:leading-14.5 2xl:tracking-[-0.4px]"
            >
              {whatWeDo.heading}
            </SplitTextReveal>
        ) : null}
        <RevealOnScroll
          as="div"
          stagger={0.15}
          from="bottom"
          distance={32}
          duration={0.9}
          className="flex flex-col gap-6 xl:flex-row 2xl:gap-6"
        >
          {whatWeDo.cards.map((card, idx) => (
            <ServicesPreviewCard key={card._key || `card-${idx}`} card={card} />
          ))}
        </RevealOnScroll>
        {hasCtaSection ? (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between pb-16">
            <div className="flex flex-col gap-2">
              {ctaSectionHeading ? (
                <p className="max-w-190 font-funnel text-[28px] leading-[1.2] tracking-[-0.8px] text-black dark:text-[#efefef] md:text-4xl md:tracking-[-1px]">
                  {ctaSectionHeading}
                </p>
              ) : null}
              {ctaSectionSubheading ? (
                <p className="text-body text-black/70 dark:text-[#efefef]/70">
                  {ctaSectionSubheading}
                </p>
              ) : null}
            </div>
            {hasCtaButton ? (
              ctaSectionLink ? (
                <ResolvedLink link={ctaSectionLink}>
                  <Button
                    variant="primary"
                    className="h-full self-start px-8 md:px-10 lg:self-center"
                  >
                    {ctaSectionLabel}
                  </Button>
                </ResolvedLink>
              ) : (
                <Button
                  href={ctaSectionHref || "#"}
                  variant="primary"
                  className="h-full self-start px-8 md:px-10 lg:self-center"
                >
                  {ctaSectionLabel}
                </Button>
              )
            ) : null}
          </div>
        ) : null}
      </div>
    </SectionsWrapper>
  );
}
