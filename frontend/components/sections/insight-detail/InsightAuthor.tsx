import Image from "next/image";
import { urlForImage } from "@/sanity/lib/utils";
import type { InsightAuthorData } from "@/lib/types/insight";

interface InsightAuthorProps {
  author?: InsightAuthorData | null;
}

export function InsightAuthor({ author }: InsightAuthorProps) {
  const hasContent = Boolean(
    author?.name || author?.role || author?.bio || author?.portrait
  );

  if (!hasContent) return null;

  const portraitUrl = author?.portrait
    ? urlForImage(author.portrait)?.width(860).height(1046).fit("crop").url()
    : null;

  return (
    <section
      id="author"
      className="px-4 py-16 md:px-6 xl:px-8"
    >
      <div className="mx-auto max-w-330 border border-black/10 bg-white dark:border-white/10 dark:bg-[#0f0f0f]">
        <div className="grid overflow-hidden lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,429px)]">
          <div className="flex items-center px-6 py-8 md:px-10 md:py-12 lg:px-12">
            <div className="w-full max-w-xl">
              {author?.name ? (
                <p className="font-funnel text-[28px] leading-[1.15] tracking-[-1px] text-foreground md:text-4xl">
                  {author.name}
                </p>
              ) : null}

              {author?.role ? (
                <p className="mt-2 font-funnel text-64 text-foreground/65 md:text-64">
                  {author.role}
                </p>
              ) : null}

              <div className="mt-6 h-px w-full bg-black/10 dark:bg-white/10" />

              {author?.bio ? (
                <p className="mt-6 max-w-136 font-funnel text-64 leading-7 text-foreground/80 md:text-[17px] md:leading-8">
                  {author.bio}
                </p>
              ) : null}
            </div>
          </div>

          <div className="border-t border-black/10 dark:border-white/10 lg:border-l lg:border-t-0">
            <div className="relative aspect-429/523 min-h-80 overflow-hidden bg-[#f3f3f5] dark:bg-[#090909]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-all px-4 pt-3 font-mono text-4xl uppercase leading-[1.08] tracking-[0.18em] text-black/10 dark:text-white/10"
              >
                {BINARY_PATTERN}
              </div>

              {portraitUrl ? (
                <div className="bottom-0 right-0 h-[82%] w-[78%] overflow-hidden bg-white/70 dark:bg-black/20 relative">
                  <Image
                    src={portraitUrl}
                    alt={author?.name ?? "Article author portrait"}
                    fill
                    sizes="(min-width: 1024px) 429px, (min-width: 768px) 50vw, 100vw"
                    className="object-cover object-top"
                  />
                </div>
              ) : (
                <div className="absolute bottom-0 right-0 flex h-[82%] w-[78%] items-center justify-center bg-black/5 text-[40px] font-medium text-foreground/35 dark:bg-white/5">
                  {getInitials(author?.name)}
                </div>
              )}

              <div className="absolute left-4 top-4 md:left-5 md:top-5">
                <AuthorBadge />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const BINARY_PATTERN = `
10010111010.10010111010.10010111010.10010111010.
10010111010.10010111010.10010111010.10010111010.
10010111010.10010111010.10010111010.10010111010.
10010111010.10010111010.10010111010.10010111010.
10010111010.10010111010.10010111010.10010111010.
`;

function getInitials(name?: string | null) {
  if (!name) return "NVT";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function AuthorBadge() {
  return (
    <div className="relative flex h-14 w-14 items-center justify-center border border-brand/30 bg-white/70 backdrop-blur-sm dark:bg-black/40">
      <div className="absolute left-2 top-2 h-4 w-4 rounded-xs border-2 border-brand" />
      <div className="absolute right-2 bottom-2 h-4 w-4 rounded-xs border-2 border-brand" />
      <div className="h-0.5 w-8 rotate-[-40deg] bg-brand" />
    </div>
  );
}
