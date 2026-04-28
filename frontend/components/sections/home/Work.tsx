"use client";

import Link from "next/link";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { Button } from "@/components/partials/Button";
import ArrowRight from "@/components/icons/ArrowRight";
import { ourWork as ourWorkFallback } from "@/lib/content/home";
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
    graphic?: SanityImageSource;
    project?: {
      _id?: string;
      client?: string;
      year?: string;
      slug?: { current?: string };
      category?: string;
      title?: string;
      tagline?: string;
      image?: SanityImageSource;
      thumb?: SanityImageSource;
      link?: string;
    };
  }>;
};

type ProjectItem = {
  client: string;
  year: string;
  category: string;
  name: string;
  tagline: string;
  thumbHref: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl?: string;
  graphicUrl?: string;
};

export function OurWork({ data }: { data?: PortfolioData }) {
  const cleanData = data ? cleanStega(data) : data;
  const ctaHref =
    linkResolver(cleanData?.cta?.link ?? undefined) ?? ourWorkFallback.cta.href;
  const ctaLabel = cleanData?.cta?.buttonText ?? ourWorkFallback.cta.label;

  const itemsFromCards: ProjectItem[] =
    cleanData?.cards?.map((card) => {
      const projectVisual = card.project?.image ?? card.project?.thumb;

      return {
        client: card.project?.client || "",
        year: card.project?.year || "",
        category: card.project?.category || "",
        name: card.project?.title || "",
        tagline: card.project?.tagline || "",
        thumbHref: card.project?.link || "#",
        ctaLabel: "View",
        ctaHref: card.project?.slug?.current
          ? `/portfolio/${card.project.slug.current}`
          : "#",
        imageUrl: projectVisual
          ? urlForImage(projectVisual).width(1920).height(1080).url()
          : undefined,
        graphicUrl: card.graphic
          ? urlForImage(card.graphic).width(1600).fit("max").url()
          : undefined,
      };
    }) ?? [];

  const items = itemsFromCards.length > 0 ? itemsFromCards : [...ourWorkFallback.items];

  return (
    <SectionsWrapper
      id="work"
      eyebrow={cleanData?.eyebrow || ourWorkFallback.eyebrow}
    >
      <div className="flex flex-col gap-12">
        <div className="px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <SplitTextReveal
            as="h2"
            type="words"
            stagger={0.04}
            colorReveal
            className="text-[28px] leading-9 tracking-[-0.3px] text-foreground md:text-[36px] md:leading-12 lg:text-[44px] lg:leading-14 2xl:text-5xl 2xl:leading-14.5 2xl:tracking-[-0.4px]"
          >
            {cleanData?.heading}
          </SplitTextReveal>
        </div>

        <RevealOnScroll
          as="div"
          stagger={0.15}
          from="bottom"
          distance={24}
          className="flex flex-col gap-6"
        >
          {items.map((item, idx) => (
            <CaseRow key={idx} item={item} />
          ))}
        </RevealOnScroll>

        <div className="flex justify-center px-6 pb-4">
          <Button href={ctaHref} variant="primary">
            {ctaLabel}
          </Button>
        </div>
      </div>
    </SectionsWrapper>
  );
}

function CaseRow({ item }: { item: ProjectItem }) {
  const hasGraphic = Boolean(item.graphicUrl);

  return (
    <div className="group relative isolate flex justify-center overflow-hidden px-6 py-6 transition-all duration-300 ease-out lg:px-6">
      {hasGraphic ? (
        <>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dark:hidden">
            <div className="absolute inset-0 bg-white" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.graphicUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover mix-blend-difference"
              style={{
                filter:
                  "brightness(0.8) sepia(1) saturate(3) hue-rotate(-30deg) contrast(1.1)",
                opacity: 0.55,
              }}
            />
            <div className="absolute inset-0 bg-brand mix-blend-screen opacity-18" />
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

          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hidden dark:block">
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(0deg, #9D2B03 0%, #9D2B03 100%)" }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.graphicUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
              style={{
                filter: "brightness(0.78) sepia(1) saturate(4) hue-rotate(-25deg) contrast(1.05)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(180deg, rgba(11,11,11,0.88) 0%, rgba(11,11,11,0.42) 16%, rgba(11,11,11,0) 32%, rgba(11,11,11,0) 68%, rgba(11,11,11,0.42) 84%, rgba(11,11,11,0.88) 100%),
                  linear-gradient(90deg, rgba(11,11,11,0.88) 0%, rgba(11,11,11,0.42) 12%, rgba(11,11,11,0) 24%, rgba(11,11,11,0) 76%, rgba(11,11,11,0.42) 88%, rgba(11,11,11,0.88) 100%)
                `,
              }}
            />
          </div>
        </>
      ) : null}

      <div className="flex w-full max-w-270 flex-col border dark:border-white/20 border-black/20 bg-surface transition-all duration-300 ease-out group-hover:border-white/15 group-hover:bg-transparent md:grid md:grid-cols-[150px_minmax(0,1fr)_250px]">
        <div className="flex w-full flex-col p-4 md:border-r md:border-black/20 md:p-6 md:dark:border-white/20">
          <div className="flex flex-col gap-0 bg-brand p-2 text-white">
            <span className="text-caption tracking-[-0.16px]">
              {item.client}
            </span>
            <span className="font-betatron text-deco-h4 leading-9 tracking-[-0.2px] text-foreground">
              {item.year}
            </span>
          </div>
          <Link
            href={item.thumbHref}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/10 p-2 text-body dark:text-white text-black transition-colors hover:bg-white/15"
          >
            See website
          </Link>
        </div>

        <div className="p-4 md:border-r md:border-black/20 md:p-6 md:dark:border-white/20">
          <div className="relative aspect-video w-full overflow-hidden bg-black">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/figma/work-thumb.png"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-20"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 mix-blend-multiply"
                  style={{
                    background:
                      "linear-gradient(to bottom, #c1c9c5 35%, #ff4100 100%)",
                  }}
                />
              </>
            )}
          </div>
        </div>

        <div className="flex w-full flex-col justify-between gap-6 p-4 md:p-6">
          <Link href={item.ctaHref}>
            <Button variant="primary">{item.ctaLabel}</Button>
          </Link>

          <div className="flex flex-col">
            <span className="text-caption capitalize tracking-[-0.16px] text-brand">
              {item.category}
            </span>
            <span className="font-funnel dark:text-white text-black text-deco-h4 leading-9 tracking-[-0.2px]">
              {item.name}
            </span>
            <p className="text-funnel text-[#EFEFEFB3] text-[18px]">{item.tagline}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
