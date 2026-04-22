"use client";

import { useMemo, useState } from "react";
import { Tabs, type TabOption } from "@/components/partials/Tabs";
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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:gap-8">
        {serviceFilters.length > 0 && (
          <Tabs
            options={serviceFilters.map((f) => ({
              label: f.label ?? "All",
              value: f.value ?? "all",
            }))}
            value={serviceFilter}
            onChange={setServiceFilter}
          />
        )}
        {industryFilters.length > 0 && (
          <Tabs
            options={industryFilters.map((f) => ({
              label: f.label ?? "All",
              value: f.value ?? "all",
            }))}
            value={industryFilter}
            onChange={setIndustryFilter}
          />
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
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {normalizedItems.map((item, idx) => (
            <CaseStudyCard key={item._id ?? (item.client || '') + idx} item={item as CaseStudyCardData} />
          ))}
        </RevealOnScroll>
      )}
    </div>
  );
}
