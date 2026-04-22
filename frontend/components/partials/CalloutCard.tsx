import { cn } from "@/lib/utils";

/**
 * Callout card — orange-bordered "Key Point" card. Used on Service
 * [slug], Portfolio [slug] approach/build sections, and inside Insight
 * posts as a block type.
 */
export function CalloutCard({
  label = "Key Point",
  children,
  className,
  variant = "default",
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "accent";
}) {
  return (
    <aside
      className={cn(
        "flex flex-col gap-3 border p-6",
        variant === "accent"
          ? "border-brand bg-brand/10"
          : "border-brand/40 bg-surface",
        className
      )}
    >
      <span
        className={cn(
          "inline-flex items-center self-start px-3 py-1 font-mono text-[10px] uppercase tracking-wider",
          "bg-brand text-background"
        )}
      >
        {label}
      </span>
      <div className="text-body text-foreground md:text-[18px] md:leading-[28px]">
        {children}
      </div>
    </aside>
  );
}
