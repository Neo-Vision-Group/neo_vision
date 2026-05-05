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
        "flex flex-col bg-[#f0eded] dark:bg-dark-light gap-12 border border-decoration-dark p-8 dark:border-decoration-light",
        variant === "accent"
          ? "border-brand bg-brand/10"
          : "border-decoration-dark dark:border-decoration-light",
        className
      )}
    >
      <p className="capitalize font-betatron text-5xl leading-[1.2] tracking-[-2.88px] text-brand font-display">
        {label}
      </p>
      <div className="text-[18px] leading-normal text-foreground">
        {children}
      </div>
    </aside>
  );
}
