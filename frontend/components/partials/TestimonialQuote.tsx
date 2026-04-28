import { cn } from "@/lib/utils";

export type TestimonialQuoteProps = {
  quote: string;
  attribution: string;
  source?: string | null;
  accent?: boolean;
  className?: string;
  variant?: "default" | "study";
};

export function TestimonialQuote({
  quote,
  attribution,
  source,
  accent = false,
  className,
  variant = "default",
}: TestimonialQuoteProps) {
  if (variant === "study") {
    return (
      <figure
        className={cn(
          "relative flex h-full flex-col gap-12 bg-black/4 p-8 dark:border-white/20 dark:bg-[#0f0f0f] dark:text-white md:p-12",
          className
        )}
      >
        <span
          aria-hidden="true"
          className="font-betatron text-5xl leading-none text-brand"
        >
          &ldquo;
        </span>

        <div className="flex flex-col gap-6">
          <cite className="not-italic text-[18px] leading-normal text-brand">
            - {attribution}
            {source ? `, ${source}` : ""}
          </cite>
          <blockquote className="text-[28px] leading-[1.2] tracking-[-1px] text-black dark:text-white md:text-4xl">
            {quote}
          </blockquote>
        </div>
      </figure>
    );
  }

  return (
    <figure
      className={cn(
        "relative flex h-full flex-col gap-8 border bg-surface p-8 md:p-12",
        accent ? "border-brand/40" : "border-white/10",
        className
      )}
    >
      {/* Opening mark */}
      <span
        aria-hidden="true"
        className="font-betatron text-64 leading-none text-brand md:text-[96px]"
      >
        &ldquo;
      </span>

      <blockquote className="flex-1 text-[22px] font-medium leading-8 tracking-[-0.2px] text-foreground md:text-[28px] md:leading-9 2xl:text-4xl 2xl:leading-10">
        {quote}
      </blockquote>

      <div className="h-px w-full bg-white/20" />

      <figcaption className="flex flex-wrap items-center justify-between gap-4">
        <cite className="not-italic text-body text-foreground">{attribution}</cite>
        {source ? (
          <span className="inline-flex items-center gap-2 border border-white/20 px-3 py-1 font-betatron text-caption uppercase tracking-wider text-muted">
            {source}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}
