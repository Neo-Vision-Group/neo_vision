"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatedBorder } from "@/components/AnimatedBorder";
import { CaseStudyCard, type CaseStudyCardData } from "@/components/partials/CaseStudyCard";
import { Button } from "@/components/partials/Button";
import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  { ssr: false }
);

export type PortfolioGridData = {
  items?: Array<{
    _id?: string;
    client?: string;
    slug?: string | { current?: string };
    year?: string;
    category?: string | null;
    industry?: string | null;
    tagline?: string;
    metric?: string;
    metricLabel?: string;
    thumb?: string;
  }>;
};

const EMPTY_ITEMS: NonNullable<PortfolioGridData["items"]> = [];
const INITIAL_VISIBLE_ITEMS = 3;
const LOAD_MORE_COUNT = 3;

function FilterButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`relative inline-flex items-center justify-start text-left border border-transparent bg-surface lg:px-2.5 py-2 font-funnel text-[18px] leading-[1.2] transition-colors md:text-[18px] lg:text-[18px] md:leading-normal ${
        isActive
          ? "bg-brand/30 text-black dark:text-[#efefef]"
          : "text-black/85 hover:text-black dark:text-[#efefef]/85 dark:hover:text-[#efefef]"
      }`}
    >
      <AnimatedBorder isHovered={isActive || isHovered} />
      <span className="relative z-10 uppercase">{label}</span>
    </button>
  );
}

