import { cn } from "@/lib/utils";
import { ArrowRight } from "./ArrowRight";

/**
 * Resource card — used on the Insights listing "Free tools and guides."
 * grid. A single-letter icon, category, title, short description, and
 * a download button.
 */
export type ResourceCardData = {
  _id?: string;
  title: string;
  slug?: { current?: string } | string | null;
  category?: string | null;
  description?: string | null;
  iconLetter?: string | null;
  downloadUrl?: string | null;
  externalUrl?: string | null;
};

function formatCategory(value?: string | null) {
  if (!value) return null;
  return value
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function ResourceCard({
  resource,
  className,
}: {
  resource: ResourceCardData;
  className?: string;
}) {
  const href = resource.downloadUrl ?? resource.externalUrl ?? "#";
  const isExternal = !!resource.externalUrl && !resource.downloadUrl;
  const category = formatCategory(resource.category);

  return (
    <article
      className={cn(
        "group flex h-full flex-col gap-6 border border-white/10 bg-surface p-6 transition-all duration-300 ease-out hover:border-brand/40 hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center bg-brand font-display text-100 leading-none text-background"
        >
          {resource.iconLetter ?? "•"}
        </span>
        {category ? (
          <span className="font-mono text-2.5 uppercase tracking-wider text-muted">
            {category}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <h3 className="text-h4 font-medium tracking-[-0.2px] text-foreground">
          {resource.title}
        </h3>
        {resource.description ? (
          <p className="text-body-2 text-foreground/70">{resource.description}</p>
        ) : null}
      </div>

      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="inline-flex items-center gap-2 text-body-2 font-medium text-foreground transition-transform duration-200 group-hover:translate-x-0.5"
      >
        Download
        <ArrowRight width={20} height={14} />
      </a>
    </article>
  );
}
