"use client";

import { cn } from "@/lib/utils";
import { HeroBrandDotsBackground } from "@/components/partials/HeroBrandDotsBackground";
import ArrowRightPixel from "@/components/icons/ArrowRightPixel";
import { HeroStats, type HeroStat } from "@/components/sections/contact/HeroStats";
import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "next-themes";

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

export type HeadingShape =
  | string
  | {
      faded?: string | null;
      bold?: string | null;
      trailing?: string | null;
      regular?: string | null;
    };

export type PageHeroData = {
  eyebrow?: string;
  headingType?: 'simple' | 'multipart';
  heading?: string;
  headingMultipart?: {
    faded?: string | null;
    bold?: string | null;
    trailing?: string | null;
    regular?: string | null;
  };
  subheading?: string;
  stats?: HeroStat[];
  featured?: {
    _type?: "post" | "project";
    _id?: string;
    slug?: string | { current?: string | null } | null;
    cover?: string | null;
    category?: string | null;
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
  
  // Determine heading shape based on headingType
  let heading: HeadingShape;
  if (cleanData?.headingType === 'multipart' && cleanData?.headingMultipart) {
    heading = cleanData.headingMultipart;
  } else {
    heading = cleanData?.heading || '';
  }

  // Get stats
  const stats = cleanData?.stats;
  const featured = cleanData?.featured;

  return (
    <section
      className={cn(
        "has-hero-pattern relative isolate flex min-h-[calc(100svh-4rem)] w-full flex-col overflow-hidden border-b border-border bg-white dark:bg-background"
      )}
    >
      <HeroBrandDotsBackground />

      <div className="relative flex flex-1 flex-col justify-center gap-10 px-6 py-8 md:gap-14 md:px-6 md:py-12 lg:px-8 lg:py-28 xl:px-12 xl:py-16 2xl:px-16 2xl:py-20">
        {eyebrow ? (
          <p className="font-betatron text-[32px] leading-[1.2] uppercase text-brand">
            {eyebrow}
          </p>
        ) : null}

        <SplitTextReveal as="h1" className="block">
          <Heading value={heading} />
        </SplitTextReveal>

        {subheading ? (
          <RevealOnScroll
            as="p"
            className="max-w-[683px] font-funnel text-[18px] leading-normal text-foreground"
            delay={0.15}
          >
            {subheading}
          </RevealOnScroll>
        ) : null}

        <HeroStats stats={stats} delay={0.25} />

        {featured ? (
          <RevealOnScroll
            as="div"
            className="w-full md:ml-auto md:w-[calc(100%-210px)] lg:w-[calc(100%-280px)] xl:w-[calc(100%-360px)] 2xl:w-[calc(100%-480px)]"
            delay={0.35}
          >
            <FeaturedReferenceCard item={featured} />
          </RevealOnScroll>
        ) : null}
      </div>
    </section>
  );
}

function Heading({ value }: { value: HeadingShape }) {
  const base =
    "font-funnel text-[52px] capitalize leading-[1.08] tracking-[-0.6px] text-foreground sm:text-[60px] md:text-[72px] md:tracking-[-0.8px] lg:text-[96px] lg:leading-[1.2] lg:tracking-[-1px]";

  if (typeof value === "string") {
    return <span className={base}>{value}</span>;
  }

  const { faded, bold, trailing, regular } = value;
  return (
    <span className={base}>
      {faded ? <span className="text-foreground/70">{faded} </span> : null}
      {regular ? <span>{regular} </span> : null}
      {bold ? <span className="font-bold">{bold}</span> : null}
      {trailing ? (
        <>
          <br />
          <span className="text-foreground/70">{trailing}</span>
        </>
      ) : null}
    </span>
  );
}

function FeaturedReferenceCard({
  item,
}: {
  item: NonNullable<PageHeroData["featured"]>;
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
  const isDarkTheme = resolvedTheme === "dark";
    const buttonColor = isDarkTheme
    ? "#EFEFEF"
    : "#040404";

  return (
    <Link
      href={href}
      className={cn(
        "group relative ml-auto flex w-full flex-col gap-6 bg-[#EFEFEFB3] dark:bg-[#040404] border border-white/20 bg-[#0f0f0f] p-4 text-[#efefef] transition-transform duration-300 ease-out hover:-translate-y-1 hover:border-brand/40",
        "md:flex-row md:items-stretch md:gap-6 md:p-6"
      )}
    >
      <div className="relative flex aspect-square w-full overflow-hidden md:w-[227px] md:min-w-[227px]">
        {item.cover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.cover}
              alt={title || ctaLabel}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#c1c9c5] from-[35%] to-[#ff4100] mix-blend-multiply" />
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
              <span className="self-start bg-[rgba(255,65,0,0.3)] text-black px-2 py-1 font-funnel text-[14px] uppercase leading-[1.2] tracking-[-0.2px] dark:text-[#efefef] md:px-2.5 md:py-1.5 md:text-[18px] md:leading-[1.5]">
                {label}
              </span>
            ) : null}

            {title ? (
              <p className="max-w-[18ch] font-funnel text-[28px] leading-[1.15] tracking-[-0.84px] dark:text-[#efefef] text-[#040404] md:text-[32px] md:tracking-[-1px]">
                {title}
              </p>
            ) : null}
          </div>

          {description ? (
            <p className="max-w-[40ch] capitalize font-funnel text-[17px] leading-[1.55] dark:text-[#efefef]/70 text-[#040404] md:text-[18px] md:leading-[1.5]">
              {description}
            </p>
          ) : null}
        </div>

        <div className="inline-flex items-center gap-3 text-[#efefef] dark:text-[#efefef]">
          <ArrowRightPixel
            color={buttonColor}
            width={39}
            height={24}
            className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
          />
          <span className="font-funnel text-[24px] font-bold dark:text-[#efefef] text-[#040404] leading-[1.2]">
            {ctaLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}

function formatCategory(value?: string | null) {
  if (!value) {
    return null;
  }

  return value
    .split("-")
    .map((segment) => segment.toUpperCase())
    .join(" ");
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
