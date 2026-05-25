"use client";

import { cn } from "@/lib/utils";
import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "next-themes";
import { PortableTextRenderer } from "@/components/partials/PortableTextRenderer";
import type { PortableTextBlock } from "@portabletext/types";
import { useEffect, useState } from "react";
import Badge from "@/components/partials/Badge"
import ThirdButton from "@/components/partials/ThirdButton"
import Image from 'next/image'

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    )
);

export type HeadingShape = string | { faded?: string; bold?: string; trailing?: string; regular?: string };

export type PageHeroStat = {
  number?: number;
  suffix?: string;
  label?: string;
  value?: string;
};

export type PageHeroData = {
  eyebrow?: string;
  heading: PortableTextBlock[];
  subheading?: string;
  stats?: PageHeroStat[];
  featured?: {
    _type?: "post" | "project";
    _id?: string;
    slug?: string | { current?: string | null } | null;
    cover?: string | null;
    category?: string | {title?: string | null} | null;
    title?: string | null;
    excerpt?: string | null;
    publishedAt?: string | null;
    readTime?: number | null;
    author?: {
      name?: string | null;
    } | null;
    client?: string | null;
    year?: string | null;
    industry?: string | null;
    tagline?: string | null;
  } | null;
};

const FALLBACK_PATTERN =
  "radial-gradient(circle at 18% 22%, rgba(255,255,255,0.09) 0, rgba(255,255,255,0.09) 1px, transparent 1px), radial-gradient(circle at 72% 14%, rgba(255,255,255,0.07) 0, rgba(255,255,255,0.07) 1px, transparent 1px), radial-gradient(circle at 52% 40%, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(180deg, rgba(15,15,15,0.2) 0%, rgba(4,4,4,0.9) 100%)";

