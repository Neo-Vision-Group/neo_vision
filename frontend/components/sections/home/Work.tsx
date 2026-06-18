"use client";

import React from "react";
import Link from "next/link";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { Button } from "@/components/partials/Button";
import { cleanStega, linkResolver } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";
import Image from "next/image"

const workCardHoverGraphic = "/images/graphic.webp";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  { ssr: false }
);

const SplitTextReveal = dynamic(
  () =>
    import("@/components/partials/motion/SplitTextReveal").then(
      (mod) => mod.SplitTextReveal
    ),
  { ssr: false }
);

export type PortfolioData = {
  eyebrow?: string;
  heading?: string;
  cta?: {
    buttonText?: string | null;
    link?: {
      linkType?: "href" | "page" | "post" | "service" | "project";
      href?: string | null;
      page?: string | null;
      post?: string | null;
      service?: string | null;
      project?: string | null;
    } | null;
  } | null;
  cards?: Array<{
    _key?: string;
    project?: {
      _id?: string;
      client?: string;
      title?: string;
      year?: string;
      slug?: { current?: string };
      category?: string;
      tagline?: string;
      thumb?: string;
    };
  }>;
};

type ProjectItem = {
  key: string;
  title: string;
  year: string;
  category: string;
  name: string;
  tagline: string;
  thumbHref: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string | undefined;
};

