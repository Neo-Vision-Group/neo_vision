import { cn } from "@/lib/utils";

/**
 * Section — responsive 3-tier layout, sourced directly from Figma:
 *
 * ┌─ MOBILE (<md, based on frame 141:12844) ────────────────────────┐
 * │ ──── top rule (sticky) ────────────                             │
 * │        EYEBROW (centered)                                       │
 * │ ──── bot rule ────────────                                      │
 * │                                                                 │
 * │ [ content, px-6, gap-12 ]                                       │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * ┌─ TABLET (md 768+, based on frame 141:11997) ────────────────────┐
 * │ ┌──────────┐ │ ─── top rule ─────                               │
 * │ │          │ │                                                  │
 * │ │ EYEBROW  │ │ [ content, px-6, gap-12 ]                        │
 * │ │ (left,   │ │                                                  │
 * │ │  Betatron│ │                                                  │
 * │ │  32px)   │ │                                                  │
 * │ │          │ │                                                  │
 * │ └──────────┘ │                                                  │
 * │   210px wide │                                                  │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * ┌─ DESKTOP (lg/xl/2xl, based on frame 141:10303) ─────────────────┐
 * │ Sidebar width scales 280 → 360 → 480 across lg → xl → 2xl.      │
 * │ Eyebrow right-aligned at 2xl (matches native 1920 design).      │
 * │ Content padding 8 → 12 → 16 across same buckets.                │
 * └─────────────────────────────────────────────────────────────────┘
 */
export function Section({
  id,
  eyebrow,
  children,
  className,
  contentClassName,
  variant = "standard",
}: {
  id?: string;
  eyebrow?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: "standard" | "bare";
}) {
  if (variant === "bare") {
    return (
      <section id={id} className={cn("w-full bg-background", className)}>
        {children}
      </section>
    );
  }

  return (
    <section
      id={id}
      className={cn(
        "w-full bg-background flex flex-col md:flex-row md:items-start",
        className
      )}
    >
      {/* Sidebar / top-bar
          - Mobile: full-width, horizontal
          - md+: vertical sidebar (left-aligned at md/lg/xl, right-aligned at 2xl) */}
      <aside
        className={cn(
          "flex shrink-0 self-stretch",
          // Mobile: full-width, horizontal
          "w-full flex-col items-stretch",
          // md+: vertical sidebar, sticky
          "md:sticky md:top-0 md:w-[210px] md:pt-24",
          "lg:w-[280px] lg:pt-36 xl:w-[360px] 2xl:w-[480px]"
        )}
      >
        <div className="h-px w-full bg-border" />
        <div
          className={cn(
            "flex w-full flex-col items-start px-6 py-6",
            "md:px-5 lg:px-8 2xl:px-12"
          )}
        >
          <p
            className={cn(
              "w-full font-display leading-none text-foreground",
              // Mobile centered, tablet+ left, 2xl right (Figma 1920 spec)
              "text-center md:text-left 2xl:text-right",
              "text-[22px] lg:text-[26px] 2xl:text-[32px]"
            )}
          >
            {eyebrow}
          </p>
        </div>
        <div className="h-px w-full bg-border" />
      </aside>

      {/* Vertical divider (md+ only) */}
      <div aria-hidden="true" className="hidden w-px self-stretch bg-border md:block" />

      {/* Content column */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-12",
          "md:pt-24 lg:pt-36"
        )}
      >
        <div aria-hidden="true" className="hidden h-px w-full bg-border md:block" />
        <div
          className={cn(
            "w-full px-6 pt-10 pb-16",
            "md:px-6 md:pt-0 md:pb-16",
            "lg:px-8 xl:px-12 2xl:px-16 lg:pb-24",
            contentClassName
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
