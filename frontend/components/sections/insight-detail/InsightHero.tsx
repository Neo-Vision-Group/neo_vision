import Link from "next/link";
import Image from "next/image";
import { urlForImage } from "@/sanity/lib/utils";
import type { InsightDoc } from "@/lib/types/insight";

function formatDate(iso?: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatCategory(value?: string | null) {
  if (!value) return null;
  return value
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function InsightHero({ post }: { post: InsightDoc }) {
  const publishedDate = formatDate(post.publishedAt);
  const categoryLabel = formatCategory(post.category);

  return (
    <section className="border-b border-border bg-background">
      <div className="flex flex-col gap-8 px-6 py-16 md:px-6 md:py-24 lg:px-8 xl:px-12 2xl:px-16">
        {categoryLabel ? (
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 self-start bg-brand px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-background transition-colors hover:bg-brand-hover"
          >
            {categoryLabel}
          </Link>
        ) : null}
        <h1 className="max-w-[18ch] text-[36px] font-medium leading-[42px] tracking-[-0.4px] text-foreground md:text-[56px] md:leading-[64px] xl:text-[72px] xl:leading-[80px]">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="max-w-[68ch] text-[20px] leading-[28px] text-foreground/70">
            {post.excerpt}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-6 text-[14px] text-muted">
          {post.author?.name ? (
            <span className="inline-flex items-center gap-2">
              {post.author.portrait ? (
                <Image
                  src={urlForImage(post.author.portrait)?.url() || ""}
                  alt={post.author.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : null}
              <span className="text-foreground">{post.author.name}</span>
            </span>
          ) : null}
          {publishedDate ? <span>{publishedDate}</span> : null}
          {post.readTime ? <span>{post.readTime} min read</span> : null}
        </div>
      </div>
      {post.cover ? (
        <div className="aspect-[16/9] w-full overflow-hidden border-t border-border bg-black md:aspect-[21/9]">
          <Image
            src={urlForImage(post.cover)?.url() || ""}
            alt={post.title || ""}
            width={1200}
            height={630}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
    </section>
  );
}
