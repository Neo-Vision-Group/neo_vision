"use client";

import { SectionsWrapper } from "@/components/SectionsWrapper";
import ServicesPreviewCard from "@/components/partials/ServicesPreviewCard";
import { cleanStega, linkResolver, urlForImage } from "@/sanity/lib/utils";
import type { SanityImageSource } from "@sanity/image-url";
import dynamic from "next/dynamic";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  { ssr: false }
);

export type WhatWeDoData = {
  eyebrow?: string;
  cards?: Array<{
    _key?: string;
    kind: "engineering" | "ai";
    label?: string;
    labelImage?: SanityImageSource | string;
    title: string;
    body: string;
    services?: Array<{ name?: string, price?: string }>;
  cta: { buttonText?: string; link?: any };
  texture?: SanityImageSource | string;
  }>;
};

export function WhatWeDo({ data }: { data?: WhatWeDoData }) {
  const cleanData = data ? cleanStega(data) : data;

  const whatWeDo = {
    eyebrow: cleanData?.eyebrow?.trim(),
    cards:
      cleanData?.cards
        ?.map((card) => {
          const title = card.title?.trim();
          const body = card.body?.trim();

          if (!title || !body) {
            return null;
          }

          return {
            _key: card._key,
            kind: card.kind,
            label: card.label?.trim(),
      labelImage:
        typeof card.labelImage === "string"
          ? card.labelImage
          : card.labelImage
            ? urlForImage(card.labelImage).width(640).fit("max").url()
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
      texture:
        typeof card.texture === "string"
          ? card.texture
          : card.texture
            ? urlForImage(card.texture).width(1600).fit("max").url()
            : undefined,
          };
        })
        .filter((card): card is NonNullable<typeof card> => Boolean(card)) ?? [],
  };

  if (whatWeDo.cards.length === 0) {
    return null;
  }

  return (
    <SectionsWrapper id="what-we-do" eyebrow={whatWeDo.eyebrow}>
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
    </SectionsWrapper>
  );
}
