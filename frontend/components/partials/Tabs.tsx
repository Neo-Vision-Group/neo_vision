"use client";

import { cn } from "@/lib/utils";

/**
 * Tabs — horizontal tab group with a visible active pill. Used for
 * category filters (Portfolio, Insights), content switches (Contact:
 * form / booking), and in-page navigation (Services hero).
 *
 * Fully client-side. Pass controlled `value` + `onChange` for stateful
 * filtering; or leave uncontrolled and read from anchor navigation.
 */
export type TabOption = {
  label: string;
  value: string;
  badge?: string | null;
};

export function Tabs({
  options,
  value,
  onChange,
  className,
  size = "md",
}: {
  options: ReadonlyArray<TabOption>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex flex-wrap items-center gap-2 border border-white/20 bg-surface p-1",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 font-medium leading-none transition-colors duration-200",
              size === "sm" ? "text-caption" : "text-body-2",
              active
                ? "bg-brand text-white"
                : "text-foreground/70 hover:text-foreground"
            )}
          >
            <span>{opt.label}</span>
            {opt.badge ? (
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-betatron uppercase tracking-wider",
                  active ? "bg-white/20 text-white" : "bg-white/10 text-foreground/60"
                )}
              >
                {opt.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
