import { cn } from "@/lib/utils";

/**
 * Metric strip — horizontal row of "value / label" pairs. Used on
 * Services, Portfolio, Contact, Service [slug], and Portfolio [slug]
 * pages. Brand-orange value with muted label below.
 */
export type MetricItem = {
  value: string;
  label: string;
  prefix?: string | null;
};

export function MetricStrip({
  items,
  className,
  variant = "surface",
}: {
  items: ReadonlyArray<MetricItem>;
  className?: string;
  variant?: "surface" | "bare" | "brand";
}) {
  const wrapperStyles: Record<typeof variant, string> = {
    surface: "border border-white/10 bg-surface",
    bare: "",
    brand: "bg-brand text-background",
  } as const;

  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-6 p-6 md:grid-cols-4 md:gap-8 md:p-8 lg:gap-12",
        wrapperStyles[variant],
        className
      )}
    >
      {items.map((item, idx) => (
        <div key={item.label + idx} className="flex flex-col gap-1">
          {item.prefix ? (
            <span
              className={cn(
                "font-betatron text-brand text-2.5 uppercase tracking-wider",
                variant === "brand" ? "text-background/70" : "text-muted"
              )}
            >
              {item.prefix}
            </span>
          ) : null}
          <dt
            className={cn(
              "font-betatron text-brand leading-none tracking-[-2px]",
              "text-[36px] md:text-5xl xl:text-[56px]",
              variant === "brand" ? "text-background" : "text-brand-hover"
            )}
          >
            {item.value}
          </dt>
          <dd className="dark:text-white text-black font-medium">
            {item.label}
          </dd>
        </div>
      ))}
    </dl>
  );
}
