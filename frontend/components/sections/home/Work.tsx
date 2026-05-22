"use client";

import Link from "next/link";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { Button } from "@/components/partials/Button";
import { cleanStega, linkResolver } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";
import Image from "next/image"

const workCardHoverGraphic = "/images/graphic.jpg";

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

function resolveImageUrl(image?: string) {
  return image || undefined;
}

export function OurWork({ data }: { data?: PortfolioData }) {
  const cleanData = data ? cleanStega(data) : data;
  
  console.log(`[Work] Component rendered with:`, {
    hasData: !!data,
    cardsCount: cleanData?.cards?.length,
    heading: cleanData?.heading
  });
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
          console.warn(`[Work] Skipping card ${index}: missing slug or name`, {
            projectSlug,
            projectName,
            card: card.project
          });
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

  const items = itemsFromCards;

  console.log(`[Work] Final items array:`, {
    totalCards: cleanData?.cards?.length,
    validItems: items.length,
    items: items.map(item => ({
      key: item.key,
      name: item.name,
      hasImage: !!item.imageUrl,
      imageUrl: item.imageUrl?.substring(0, 100) + '...'
    }))
  });

  if (!heading && items.length === 0 && !ctaLabel) {
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
          <div className="px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <SplitTextReveal
              as="h2"
              type="words"
              stagger={0.04}
              colorReveal
              className="text-[28px] leading-9 tracking-[-0.3px] text-foreground md:text-[36px] md:leading-12 lg:text-[44px] lg:leading-14 2xl:text-5xl 2xl:leading-14.5 2xl:tracking-[-0.4px]"
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
          className="flex flex-col gap-6 "
        >
          {items.map((item) => (
            <div key={item.key} className="px-6 lg:px-16">
              <CaseRow item={item} />
            </div>
          ))}
        </RevealOnScroll>

        {ctaLabel && ctaHref ? (
          <div className="flex justify-center px-6 pb-4">
            <Button href={ctaHref} variant="primary">
              {ctaLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </SectionsWrapper>
  );
}

function CaseRow({ item }: { item: ProjectItem }) {
  return (
    <div className="group/work-shell relative isolate flex justify-center overflow-hidden py-6 transition-all duration-300 ease-out">
      <div className="pointer-events-none absolute inset-x-6 inset-y-6 transition-all duration-300 ease-out group-hover/work-shell:inset-0">
        <div className="relative isolate h-full w-full overflow-hidden transition-all duration-300 ease-out">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 ease-out group-hover/work-shell:opacity-100 dark:hidden"
          >
            <div className="absolute inset-0 bg-white" />
            <img
              src={workCardHoverGraphic}
              alt=""
              className="absolute inset-0 h-full w-full object-cover invert"
            />
            <div
              className="absolute inset-0 mix-blend-screen"
              style={{ background: "#ff4404" }}
            />
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
            className="pointer-events-none absolute inset-0 -z-10 hidden opacity-0 transition-opacity duration-300 ease-out group-hover/work-shell:opacity-100 dark:block"
          >
            <div
              className="absolute inset-0"
              style={{ background: "#040404" }}
            />
            <img
              src={workCardHoverGraphic}
              alt=""
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

      <div className="relative z-10 flex w-full max-w-270 flex-col transition-all duration-300 ease-out group-hover/work-shell:bg-transparent lg:flex-row">
        <div className="flex w-full shrink-0 flex-col justify-end p-4 lg:w-1/4">
          <div className="flex flex-col gap-0 bg-brand p-2 text-white">
            <span className="text-caption tracking-[-0.16px]">
              Date
            </span>
            <span className="font-betatron text-4xl leading-9 tracking-[-0.2px] text-foreground">
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

        <div className="relative min-h-48 min-w-0 flex-1 p-4 md:min-h-64">
          <div className="relative h-full w-full overflow-hidden">
            {item.imageUrl && (
              <Image
                src={item.imageUrl}
                alt={item.name}
                className="object-cover transition-transform duration-500 ease-out group-hover/work-shell:scale-105"
                fill
                sizes="(min-width: 1024px) 50vw, (min-width: 768px) calc(100vw - 64px), calc(100vw - 48px)"
                onError={(e) => {
                  console.error(`[Work] Image failed to load:`, item.imageUrl, e);
                }}
                onLoad={() => {
                  console.log(`[Work] Image loaded:`, item.imageUrl);
                }}
              />
            )}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col justify-between gap-6 p-4 lg:w-1/4 lg:py-6">
          <Link href={item.ctaHref}>
            <Button variant="primary">{item.ctaLabel}</Button>
          </Link>

          <div className="flex flex-col">
            <span className="text-caption capitalize tracking-[-0.16px] text-brand">
              {item.category}
            </span>
            <span className="font-funnel dark:text-white text-black text-4xl leading-9 tracking-[-0.2px]">
              {item.name}
            </span>
            <p className="text-funnel dark:text-[#efefefb3] text-[#040404b3] text-[18px]">{item.tagline}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