export function OurWork({ data }: { data?: PortfolioData }) {
  const cleanData = data ? cleanStega(data) : data;
  const [imageErrors, setImageErrors] = React.useState<Set<string>>(new Set());

  const handleImageError = (imageUrl: string) => {
    setImageErrors(prev => new Set(prev).add(imageUrl));
  };

  const ctaHref = linkResolver(cleanData?.cta?.link ?? undefined);
  const ctaLabel = cleanData?.cta?.buttonText?.trim();
  const heading = cleanData?.heading?.trim();

  const itemsFromCards =
    cleanData?.cards
      ?.map((card, index) => {
        const projectVisual = card.project?.thumb;
        const projectSlug = card.project?.slug?.current?.trim();
        const projectName =
          card.project?.title?.trim() || card.project?.client?.trim();

        if (!projectSlug || !projectName) {
          return null;
        }

        const projectHref = `/portfolio/${projectSlug}`;

        return {
          key: card._key ?? `${projectSlug}-${index}`,
          title: projectName,
          year: card.project?.year?.trim() || "",
          category: card.project?.category?.trim() || "",
          name: projectName,
          tagline: card.project?.tagline?.trim() || "",
          thumbHref: projectHref,
          ctaLabel: "View",
          ctaHref: projectHref,
          imageUrl: projectVisual,
        };
      })
      .filter((item): item is ProjectItem => item !== null) ?? [];

  if (!heading && itemsFromCards.length === 0 && !ctaLabel) {
    return null;
  }

  return (
    <SectionsWrapper
      id="work"
      eyebrow={cleanData?.eyebrow?.trim()}
      classNameOverride="px-0"
    >
      <div className="flex flex-col gap-12">
        {heading ? (
          <div className="px-6 xl:px-16 2xl:px-16">
            <SplitTextReveal
              as="h2"
              type="words"
              stagger={0.04}
              colorReveal
              className="text-[28px] leading-12 tracking-[-0.3px] text-foreground md:text-[36px] md:leading-12 lg:text-[44px] lg:leading-14 2xl:text-5xl 2xl:leading-14.5 2xl:tracking-[-0.4px]"
            >
              {heading}
            </SplitTextReveal>
          </div>
        ) : null}

        <RevealOnScroll
          as="div"
          stagger={0.15}
          from="bottom"
          distance={24}
          className="flex flex-col gap-6"
        >
          {itemsFromCards.map((item) => (
            <div key={item.key} className="px-2 xl:px-6 2xl:px-16">
              <CaseRow item={item} imageErrors={imageErrors} onImageError={handleImageError} />
            </div>
          ))}
        </RevealOnScroll>

        {ctaLabel && ctaHref ? (
          <div className="flex justify-center px-6 pb-16">
            <Button href={ctaHref} variant="primary">
              {ctaLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </SectionsWrapper>
  );
}

function CaseRow({ item, imageErrors, onImageError }: { item: ProjectItem; imageErrors: Set<string>; onImageError: (url: string) => void }) {
  return (
    <div className="group/work-shell relative isolate flex justify-center overflow-hidden py-6 transition-all duration-700 ease-out">
      <div className="pointer-events-none absolute inset-x-6 inset-y-6 transition-all duration-700 ease-out group-hover/work-shell:inset-0">
        <div className="relative isolate h-full w-full overflow-hidden transition-all duration-700 ease-out">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-700 ease-out group-hover/work-shell:opacity-100 dark:hidden"
          >
            <div className="absolute inset-0 bg-white" />
            <Image
              src={workCardHoverGraphic}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="absolute inset-0 h-full w-full object-cover invert"
            />
            <div className="absolute inset-0 bg-brand mix-blend-screen" />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.45) 14%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.45) 86%, rgba(255,255,255,0.9) 100%),
                  linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.45) 12%, rgba(255,255,255,0) 24%, rgba(255,255,255,0) 76%, rgba(255,255,255,0.45) 88%, rgba(255,255,255,0.9) 100%)
                `,
              }}
            />
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 hidden opacity-0 transition-opacity duration-700 ease-out group-hover/work-shell:opacity-100 dark:block"
          >
            <div className="absolute inset-0 bg-dark" />
            <Image
              src={workCardHoverGraphic}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="absolute inset-0 h-full w-full object-cover mix-blend-screen"
              style={{
                filter: "brightness(0.45) sepia(1) saturate(6) hue-rotate(-25deg) contrast(1.1)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(180deg, rgba(4,4,4,0.88) 0%, rgba(4,4,4,0.42) 16%, rgba(4,4,4,0) 32%, rgba(4,4,4,0) 68%, rgba(4,4,4,0.42) 84%, rgba(4,4,4,0.88) 100%),
                  linear-gradient(90deg, rgba(4,4,4,0.88) 0%, rgba(4,4,4,0.42) 12%, rgba(4,4,4,0) 24%, rgba(4,4,4,0) 76%, rgba(4,4,4,0.42) 88%, rgba(4,4,4,0.88) 100%)
                `,
              }}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex w-full max-w-270 flex-col transition-all duration-700 ease-out group-hover/work-shell:bg-transparent md:flex-row md:flex-wrap lg:flex-nowrap lg:flex-row">
        <div className="order-3 flex w-full shrink-0 flex-col items-center justify-center p-4 md:order-2 md:w-1/2 lg:order-1 lg:w-1/4">
          <div className="flex w-full flex-col items-center gap-2 bg-brand p-2 text-white">
            <span className="text-[20px] font-semibold text-white">
              Date
            </span>
            <span className="font-clash text-4xl text-center leading-12 tracking-[-0.2px] text-foreground">
              {item.year}
            </span>
          </div>
          <Link
            href={item.thumbHref}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/10 p-2 text-body w-full text-center dark:text-white text-black transition-colors hover:bg-white/15"
          >
            See website<span className="sr-only"> (opens in new tab)</span>
          </Link>
        </div>

        <div className="order-2 relative min-h-48 min-w-0 flex-1 p-4 md:order-3 md:w-full md:min-h-64 lg:order-2 lg:w-auto">
          <div className="relative h-full w-full overflow-hidden">
            {item.imageUrl && !imageErrors.has(item.imageUrl) ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                className="object-cover transition-transform duration-700 ease-out group-hover/work-shell:scale-105"
                fill
                sizes="(min-width: 1024px) 50vw, (min-width: 768px) calc(100vw - 64px), calc(100vw - 48px)"
                onError={() => onImageError(item.imageUrl!)}
              />
            ) : item.imageUrl ? (
              <div className="flex h-full w-full items-center justify-center bg-muted-light dark:bg-muted-dark">
                <span className="font-clash text-4xl text-brand opacity-50">NV</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="order-1 flex w-full shrink-0 flex-col justify-between gap-6 p-4 md:order-1 md:w-1/2 lg:order-3 lg:w-1/4 lg:py-6">
          <Button href={item.ctaHref} variant="primary">{item.ctaLabel}</Button>

          <div className="flex flex-col">
            <span className="text-caption capitalize tracking-[-0.16px] text-brand">
              {item.category}
            </span>
            <span className="font-funnel dark:text-white text-black text-[32px] leading-12 tracking-[-1px]">
              {item.name}
            </span>
            <p className="text-funnel text-muted-light dark:text-muted-dark text-[18px]">{item.tagline}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
