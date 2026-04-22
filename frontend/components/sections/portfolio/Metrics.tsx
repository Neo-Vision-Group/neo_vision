import { MetricStrip, type MetricItem } from "@/components/partials/MetricStrip";
import { cleanStega } from "@/sanity/lib/utils";

export type PortfolioMetricsData = {
  items?: Array<{ value?: string; label?: string }>;
};

export function PortfolioMetrics({ data }: { data?: PortfolioMetricsData }) {
  const cleanData = data ? cleanStega(data) : data;

  const items = cleanData?.items ?? [];

  if (items.length === 0) {
    return null;
  }

  const metrics: MetricItem[] = items.map((item) => ({
    value: item.value ?? "",
    label: item.label ?? "",
  }));

  return <MetricStrip items={metrics} variant="brand" />;
}
