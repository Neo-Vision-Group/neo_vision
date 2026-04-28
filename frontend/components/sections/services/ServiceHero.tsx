import ArrowRightPixel from "@/components/icons/ArrowRightPixel";
import ResolvedLink from "@/components/ResolvedLink";
import { HeroBrandDotsBackground } from "@/components/partials/HeroBrandDotsBackground";
import { cn } from "@/lib/utils";
import type { DereferencedLink } from "@/sanity/lib/types";
import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  { ssr: false }
);

type ServiceHeroBreadcrumb = {
  rootLabel?: string;
  categoryLabel?: string;
  currentLabel?: string;
};

type ServiceHeroHighlight = {
  _key?: string;
  value?: string;
  label?: string;
};

type ServiceHeroCta = {
  buttonText?: string;
  link?: DereferencedLink | null;
};

export type ServiceHeroData = {
  breadcrumb?: ServiceHeroBreadcrumb;
  eyebrow?: string;
  headlineLines?: string[];
  description?: string;
  cta?: ServiceHeroCta;
  leadingHighlights?: ServiceHeroHighlight[];
  trailingHighlights?: ServiceHeroHighlight[];
  serviceName?: string;
  serviceCategory?: string;
  serviceDescription?: string;
  servicePrice?: string;
  serviceDuration?: string;
};

type RailItem =
  | { kind: "highlight"; key: string; card: ServiceHeroHighlight }
  | { kind: "cta"; key: string; cta: ServiceHeroCta };

export function ServiceHero({ data }: { data?: ServiceHeroData }) {
  const cleanData = data ? cleanStega(data) : data;

  const serviceName = asTrimmedString(cleanData?.serviceName);
  const categoryLabel =
    asTrimmedString(cleanData?.breadcrumb?.categoryLabel) ||
    formatCategoryLabel(cleanData?.serviceCategory);
  const currentLabel =
    asTrimmedString(cleanData?.breadcrumb?.currentLabel) || serviceName || undefined;
  const rootLabel = asTrimmedString(cleanData?.breadcrumb?.rootLabel) || "Services";
  const eyebrow =
    asTrimmedString(cleanData?.eyebrow) || categoryLabel?.toUpperCase() || "SERVICE";
  const headlineLines = toTrimmedStrings(cleanData?.headlineLines);
  const resolvedHeadlineLines =
    headlineLines.length > 0 ? headlineLines : serviceName ? [serviceName] : [];
  const description =
    asTrimmedString(cleanData?.description) ||
    asTrimmedString(cleanData?.serviceDescription) ||
    undefined;

  const leadingHighlights = getHighlights(cleanData?.leadingHighlights);
  const trailingHighlights = getHighlights(cleanData?.trailingHighlights);
  const fallbackLeadingHighlights: ServiceHeroHighlight[] = [];

  if (asTrimmedString(cleanData?.servicePrice)) {
    fallbackLeadingHighlights.push({
      value: asTrimmedString(cleanData?.servicePrice),
      label: "Starting at",
    });
  }

  if (asTrimmedString(cleanData?.serviceDuration)) {
    fallbackLeadingHighlights.push({
      value: asTrimmedString(cleanData?.serviceDuration),
      label: "Timeline",
    });
  }

  const resolvedLeadingHighlights =
    leadingHighlights.length > 0 ? leadingHighlights : fallbackLeadingHighlights;

  const railItems: RailItem[] = [
    ...resolvedLeadingHighlights.map((card, index) => ({
      kind: "highlight" as const,
      key: card._key ?? `leading-${index}`,
      card,
    })),
    ...(asTrimmedString(cleanData?.cta?.buttonText)
      ? [{ kind: "cta" as const, key: "cta", cta: cleanData?.cta ?? {} }]
      : []),
    ...trailingHighlights.map((card, index) => ({
      kind: "highlight" as const,
      key: card._key ?? `trailing-${index}`,
      card,
    })),
  ];

  if (
    !resolvedHeadlineLines.length &&
    !description &&
    !railItems.length &&
    !eyebrow &&
    !currentLabel
  ) {
    return null;
  }

  const breadcrumbSegments = [rootLabel, categoryLabel, currentLabel].filter(
    (segment): segment is string => Boolean(segment)
  );

  return (
    <section
      id="service-hero"
      className="has-hero-pattern relative isolate flex min-h-[calc(100svh-4rem)] w-full flex-col overflow-hidden border-b border-black/10 bg-white dark:border-white/20 dark:bg-background"
    >
      <HeroBrandDotsBackground />

      <div className="relative flex flex-1 flex-col gap-10 px-6 pb-6 pt-24 md:gap-12 md:px-8 md:pb-8 md:pt-28 lg:px-12 lg:pb-10 lg:pt-32 xl:px-12 2xl:px-16">
        {breadcrumbSegments.length > 0 ? (
          <RevealOnScroll
            as="div"
            className="flex flex-wrap items-center gap-x-3 gap-y-1 font-funnel text-64 leading-normal text-foreground/70 md:text-[18px]"
          >
            {breadcrumbSegments.map((segment, index) => {
              const isCurrent = index === breadcrumbSegments.length - 1;

              return (
                <div key={`${segment}-${index}`} className="contents">
                  {index > 0 ? (
                    <span className={cn(isCurrent ? "text-brand" : "text-black dark:text-white")}>
                      /
                    </span>
                  ) : null}
                  <span className={cn(isCurrent ? "text-brand" : "text-black dark:text-white")}>
                    {segment}
                  </span>
                </div>
              );
            })}
          </RevealOnScroll>
        ) : null}

        <div className="flex flex-col gap-6 md:gap-8">
          <RevealOnScroll
            as="p"
            className="font-betatron text-[28px] leading-[1.2] text-brand md:text-4xl"
          >
            {eyebrow}
          </RevealOnScroll>

          {resolvedHeadlineLines.length > 0 ? (
            <RevealOnScroll
              as="h1"
              className="font-funnel text-[52px] leading-none tracking-[-0.8px] text-foreground md:text-[72px] md:tracking-[-0.9px] lg:text-[96px] lg:tracking-[-1px]"
            >
              {resolvedHeadlineLines.map((line, index) => (
                <span key={`${line}-${index}`} className="block">
                  {line}
                </span>
              ))}
            </RevealOnScroll>
          ) : null}

          {description ? (
            <RevealOnScroll
              as="p"
              className="max-w-170 font-funnel text-[18px] leading-normal text-foreground/80"
            >
              {description}
            </RevealOnScroll>
          ) : null}
        </div>

        {railItems.length > 0 ? (
          <RevealOnScroll
            as="div"
            className="mt-auto flex w-full flex-col border-t border-black/10 pt-3 dark:border-white/20"
            stagger={0.08}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
              {railItems.map((item, index) => (
                <div key={item.key} className="contents">
                  {index > 0 ? (
                    <div
                      aria-hidden="true"
                      className="hidden md:block md:w-px md:self-stretch md:bg-black/10 dark:md:bg-white/20"
                    />
                  ) : null}

                  {item.kind === "highlight" ? (
                    <HighlightCard card={item.card} />
                  ) : (
                    <HeroCta cta={item.cta} />
                  )}
                </div>
              ))}
            </div>
          </RevealOnScroll>
        ) : null}
      </div>
    </section>
  );
}