export function PageHero({ data }: { data?: PageHeroData }) {
  const cleanData = data ? cleanStega(data) : data;

  const eyebrow = cleanData?.eyebrow;
  const subheading = cleanData?.subheading;


  // Get stats
  const stats = cleanData?.stats;
  const featured = cleanData?.featured;

  return (
    <section
      className={cn(
        "has-hero-pattern relative isolate min-h-[calc(100svh-4rem)] lg:h-[calc(100svh-3.5rem)] flex w-full flex-col bg-transparent"
      )}
    >

      <div className={cn(
        "flex h-full bg-none",
        featured ? "flex-col lg:items-stretch" : "flex-col"
      )}>
        <div className={cn(
          "flex flex-1 flex-col justify-start gap-10 px-3 py-8 md:gap-14 md:px-6 md:py-20 lg:px-8 xl:px-12 2xl:px-30",
          featured ? "lg:py-12 xl:py-14 2xl:py-16" : "lg:py-28 xl:py-16 2xl:py-20"
        )}>
          <div>
            {eyebrow ? (
              <p className="font-betatron text-4xl leading-[1.2] uppercase text-brand">
                {eyebrow}
              </p>
            ) : null}

            <PortableTextRenderer
              value={cleanData?.heading}
              className={cn(
                "[&_p]:my-0",
                "[&_p]:font-funnel",
                "[&_p]:text-[48px]",
                "[&_p]:leading-none",
                "[&_p]:tracking-[-0.3px]",
                "md:[&_p]:text-[64px]",
                "md:[&_p]:leading-none",
                "lg:[&_p]:text-[96px]",
                "lg:[&_p]:leading-none",
                "lg:[&_p]:tracking-[-0.4px]",
                "dark:[&_p:first-of-type]:text-[#efefefb3] [&_p:first-of-type]:text-black/70",
                "dark:[&_p:last-of-type]:text-white [&_p:last-of-type]:text-black",
              )}
            />
          </div>

          {subheading ? (
            <RevealOnScroll
              as="p"
              className="max-w-170 font-funnel text-[18px] leading-normal text-foreground"
              delay={0.15}
            >
              {subheading}
            </RevealOnScroll>
          ) : null}

          {stats && stats.length > 0 ? (
            <RevealOnScroll
              as="div"
              className="mt-auto flex w-full flex-col border-t border-black/10 pt-3 dark:border-white/20"
              stagger={0.08}
              delay={0.25}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
                {stats.map((stat, index) => (
                  <div key={`stat-${index}`} className="contents">
                    {index > 0 ? (
                      <div
                        aria-hidden="true"
                        className="hidden md:block md:w-px md:self-stretch md:bg-black/10 dark:md:bg-white/20"
                      />
                    ) : null}
                    <StatCard stat={stat} />
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          ) : null}
        </div>

        {featured ? (
          <RevealOnScroll
            as="div"
            className="relative px-3 pb-6 pt-0 flex flex-col items-stretch md:px-6 lg:absolute lg:bottom-3 lg:left-auto lg:right-0 lg:pb-0 lg:pt-0 lg:items-end lg:px-8 xl:px-10"
            delay={0.35}
          >
            <FeaturedReferenceCard item={featured} variant="sidebar" />
          </RevealOnScroll>
        ) : null}
      </div>
    </section>
  );
}

function FeaturedReferenceCard({
  item,
}: {
  item: NonNullable<PageHeroData["featured"]>;
  variant?: "inline" | "sidebar";
}) {
  const slug =
    typeof item.slug === "string" ? item.slug : item.slug?.current ?? "";
  const href =
    item._type === "project"
      ? slug
        ? `/portfolio/${slug}`
        : "/portfolio"
      : slug
        ? `/insights/${slug}`
        : "/insights";
  const isProject = item._type === "project";
  const label = formatCategory(item.category);
  const title = isProject ? item.tagline || item.client : item.title;
  const description = isProject ? item.industry : item.excerpt;
  const ctaLabel = isProject ? "Read case study" : "Read insight";
  const metaTitle = isProject ? item.client : item.author?.name;
  const metaLine = isProject
    ? [item.year, item.category].filter(Boolean).join(" | ")
    : [formatMonthYear(item.publishedAt), formatReadTime(item.readTime)]
        .filter(Boolean)
        .join(" | ");

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkTheme = resolvedTheme === "dark";
  const buttonColor = mounted && isDarkTheme
    ? "#EFEFEF"
    : "#040404";

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col w-full lg:max-w-3/4 gap-6 bg-[#EFEFEFB3] dark:bg-[#040404] border border-white/20 p-4 text-[#efefef] transition-transform duration-300 ease-out hover:-translate-y-1 hover:border-brand/40",
        "md:flex-row md:gap-6 md:p-6"
      )}
    >
      <div className="relative flex aspect-square overflow-hidden w-full md:w-57">
        {item.cover ? (
          <>
            <Image
              src={item.cover}
              alt={title || ctaLabel}
              fill
              className="absolute inset-0 object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-b from-[#c1c9c5] from-35% to-[#ff4100] mix-blend-multiply" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "#040404",
              backgroundImage: FALLBACK_PATTERN,
              backgroundSize: "18px 18px, 24px 24px, 30px 30px, auto",
              backgroundPosition: "0 0, 0 0, 0 0, 0 0",
            }}
          />
        )}

        <div className="relative mt-auto w-full p-2">
          <div className="bg-[rgba(255,65,0,0.3)] p-2">
            <p className="font-funnel text-[14px] leading-[1.2] tracking-[-0.5px] text-[#efefef]">
              {metaTitle ? <span className="block">{metaTitle}</span> : null}
              {metaLine ? <span className="block">{metaLine}</span> : null}
            </p>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-6 py-2 md:gap-8">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3">
            {label ? (
              <Badge text={label} />
            ) : null}

            {title ? (
              <p className="font-funnel text-[28px] leading-[1.15] tracking-[-0.84px] dark:text-[#efefef] text-[#040404] md:text-4xl md:tracking-[-1px]">
                {title}
              </p>
            ) : null}
          </div>

          {description ? (
            <p className="max-w-[40ch] capitalize font-funnel text-[17px] leading-[1.55] dark:text-[#efefef]/70 text-[#040404] md:text-[18px] md:leading-normal">
              {description}
            </p>
          ) : null}
        </div>

        <div className="inline-flex items-center gap-3 text-[#efefef] dark:text-[#efefef]">
          <ThirdButton label={ctaLabel} />
        </div>
      </div>
    </Link>
  );
}

function formatCategory(value?: string | {title?: string | null} | null) {
  if (!value) {
    return null;
  }
  // Handle new object format from Sanity reference
  if (typeof value === 'object' && value.title) {
    return value.title;
  }
  // Handle old string format (slug)
  if (typeof value === 'string') {
    return value
      .split("-")
      .map((segment) => segment.toUpperCase())
      .join(" ");
  }
  return null;
}

function formatMonthYear(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatReadTime(value?: number | null) {
  if (!value) {
    return null;
  }

  return `${value} min read`;
}

function StatCard({ stat }: { stat: PageHeroStat }) {
  const displayValue = stat.value ?? (stat.number !== undefined ? `${stat.number}${stat.suffix ?? ""}` : undefined);
  const label = stat.label;

  if (!displayValue && !label) {
    return null;
  }

  return (
    <article className="flex min-h-30 flex-1 flex-col justify-between gap-4 border border-black/10 bg-black/4 p-6 transition-colors duration-300 hover:border-brand dark:border-white/20 dark:bg-[#0f0f0f] dark:hover:border-brand">
      {displayValue ? (
        <p className="font-betatron text-[28px] leading-[1.2] text-brand md:text-4xl">
          {displayValue}
        </p>
      ) : null}

      {label ? (
        <p className="font-funnel text-[22px] font-bold leading-[1.2] text-foreground md:text-100">
          {label}
        </p>
      ) : null}
    </article>
  );
}

