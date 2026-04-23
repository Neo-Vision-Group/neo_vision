"use client";

import { useMemo, useState } from "react";
import { CaseStudyCard, type CaseStudyCardData } from "@/components/partials/CaseStudyCard";
import { RevealOnScroll } from "@/components/partials/motion/RevealOnScroll";
import { cleanStega } from "@/sanity/lib/utils";

export type PortfolioGridData = {
  items?: Array<{
    _id?: string;
    client?: string;
    slug?: string | { current?: string };
    year?: string;
    category?: string;
    industry?: string | null;
    tagline?: string;
    metric?: string;
    metricLabel?: string;
    thumb?: string;
  }>;
  serviceFilters?: Array<{ label?: string; value?: string }>;
  industryFilters?: Array<{ label?: string; value?: string }>;
};

function FilterButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-5 py-3 text-body-2 transition-colors ${
        isActive ? "bg-brand/30 text-foreground" : "bg-surface text-foreground/70 hover:text-foreground"
      }`}
    >
      <span className="relative z-10">{label}</span>
      {isActive && (
        <>
          <div className="absolute -left-1 -top-1 h-[calc(100%+8px)] w-px bg-brand" />
          <div className="absolute -right-1 -top-1 h-[calc(100%+8px)] w-px bg-brand" />
          <div className="absolute -left-1 -bottom-1 h-[calc(100%+8px)] w-px bg-brand" />
          <div className="absolute -right-1 -bottom-1 h-[calc(100%+8px)] w-px bg-brand" />
        </>
      )}
    </button>
  );
}

export function PortfolioGrid({ data }: { data?: PortfolioGridData }) {
  const cleanData = data ? cleanStega(data) : data;

  const items = cleanData?.items ?? [];
  const serviceFilters = cleanData?.serviceFilters ?? [];
  const industryFilters = cleanData?.industryFilters ?? [];

  const [serviceFilter, setServiceFilter] = useState(serviceFilters[0]?.value ?? "all");
  const [industryFilter, setIndustryFilter] = useState(industryFilters[0]?.value ?? "all");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesService =
        serviceFilter === "all" ||
        item.category?.toLowerCase().includes(serviceFilter.toLowerCase());
      const matchesIndustry =
        industryFilter === "all" ||
        item.industry?.toLowerCase() === industryFilter.toLowerCase();
      return matchesService && matchesIndustry;
    });
  }, [items, serviceFilter, industryFilter]);

  // Convert slug objects to strings
  const normalizedItems = filtered.map((item) => ({
    ...item,
    slug: typeof item.slug === 'string' ? item.slug : item.slug?.current ?? ''
  }));

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-8">
      {/* Sticky Sidebar with Filters */}
      <aside className="hidden lg:block w-[372px] shrink-0">
        <div className="sticky top-0 pt-24">
          <div className="border-t border-white/20" />
          <div className="flex flex-col gap-12 px-12 py-6">
            {/* Service Filters */}
            {serviceFilters.length > 0 && (
              <div className="flex flex-col gap-5">
                <p className="font-display text-[32px] leading-[1.2] text-foreground">
                  Service:
                </p>
                <div className="flex flex-wrap gap-5">
                  {serviceFilters.map((filter) => (
                    <FilterButton
                      key={filter.value}
                      label={filter.label ?? "All"}
                      isActive={serviceFilter === filter.value}
                      onClick={() => setServiceFilter(filter.value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Industry Filters */}
            {industryFilters.length > 0 && (
              <div className="flex flex-col gap-5">
                <p className="font-display text-[32px] leading-[1.2] text-foreground">
                  Industry:
                </p>
                <div className="flex flex-wrap gap-5">
                  {industryFilters.map((filter) => (
                    <FilterButton
                      key={filter.value}
                      label={filter.label ?? "All"}
                      isActive={industryFilter === filter.value}
                      onClick={() => setIndustryFilter(filter.value)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Mobile Filters */}
        <div className="flex flex-col gap-4 lg:hidden mb-8">
          {serviceFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {serviceFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setServiceFilter(filter.value)}
                  className={`relative text-body-2 transition-colors ${
                    serviceFilter === filter.value
                      ? "bg-brand text-white"
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  <span className="relative z-10 px-4 py-2 inline-block">{filter.label}</span>
                  {serviceFilter === filter.value && (
                    <>
                      <div className="absolute -left-1 -top-0 h-[calc(100%+4px)] w-px bg-brand" />
                      <div className="absolute -right-1 bottom-0 h-[calc(100%+4px)] w-px bg-brand" />
                    </>
                  )}
                </button>
              ))}
            </div>
          )}
          {industryFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {industryFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setIndustryFilter(filter.value)}
                  className={`relative text-body-2 transition-colors ${
                    industryFilter === filter.value
                      ? "bg-brand text-white"
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  <span className="relative z-10 px-4 py-2 inline-block">{filter.label}</span>
                  {industryFilter === filter.value && (
                    <>
                      <div className="absolute -left-1 -top-0 h-[calc(100%+4px)] w-px bg-brand" />
                      <div className="absolute -right-1 bottom-0 h-[calc(100%+4px)] w-px bg-brand" />
                    </>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="text-body text-foreground/60">
            No case studies match this filter. Try a different combination.
          </p>
        ) : (
          <RevealOnScroll
            as="div"
            stagger={0.06}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
          >
            {normalizedItems.map((item, idx) => (
              <CaseStudyCard key={item._id ?? (item.client || '') + idx} item={item as CaseStudyCardData} />
            ))}
          </RevealOnScroll>
        )}
      </div>
    </div>
  );
}
