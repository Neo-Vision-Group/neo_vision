import { forwardRef, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ArrowRight from "../icons/ArrowRightPixel";
import Image from "next/image";
import type { SanityImageSource } from "@sanity/image-url";
import { cleanStega, urlForImage } from "@/sanity/lib/utils";
import { AnimatedBorder } from "../AnimatedBorder";
import Badge from "./Badge";

/**
 * Case study listing card — used on /portfolio and
 * /services/[slug] workShowcase. Shows a thumbnail with overlay
 * metadata (category, industry, metric), then client + tagline below.
 */
export type CaseStudyCardData = {
  _id?: string;
  client: string;
  title: string;
  slug?: { current?: string } | string | null;
  year?: string | null;
  category?: string | null;
  industry?: string | null;
  tagline?: string | null;
  metric?: string | null;
  metricLabel?: string | null;
  thumb?: SanityImageSource | string | null;
  thumbHref?: string | null;
};

const FALLBACK_PATTERN =
  "radial-gradient(circle at 18% 22%, rgba(255,255,255,0.09) 0, rgba(255,255,255,0.09) 1px, transparent 1px), radial-gradient(circle at 72% 14%, rgba(255,255,255,0.07) 0, rgba(255,255,255,0.07) 1px, transparent 1px), radial-gradient(circle at 52% 40%, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(180deg, rgba(15,15,15,0.2) 0%, rgba(4,4,4,0.9) 100%)";

function resolveSlug(slug: CaseStudyCardData["slug"]): string {
  if (!slug) return "";
  if (typeof slug === "string") return slug;
  return slug.current ?? "";
}

function resolveThumbSrc(thumb: CaseStudyCardData["thumb"]): string | null {
  if (!thumb) return null;

  if (typeof thumb === "string") {
    const cleanThumb = cleanStega(thumb).trim();
    return cleanThumb.length > 0 ? cleanThumb : null;
  }

  return urlForImage(thumb)?.width(900).height(506).fit("max").auto("format").url() ?? null;
}

function CtaButton() {
  return (
    <div className="mt-8 flex justify-start md:mt-10">
      <span
        className="relative inline-flex items-center gap-3 self-start px-2 py-1 text-black transition-colors duration-200 group-hover:text-brand dark:text-[#efefef]"
      >
        <AnimatedBorder groupHover />
        <ArrowRight
          color="currentColor"
          width={38}
          height={24}
          className="relative z-10 h-6 w-10 shrink-0 transition-transform duration-700 group-hover:translate-x-1"
        />
        <span className="relative z-10 font-funnel text-100 font-bold leading-[1.2]">
          Read case study
        </span>
      </span>
    </div>
  );
}

export const CaseStudyCard = forwardRef<HTMLAnchorElement, {
  item: CaseStudyCardData;
  featured?: boolean;
  className?: string;
  isActive?: boolean;
}>(function CaseStudyCard({ item, featured = false, className, isActive = false }, ref) {
  const slug = resolveSlug(item.slug);
  const href = slug ? `/portfolio/${slug}` : item.thumbHref ?? "/portfolio";
  const thumbSrc = resolveThumbSrc(item.thumb);
  const imageRef = useRef<HTMLDivElement>(null);

  // Measure image container height and set CSS variable for aspect-video width calculation
  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;

    const updateHeight = () => {
      const height = img.offsetHeight;
      img.style.setProperty("--img-height", `${height}px`);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <Link
      ref={ref}
      href={href}
      className={cn(
        "group relative flex flex-col gap-6 bg-[#f0f0f0] dark:bg-[#040404] overflow-hidden border border-black/15 p-4 transition-all duration-700 ease-out hover:border-black/25 dark:border-white/10 dark:hover:border-white/20 md:gap-6 md:p-6",
        featured ? "md:flex-row md:items-stretch" : "lg:flex-row lg:items-stretch",
        className
      )}
    >
      <div
        ref={imageRef}
        className={cn(
          "case-study-card-image relative isolate flex shrink-0 overflow-hidden border border-black/10 bg-[#040404] dark:border-white/5",
          "w-full lg:w-[28%] lg:self-start lg:transition-[width] lg:duration-1000 lg:ease-out xl:w-1/3",
          "aspect-square",
        )}
      >
        {thumbSrc ? (
          <Image
            src={thumbSrc}
            alt={item.client}
            fill
            className="absolute inset-0 object-cover object-center transition-transform duration-1000"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "#040404",
              backgroundImage: FALLBACK_PATTERN,
              backgroundSize: "18px 18px, 24px 24px, 30px 30px, auto",
              backgroundPosition: "0 0, 0 0, 0 0, 0 0",
            }}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-white/3 via-transparent to-black/30" />
        <div className="relative flex h-full flex-col justify-end p-2">
          {item.metric ? (
            <div className="self-start bg-brand px-2 py-1.5 text-white">
              {item.metricLabel ? (
                <p className="font-funnel text-[14px] leading-[1.2] tracking-[-0.5px] text-white">
                  {item.metricLabel}
                </p>
              ) : null}
              <p className="font-clash text-[28px] leading-[1.2] tracking-[-1px] md:text-4xl">
                {item.metric}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col justify-between py-1 md:py-6",
          featured ? "md:min-h-80 xl:min-h-92" : "2xl:min-h-92"
        )}
      >
        <div className="flex flex-col gap-3">
          {item.category ? <Badge text={item.category} groupHover /> : null}
          <div className="flex flex-col gap-2">
            <p className="font-funnel text-[28px] leading-[1.1] tracking-[-0.84px] text-black dark:text-[#efefef] md:text-4xl md:tracking-[-1px]">
              {item.title}
            </p>
            {item.tagline ? (
              <p className="lg:line-clamp-2 2xl:line-clamp-4 font-funnel text-[18px] leading-normal text-black/70 dark:text-[#efefef]/70 md:text-body-2">
                {item.tagline}
              </p>
            ) : null}
            {item.industry && !item.category ? (
              <p className="font-clash text-3 uppercase tracking-wider text-black/55 dark:text-[#efefef]/55">
                {item.industry}
              </p>
            ) : null}
          </div>
        </div>

        <CtaButton />
      </div>
    </Link>
  );
});
