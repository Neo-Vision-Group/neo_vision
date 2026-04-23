import type { PortableTextBlock } from "@portabletext/react";
import { PortableTextRenderer } from "@/components/partials/PortableTextRenderer";

interface InsightBodyProps {
  body?: PortableTextBlock[];
}

export function InsightBody({ body }: InsightBodyProps) {
  if (!body || body.length === 0) return null;

  return (
    <section id="body" className="px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-16 md:py-20">
      <article className="mx-auto max-w-[72ch]">
        <PortableTextRenderer value={body} />
      </article>
    </section>
  );
}