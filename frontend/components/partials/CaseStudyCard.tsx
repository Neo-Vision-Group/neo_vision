import Link from "next/link";
import { cn } from "@/lib/utils";
import ArrowRight from "@/components/icons/ArrowRight";

/**
 * Case study listing card — used on /portfolio and
 * /services/[slug] workShowcase. Shows a thumbnail with overlay
 * metadata (category, industry, metric), then client + tagline below.
 */
export type CaseStudyCardData = {
  _id?: string;
  client: string;
  slug?: { current?: string } | string | null;
  year?: string | null;
  category?: string | null;
  industry?: string | null;
  tagline?: string | null;
  metric?: string | null;
  metricLabel?: string | null;
  thumb?: string | null;
  thumbHref?: string | null;
};

function resolveSlug(slug: CaseStudyCardData["slug"]): string {
  if (!slug) return "";
  if (typeof slug === "string") return slug;
  return slug.current ?? "";
}

export function CaseStudyCard({
  item,
  featured = false,
  className,
}: {
  item: CaseStudyCardData;
  featured?: boolean;
  className?: string;
}) {
  const slug = resolveSlug(item.slug);
  const href = slug ? `/portfolio/${slug}` : item.thumbHref ?? "/portfolio";

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col overflow-hidden border border-white/10 bg-surface transition-all duration-300 ease-out hover:border-brand/40 hover:-translate-y-0.5",
        featured ? "md:flex-row" : "",
        className
      )}
    >
      <div
        className={cn(
          "relative bg-black/40",
          featured ? "aspect-[16/9] md:aspect-auto md:w-3/5" : "aspect-[4/3]"
        )}
      >
        {item.thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumb}
            alt={item.client}
            className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity duration-300 group-hover:opacity-85"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface via-black/40 to-brand/20" />
        )}
        <div className="relative flex h-full flex-col justify-between p-4 md:p-6">
          <div className="flex flex-wrap gap-2">
            {item.category ? (
              <span className="bg-background/80 px-2 py-1 font-betatron text-[10px] uppercase tracking-wider text-foreground">
                {item.category}
              </span>
            ) : null}
            {item.industry ? (
              <span className="bg-background/80 px-2 py-1 font-betatron text-[10px] uppercase tracking-wider text-foreground/80">
                {item.industry}
              </span>
            ) : null}
          </div>
          {item.metric ? (
            <div className="self-start bg-brand px-3 py-2 text-background">
              <p className="font-betatron text-[24px] leading-none tracking-tight md:text-[32px]">
                {item.metric}
              </p>
              {item.metricLabel ? (
                <p className="mt-1 text-[10px] font-betatron uppercase tracking-wider">
                  {item.metricLabel}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col gap-3 p-6 md:p-8",
          featured ? "md:w-2/5 md:justify-center" : ""
        )}
      >
        <div className="flex items-center gap-3">
          <p className="text-h4 font-medium tracking-[-0.2px] text-foreground">
            {item.client}
          </p>
          {item.year ? (
            <span className="font-betatron text-caption uppercase tracking-wider text-muted">
              {item.year}
            </span>
          ) : null}
        </div>
        {item.tagline ? (
          <p className="text-body-2 text-foreground/70">{item.tagline}</p>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-2 pt-2 text-body-2 text-foreground transition-transform duration-200 group-hover:translate-x-0.5">
          Read case study
          <ArrowRight color="white" width={20} height={14} />
        </span>
      </div>
    </Link>
  );
}
