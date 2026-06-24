"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FilterButton from "@/components/partials/FilterButton";
import { CaseStudyCard, type CaseStudyCardData } from "@/components/partials/CaseStudyCard";
import { cleanStega } from "@/sanity/lib/utils";

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
const LOAD_MORE_ROOT_MARGIN = "1400px 0px";
const CARD_REVEAL_ROOT_MARGIN = "0px 0px -12% 0px";
const CARD_REVEAL_THRESHOLD = 0.2;

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
  const preloadItems = normalizedItems.slice(visibleCount, visibleCount + LOAD_MORE_COUNT);

  const [activeCards, setActiveCards] = useState<boolean[]>(() =>
    new Array(INITIAL_VISIBLE_ITEMS).fill(true)
  );
  const observersRef = useRef<Map<number, IntersectionObserver>>(new Map());
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isLoadingMoreRef = useRef(false);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    setVisibleCount((count) => Math.min(count + LOAD_MORE_COUNT, normalizedItems.length));
  }, [hasMore, normalizedItems.length]);

  useEffect(() => {
    isLoadingMoreRef.current = false;
  }, [visibleItems.length]);

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: LOAD_MORE_ROOT_MARGIN }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

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
      { rootMargin: CARD_REVEAL_ROOT_MARGIN, threshold: CARD_REVEAL_THRESHOLD },
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
    const observers = observersRef.current;
    return () => {
      observers.forEach((o) => o.disconnect());
      observers.clear();
    };
  }, [serviceFiltersSelected, industryFiltersSelected]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col border-y border-black/20 dark:border-white/20 md:flex-row md:w-full bg-white dark:bg-dark">
        <aside className="border-b border-black/20 dark:border-white/20 md:sticky md:top-16 lg:top-20 md:w-1/4 md:flex-none md:self-start md:border-b-0 px-5 py-6 md:pl-6 2xl:pl-30 md:pr-5 md:py-0 md:pt-12">
          <div className="flex flex-col gap-6 md:gap-5 lg:gap-10 lg:pb-6">
            {serviceFilters.length > 0 && (
              <div className="flex flex-col gap-4.5">
                <p className="font-clash uppercase text-[24px] leading-[1.2] text-black dark:text-[#efefef] lg:text-3xl">
                  Service
                </p>
                <div className="flex lg:-ml-2.5 flex-wrap gap-3">
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
                <p className="font-clash uppercase text-[24px] leading-[1.2] text-black dark:text-[#efefef] lg:text-3xl">
                  Industry
                </p>
                <div className="flex lg:-ml-2.5 flex-wrap gap-3">
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
              <div
                key={`${serviceFiltersSelected.join(',')}-${industryFiltersSelected.join(',')}`}
                className="flex flex-col gap-4"
              >
                {visibleItems.map((item, idx) => (
                  <div
                    key={`${item._id ?? item.client ?? "item"}-${idx}`}
                    className={`transition-all duration-500 ease-out ${
                      activeCards[idx]
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-6"
                    }`}
                    style={{ transitionDelay: `${(idx % LOAD_MORE_COUNT) * 60}ms` }}
                  >
                    <CaseStudyCard
                      ref={(el) => attachRef(el, idx)}
                      item={item as CaseStudyCardData}
                      isActive={activeCards[idx] ?? false}
                    />
                  </div>
                ))}
              </div>

              {preloadItems.length > 0 && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none overflow-hidden"
                  style={{ height: 0, visibility: "hidden" }}
                >
                  {preloadItems.map((item, idx) => (
                    <CaseStudyCard
                      key={`preload-${item._id ?? item.client ?? "item"}-${idx}`}
                      item={item as CaseStudyCardData}
                      isActive={false}
                    />
                  ))}
                </div>
              )}

              {hasMore && (
                <div
                  ref={loadMoreRef}
                  className="flex justify-center py-8"
                  aria-hidden="true"
                />
              )}
            </div>
          )}
        </div>
    </div>
  );
}
