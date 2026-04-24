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
        "flex flex-col bg-[#f0eded] dark:bg-black gap-12 border border-white/20 p-8 dark:border-white/30",
        variant === "accent"
          ? "border-brand bg-brand/10"
          : "border-white/20 bg-surface dark:border-white/30",
        className
      )}
    >
      <p className="capitalize font-betatron text-[48px] leading-[1.2] tracking-[-2.88px] text-brand font-display">
        {label}
      </p>
      <div className="text-[18px] leading-[1.5] text-foreground">
        {children}
      </div>
    </aside>
  );
}
