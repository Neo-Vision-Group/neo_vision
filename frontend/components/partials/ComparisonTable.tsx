import { cn } from "@/lib/utils";

/**
 * Comparison (before / after) table — used on Portfolio [slug] "Key
 * Wins" to show measurable deltas. Also reusable inside Insight posts
 * for any A-vs-B comparison.
 */
export function ComparisonTable({
  beforeLabel = "Before",
  afterLabel = "After",
  rows,
  className,
}: {
  beforeLabel?: string;
  afterLabel?: string;
  rows: ReadonlyArray<{ label: string; before: string; after: string }>;
  className?: string;
}) {
  return (
    <div className={cn("w-full overflow-x-auto border border-white/10 dark:border-white/20", className)}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-surface">
            <th
              scope="col"
              className="w-1/3 border-r border-white/10 dark:border-white/20 px-4 py-3 font-mono text-caption uppercase tracking-wider text-muted"
            >
              Metric
            </th>
            <th
              scope="col"
              className="border-r border-white/10 dark:border-white/20 px-4 py-3 font-mono text-caption uppercase tracking-wider text-muted"
            >
              {beforeLabel}
            </th>
            <th
              scope="col"
              className="px-4 py-3 font-mono text-caption uppercase tracking-wider text-brand"
            >
              {afterLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.label + idx} className="border-t border-white/10 dark:border-white/20">
              <th
                scope="row"
                className="border-r border-white/10 dark:border-white/20 bg-surface/50 px-4 py-4 font-medium text-foreground"
              >
                {row.label}
              </th>
              <td className="border-r border-white/10 dark:border-white/20 px-4 py-4 text-foreground/80">
                {row.before}
              </td>
              <td className="px-4 py-4 font-medium text-brand">{row.after}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
