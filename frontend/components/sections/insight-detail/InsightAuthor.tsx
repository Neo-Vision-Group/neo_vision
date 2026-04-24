import Image from "next/image";
import { urlForImage } from "@/sanity/lib/utils";
import type { InsightAuthorData } from "@/lib/types/insight";

interface InsightAuthorProps {
  author?: InsightAuthorData | null;
}

export function InsightAuthor({ author }: InsightAuthorProps) {
  if (!author?.bio) return null;

  return (
    <section id="author" className="px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-16">
      <div className="flex flex-col gap-6 border border-white/10 bg-surface p-6 md:flex-row md:items-start md:gap-8 md:p-8 max-w-4xl mx-auto">
        {author.portrait ? (
          <div className="h-24 w-24 shrink-0 overflow-hidden border border-white/10 bg-black">
            <Image
              src={urlForImage(author.portrait)?.url() || ""}
              alt={author.name ?? ""}
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
          <p className="text-[24px] font-medium text-foreground">{author.name}</p>
          {author.role ? (
            <p className="font-mono text-[14px] uppercase tracking-wider text-muted">
              {author.role}
            </p>
          ) : null}
          <p className="mt-2 text-[18px] text-foreground/80">{author.bio}</p>
        </div>
      </div>
    </section>
  );
}
