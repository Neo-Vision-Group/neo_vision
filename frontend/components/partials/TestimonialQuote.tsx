import { cn } from "@/lib/utils";

/**
 * Testimonial quote card — pull-quote with attribution and optional
 * source badge (Trustpilot, LinkedIn, etc.). Reused on About, Services,
 * Portfolio [slug].
 */
export type TestimonialQuoteProps = {
  quote: string;
  attribution: string;
  source?: string | null;
  accent?: boolean;
  className?: string;
};

export function TestimonialQuote({
  quote,
  attribution,
  source,
  accent = false,
  className,
}: TestimonialQuoteProps) {
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
        className="font-betatron text-[64px] leading-none text-brand md:text-[96px]"
      >
        &ldquo;
      </span>

      <blockquote className="flex-1 text-[22px] font-medium leading-[30px] tracking-[-0.2px] text-foreground md:text-[28px] md:leading-[38px] 2xl:text-[32px] 2xl:leading-[42px]">
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
