import { HeroBrandDotsBackground } from "@/components/partials/HeroBrandDotsBackground";
import { cn } from "@/lib/utils";
import type { DereferencedLink } from "@/sanity/lib/types";
import { cleanStega, linkResolver } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";
import { Button } from "@/components/partials/Button";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    )
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

  type BreadcrumbItem = { label: string; href?: string };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: rootLabel, href: "/services" },
    categoryLabel
      ? {
          label: categoryLabel,
          href: getCategoryHref(cleanData?.serviceCategory),
        }
      : null,
    currentLabel ? { label: currentLabel } : null,
  ].filter((item): item is BreadcrumbItem => Boolean(item?.label));

  return (
    <section
      id="service-hero"
      className="has-hero-pattern relative isolate flex min-h-[calc(100dvh-4rem)] md:h-[calc(100dvh-4rem)] w-full flex-col bg-transparent"
    >

      <div className="relative flex flex-col gap-6 pt-6 md:h-full md:justify-between md:gap-8 md:pt-8 lg:gap-10 lg:pt-12 overflow-hidden">
        <div className="xl:px-16 2xl:px-30 lg:px-16 md:px-8 px-6 md:gap-5 gap-3 flex flex-col">
          {breadcrumbItems.length > 0 ? (
            <RevealOnScroll
              as="div"
              className="flex flex-wrap items-center gap-x-3 gap-y-1 font-funnel text-64 leading-normal text-foreground/70 md:text-[18px]"
            >
              {breadcrumbItems.map((item, index) => {
                const isCurrent = index === breadcrumbItems.length - 1;
                const content = (
                  <span className={cn(isCurrent ? "text-brand" : "text-black dark:text-white")}>
                    {item.label}
                  </span>
                );

                return (
                  <div key={`${item.label}-${index}`} className="contents">
                    {index > 0 ? (
                      <span className={cn(isCurrent ? "text-brand" : "text-black dark:text-white")}>
                        /
                      </span>
                    ) : null}
                    {item.href && !isCurrent ? (
                      <Link
                        href={item.href}
                        className="transition-colors hover:text-brand"
                      >
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </div>
                );
              })}
            </RevealOnScroll>
          ) : null}

          <div className="flex flex-col gap-3 md:gap-4 lg:gap-5">
            <div className="flex flex-col gap-0">
              <RevealOnScroll
                as="p"
                className="font-betatron text-[20px] md:text-[24px] lg:text-[28px] leading-[1.2] text-brand"
              >
                {eyebrow}
              </RevealOnScroll>

              {resolvedHeadlineLines.length > 0 ? (
                <RevealOnScroll
                  as="h1"
                  className="font-funnel text-[64px]! leading-none tracking-[-0.8px] text-foreground md:text-[32px] md:tracking-[-0.9px] lg:text-[48px] xl:text-[72px] 2xl:text-[96px] lg:tracking-[-1px]"
                >
                  {resolvedHeadlineLines.map((line, index) => (
                    <span key={`${line}-${index}`} className="block">
                      {line}
                    </span>
                  ))}
                </RevealOnScroll>
              ) : null}
            </div>

            {description ? (
              <RevealOnScroll
                as="p"
                className="max-w-170 font-funnel text-[14px] md:text-[16px] lg:text-[18px] leading-normal text-foreground/80 line-clamp-3 md:line-clamp-4"
              >
                {description}
              </RevealOnScroll>
            ) : null}
          </div>
        </div>

        <div className="relative w-full pb-3 px-6 lg:px-12 border-t border-black/10 dark:border-white/20">
          {railItems.length > 0 ? (
            <RevealOnScroll
              as="div"
              className="flex w-full flex-col"
              stagger={0.08}
            >
              <div className="flex flex-col gap-2 md:gap-3 md:flex-row md:items-stretch p-3">
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
                    ) : (() => {
                      const resolvedHref = item.cta.link ? linkResolver(item.cta.link) : null;
                      return resolvedHref ? (
                        <Button
                          href={resolvedHref}
                          target={item.cta.link?.openInNewTab ? "_blank" : undefined}
                          rel={item.cta.link?.openInNewTab ? "noopener noreferrer" : undefined}
                          variant="primary"
                          className="min-h-14 md:min-h-16 lg:min-h-20 flex-1 md:text-sm"
                        >
                          {item.cta.buttonText}
                        </Button>
                      ) : (
                        <Button variant="primary" className="min-h-14 md:min-h-16 lg:min-h-20 flex-1 md:text-sm">
                          {item.cta.buttonText}
                        </Button>
                      );
                    })()}
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function useScrambleText(text: string | undefined, duration = 2000) {
  const [displayText, setDisplayText] = useState(text || "");
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!text || hasStarted) return;

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [text, hasStarted]);

  useEffect(() => {
    if (!text || !hasStarted) {
      setDisplayText(text || "");
      return;
    }

    const targetText = text;
    const iterations = 20;
    const intervalTime = duration / iterations;
    let currentIteration = 0;

    const interval = setInterval(() => {
      currentIteration++;

      if (currentIteration >= iterations) {
        setDisplayText(targetText);
        clearInterval(interval);
        return;
      }

      const progress = currentIteration / iterations;
      const revealedLength = Math.floor(progress * targetText.length);

      let result = targetText.substring(0, revealedLength);

      for (let i = revealedLength; i < targetText.length; i++) {
        if (targetText[i] === " ") {
          result += " ";
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }

      setDisplayText(result);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [text, hasStarted, duration]);

  return { displayText, elementRef };
}

function ScrambleText({
  text,
  className,
}: {
  text: string | undefined;
  className?: string;
}) {
  const { displayText, elementRef } = useScrambleText(text, 2000);

  return (
    <p ref={elementRef} className={className}>
      {displayText}
    </p>
  );
}

function HighlightCard({ card }: { card: ServiceHeroHighlight }) {
  const value = asTrimmedString(card.value);
  const label = asTrimmedString(card.label);

  if (!value && !label) {
    return null;
  }

  return (
    <article className="flex min-h-14 md:min-h-16 lg:min-h-20 flex-1 flex-col justify-between gap-1 md:gap-2 border border-black/10 bg-black/4 p-2 md:p-3 lg:p-4 dark:border-white/20 dark:bg-[#0f0f0f]">
      {value ? (
        <ScrambleText
          text={value}
          className="font-betatron text-[20px] md:text-[24px] lg:text-[28px] leading-[1.2] text-brand"
        />
      ) : null}

      {label ? (
        <p className="font-funnel text-[16px] md:text-[18px] lg:text-[22px] font-bold leading-[1.2] text-foreground">
          {label}
        </p>
      ) : null}
    </article>
  );
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

function getCategoryHref(category?: string): string | undefined {
  const normalizedValue = asTrimmedString(category);

  if (!normalizedValue) {
    return undefined;
  }

  const normalized = normalizedValue.toLowerCase();

  if (normalized === "ai") {
    return "/services#ai-services";
  }

  if (normalized === "engineering") {
    return "/services#engineering-services";
  }

  return "/services";
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
