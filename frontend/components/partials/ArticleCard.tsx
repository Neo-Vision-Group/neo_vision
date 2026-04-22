import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "./ArrowRight";

/**
 * Article card — used on the Insights listing grid and in "Keep
 * reading" / "More like this" related-post surfaces on insight posts.
 */
export type ArticleCardData = {
  _id?: string;
  title: string;
  slug?: { current?: string } | string | null;
  excerpt?: string | null;
  category?: string | null;
  publishedAt?: string | null;
  readTime?: number | null;
  cover?: string | null;
  author?: {
    name?: string | null;
    role?: string | null;
  };
};

function resolveSlug(slug: ArticleCardData["slug"]): string {
  if (!slug) return "";
  if (typeof slug === "string") return slug;
  return slug.current ?? "";
}

function formatCategory(value?: string | null) {
  if (!value) return null;
  return value
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function ArticleCard({
  article,
  featured = false,
  className,
}: {
  article: ArticleCardData;
  featured?: boolean;
  className?: string;
}) {
  const slug = resolveSlug(article.slug);
  const href = slug ? `/insights/${slug}` : "#";
  const category = formatCategory(article.category);

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden border border-white/20 bg-[var(--bg-card,#0f0f0f)] transition-all duration-300 ease-out hover:border-brand/40 hover:-translate-y-0.5",
        featured ? "md:flex-row" : "",
        className
      )}
    >
      <div
        className={cn(
          "relative bg-[var(--dark,#040404)]",
          featured
            ? "aspect-[16/9] md:aspect-[3/2] md:w-1/2"
            : "aspect-[16/10]"
        )}
      >
        {article.cover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.cover}
              alt={article.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#c1c9c5]/20 from-[35%] to-[#ff4100]/30" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface via-black/30 to-brand/10" />
        )}
        
        {/* Author + read time badge */}
        <div className="absolute left-2 top-2 bg-[rgba(255,65,0,0.3)] p-2">
          <p className="font-funnel-display text-[14px] leading-[1.2] tracking-[-0.5px] text-foreground">
            {article.author?.name ? `${article.author.name} · ` : ''}
            {article.readTime ? `${article.readTime} min` : ''}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col gap-12 p-6 md:p-8",
          featured ? "md:justify-center" : ""
        )}
      >
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            {/* Category badge */}
            {category ? (
              <div className="bg-[rgba(255,65,0,0.3)] p-2.5 self-start">
                <p className="font-funnel-display text-[18px] leading-[1.5] text-foreground">
                  {category}
                </p>
              </div>
            ) : null}
            
            <h3
              className={cn(
                "font-funnel-display-bold tracking-[-0.2px] text-foreground",
                featured
                  ? "text-[24px] leading-[32px] md:text-[32px] md:leading-[40px]"
                  : "text-[24px] leading-[1.2]"
              )}
            >
              {article.title}
            </h3>
          </div>
          
          {article.excerpt ? (
            <p className="font-funnel-display text-[18px] leading-[1.5] text-foreground/70">
              {article.excerpt}
            </p>
          ) : null}
        </div>
        
        <div className="mt-auto flex items-center gap-3 pt-4">
          <span className="font-funnel-display-bold text-[24px] leading-[1.2] text-foreground transition-transform duration-200 group-hover:translate-x-0.5">
            Read
          </span>
          <ArrowRight width={38.4} height={24} />
        </div>
      </div>
    </Link>
  );
}