function HighlightCard({ card }: { card: ServiceHeroHighlight }) {
  const value = asTrimmedString(card.value);
  const label = asTrimmedString(card.label);

  if (!value && !label) {
    return null;
  }

  return (
    <article className="flex min-h-30 flex-1 flex-col justify-between gap-4 border border-black/10 bg-black/4 p-6 dark:border-white/20 dark:bg-[#0f0f0f]">
      {value ? (
        <p className="font-betatron text-[28px] leading-[1.2] text-brand md:text-4xl">
          {value}
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

function HeroCta({ cta }: { cta: ServiceHeroCta }) {
  const label = asTrimmedString(cta.buttonText);

  if (!label) {
    return null;
  }

  const content = (
    <>
      <span className="font-funnel text-[18px] leading-normal text-white">
        {label}
      </span>
      <ArrowRightPixel
        color="white"
        width={38}
        height={24}
        className="h-6 w-10 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
      />
    </>
  );

  const className =
    "group flex min-h-30 items-center justify-between gap-6 bg-brand px-6 py-5 transition-colors duration-200 hover:bg-brand-hover md:min-h-0 md:min-w-65";

  if (cta.link) {
    return (
      <ResolvedLink link={cta.link} className={className}>
        {content}
      </ResolvedLink>
    );
  }

  return <div className={className}>{content}</div>;
}

function getHighlights(items?: ServiceHeroHighlight[]) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      _key: asTrimmedString(item?._key),
      value: asTrimmedString(item?.value),
      label: asTrimmedString(item?.label),
    }))
    .filter((item) => Boolean(item.value || item.label));
}

function formatCategoryLabel(value?: string) {
  const normalizedValue = asTrimmedString(value);

  if (!normalizedValue) {
    return undefined;
  }

  const normalized = normalizedValue.toLowerCase();

  if (normalized === "ai") {
    return "AI Transformation";
  }

  if (normalized === "engineering") {
    return "Engineering";
  }

  if (normalized === "strategy") {
    return "Strategy";
  }

  return normalized
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function asTrimmedString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

function toTrimmedStrings(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => asTrimmedString(item))
    .filter((item): item is string => Boolean(item));
}