function extractUniqueFilters(
  items: PortfolioGridData["items"],
  key: "category" | "industry"
): Array<{ label: string; value: string }> {
  const unique = new Map<string, string>();
  items?.forEach((item) => {
    const value = item?.[key];
    if (value && typeof value === "string") {
      unique.set(value.toLowerCase(), value);
    }
  });
  const sorted = Array.from(unique.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  return sorted.map(([value, label]) => ({ label, value }));
}

export function PortfolioGrid({ data }: { data?: PortfolioGridData }) {
  const cleanData = data ? cleanStega(data) : data;

  const items = useMemo(() => cleanData?.items ?? EMPTY_ITEMS, [cleanData]);
  const itemCount = items.length;

  const serviceFilters = useMemo(() => extractUniqueFilters(items, "category"), [items]);
  const industryFilters = useMemo(() => extractUniqueFilters(items, "industry"), [items]);

  const [serviceFiltersSelected, setServiceFiltersSelected] = useState<string[]>([]);
  const [industryFiltersSelected, setIndustryFiltersSelected] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_ITEMS);

  // Reset filters when items change (use count as stable dependency)
  useEffect(() => {
    setServiceFiltersSelected([]);
    setIndustryFiltersSelected([]);
    setVisibleCount(INITIAL_VISIBLE_ITEMS);
  }, [itemCount]);

  const toggleServiceFilter = (value: string) => {
    setServiceFiltersSelected((prev) => {
      const exists = prev.includes(value);
      const next = exists ? prev.filter((v) => v !== value) : [...prev, value];
      return next;
    });
    setVisibleCount(INITIAL_VISIBLE_ITEMS);
  };

  const toggleIndustryFilter = (value: string) => {
    setIndustryFiltersSelected((prev) => {
      const exists = prev.includes(value);
      const next = exists ? prev.filter((v) => v !== value) : [...prev, value];
      return next;
    });
    setVisibleCount(INITIAL_VISIBLE_ITEMS);
  };

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesService =
        serviceFiltersSelected.length === 0 ||
        (item.category && serviceFiltersSelected.includes(item.category.toLowerCase()));
      const matchesIndustry =
        industryFiltersSelected.length === 0 ||
        (item.industry && industryFiltersSelected.includes(item.industry.toLowerCase()));
      return matchesService && matchesIndustry;
    });
  }, [items, serviceFiltersSelected, industryFiltersSelected]);

  const normalizedItems = useMemo(
    () =>
      filtered.map((item) => ({
        ...item,
        slug: typeof item.slug === "string" ? item.slug : item.slug?.current ?? "",
      })),
    [filtered]
  );

  const visibleItems = normalizedItems.slice(0, visibleCount);
  const hasMore = normalizedItems.length > visibleCount;

  const [activeCards, setActiveCards] = useState<boolean[]>([]);
  const observersRef = useRef<Map<number, IntersectionObserver>>(new Map());

  const attachRef = (el: HTMLAnchorElement | null, idx: number) => {
    const existing = observersRef.current.get(idx);
    if (existing) {
      existing.disconnect();
      observersRef.current.delete(idx);
    }
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveCards((prev) => {
            if (prev[idx]) return prev;
            const next = [...prev];
            next[idx] = true;
            return next;
          });
          observer.disconnect();
          observersRef.current.delete(idx);
        }
      },
      { threshold: 1 },
    );
    observer.observe(el);
    observersRef.current.set(idx, observer);
  };

  useEffect(() => {
    setActiveCards((prev) => {
      if (prev.length === visibleItems.length) return prev;
      const next = new Array(visibleItems.length).fill(false);
      for (let i = 0; i < prev.length && i < next.length; i++) {
        next[i] = prev[i];
      }
      return next;
    });
  }, [visibleItems.length]);

  useEffect(() => {
    return () => {
      observersRef.current.forEach((o) => o.disconnect());
      observersRef.current.clear();
    };
  }, [serviceFiltersSelected, industryFiltersSelected]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col border-y border-black/20 dark:border-white/20 md:flex-row md:w-full bg-white dark:bg-dark">
        <aside className="border-b border-black/20 dark:border-white/20 md:sticky md:w-1/4 md:flex-none md:self-start md:border-b-0 px-5 py-6 md:pl-6 2xl:pl-30 md:pr-5 md:py-0 md:pt-12">
          <div className="flex flex-col gap-6 md:gap-5 lg:gap-10 lg:pb-6">
            {serviceFilters.length > 0 && (
              <div className="flex flex-col gap-4.5">
                <p className="font-clash text-[24px] leading-[1.2] text-black dark:text-[#efefef] lg:text-3xl">
                  Service:
                </p>
                <div className="flex flex-wrap gap-2 lg:gap-5">
                  {serviceFilters.map((filter) => (
                    <FilterButton
                      key={filter.value ?? filter.label}
                      label={filter.label ?? "All"}
                      isActive={serviceFiltersSelected.includes(filter.value.toLowerCase())}
                      onClick={() => toggleServiceFilter(filter.value.toLowerCase())}
                    />
                  ))}
                </div>
              </div>
            )}

            {industryFilters.length > 0 && (
              <div className="flex flex-col gap-4.5">
                <p className="font-clash text-[24px] leading-[1.2] text-black dark:text-[#efefef] lg:text-3xl">
                  Industry:
                </p>
                <div className="flex flex-wrap gap-2 lg:gap-5">
                  {industryFilters.map((filter) => (
                    <FilterButton
                      key={filter.value ?? filter.label}
                      label={filter.label ?? "All"}
                      isActive={industryFiltersSelected.includes(filter.value.toLowerCase())}
                      onClick={() => toggleIndustryFilter(filter.value.toLowerCase())}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className="hidden w-px shrink-0 bg-black/20 dark:bg-white/20 md:block" />

        <div className="min-w-0 flex-1 px-4 py-6 md:px-6 md:py-8 lg:px-0 lg:py-0">
          {filtered.length === 0 ? (
            <div className="px-2 py-10 lg:px-6 lg:py-12">
              <p className="text-body text-black/60 dark:text-[#efefef]/60">
                No case studies match this filter. Try a different combination.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 p-0 lg:gap-8 lg:p-12">
              <RevealOnScroll
                key={`${serviceFiltersSelected.join(',')}-${industryFiltersSelected.join(',')}-${visibleCount}`}
                as="div"
                stagger={0.06}
                className="flex flex-col gap-4"
              >
                {visibleItems.map((item, idx) => (
                  <CaseStudyCard
                    key={item._id ?? (item.client || "") + idx}
                    ref={(el) => attachRef(el, idx)}
                    item={item as CaseStudyCardData}
                    isActive={activeCards[idx] ?? false}
                  />
                ))}
              </RevealOnScroll>

              {hasMore ? (
                <div className="flex justify-center pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => setVisibleCount((count) => count + LOAD_MORE_COUNT)}
                    className="min-w-38"
                  >
                    Load more projects
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>
    </div>
  );
}
