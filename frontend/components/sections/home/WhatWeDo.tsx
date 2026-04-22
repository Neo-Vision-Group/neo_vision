"use client";

import { RevealOnScroll } from "@/components/partials/motion/RevealOnScroll";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import ServicesPreviewCard from "@/components/partials/ServicesPreviewCard";
import { services as servicesFallback } from "@/lib/content/home";
import { cleanStega } from "@/sanity/lib/utils";

export type WhatWeDoData = {
  eyebrow?: string;
  cards?: Array<{
    _key?: string;
    kind: "engineering" | "ai";
    label: string;
    title: string;
    body: string;
    services?: Array<{ title?: string }>;
    cta: { buttonText?: string; link?: any };
    texture?: string;
  }>;
};

export function WhatWeDo({ data }: { data?: WhatWeDoData }) {
  const cleanData = data ? cleanStega(data) : data;
  
  const whatWeDo = {
    eyebrow: cleanData?.eyebrow ?? servicesFallback.eyebrow,
    cards: cleanData?.cards?.map(card => ({
      _key: card._key,
      kind: card.kind,
      label: card.label,
      title: card.title,
      body: card.body,
      services: card.services,
      cta: {
        label: card.cta?.buttonText ?? "Learn more",
        href: card.cta?.link?.href ?? card.cta?.link?.page ?? card.cta?.link?.post ?? "#",
        variant: (card.kind === "ai" ? "primary" : "secondary") as "primary" | "secondary",
      },
      texture: card.texture,
    })) ?? servicesFallback.cards.map((card, idx) => ({
      _key: `fallback-${card.kind}-${idx}`,
      ...card,
    })),
  };
  
  return (
    <SectionsWrapper id="what-we-do" eyebrow={whatWeDo.eyebrow}>
      <RevealOnScroll
        as="div"
        stagger={0.15}
        from="bottom"
        distance={32}
        duration={0.9}
        className="flex flex-col gap-6 px-6 md:px-6 lg:px-8 xl:flex-row xl:px-12 2xl:gap-6 2xl:px-16"
      >
        {whatWeDo.cards.map((card, idx) => (
          <ServicesPreviewCard key={card._key || `card-${idx}`} card={card} />
        ))}
      </RevealOnScroll>
    </SectionsWrapper>
  );
}