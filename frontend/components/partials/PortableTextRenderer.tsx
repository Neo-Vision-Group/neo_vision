import { PortableText, type PortableTextComponents, type PortableTextBlock } from "@portabletext/react";
import Link from "next/link";
import { CalloutCard } from "@/components/partials/CalloutCard";
import { ComparisonTable } from "@/components/partials/ComparisonTable";

/**
 * PortableTextRenderer — renders Sanity Portable Text with TwelveTen's
 * custom block types (pullquote, keyPoint, comparisonTable) used in
 * Insight posts. Typography tuned for long-form reading.
 */

type PullquoteBlock = { _type: "pullquote"; quote?: string; attribution?: string };
type KeyPointBlock = { _type: "keyPoint"; label?: string; body?: string };
type ComparisonTableBlock = {
  _type: "comparisonTable";
  headers?: string[];
  rows?: { cells?: string[] }[];
};
type ImageBlock = { _type: "image"; asset?: { url?: string }; alt?: string };

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="my-5 text-[18px] font-funnel text-foreground/85 leading-normal">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-12 mb-4 text-[48px] font-funnel font-normal leading-[1.2] tracking-[-1px] text-foreground">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-10 mb-3 text-[32px] font-funnel font-normal leading-[1.2] tracking-[-1px] text-foreground">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-2 border-brand pl-6 text-[24px] font-funnel italic leading-[1.2] text-foreground/85">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => (
      <code className="bg-surface px-1.5 py-0.5 font-mono text-[0.9em] text-brand">
        {children}
      </code>
    ),
    link: ({ value, children }) => {
      const href = (value?.href as string | undefined) ?? "#";
      const external = /^https?:/i.test(href);
      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand underline underline-offset-2 hover:text-brand-hover"
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className="text-brand underline underline-offset-2 hover:text-brand-hover">
          {children}
        </Link>
      );
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-5 ml-6 list-disc space-y-2 text-body text-foreground/85 md:text-[18px] md:leading-[30px]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="my-5 ml-6 list-decimal space-y-2 text-body text-foreground/85 md:text-[18px] md:leading-[30px]">
        {children}
      </ol>
    ),
  },
  types: {
    pullquote: ({ value }: { value: PullquoteBlock }) => (
      <figure className="my-10 border-y border-brand/40 py-8">
        <blockquote className="text-[24px] font-medium leading-8 tracking-[-0.2px] text-foreground md:text-[32px] md:leading-[42px]">
          &ldquo;{value.quote}&rdquo;
        </blockquote>
        {value.attribution ? (
          <figcaption className="mt-4 font-mono text-caption uppercase tracking-wider text-muted">
            — {value.attribution}
          </figcaption>
        ) : null}
      </figure>
    ),
    keyPoint: ({ value }: { value: KeyPointBlock }) => (
      <div className="my-8">
        <CalloutCard label={value.label ?? "Key Point"}>{value.body}</CalloutCard>
      </div>
    ),
    comparisonTable: ({ value }: { value: ComparisonTableBlock }) => {
      return (
        <div className="my-8">
          <ComparisonTable headers={value.headers} rows={value.rows ?? []} />
        </div>
      );
    },
    image: ({ value }: { value: ImageBlock }) => {
      const url = value.asset?.url;
      if (!url) return null;
      return (
        <figure className="my-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={value.alt ?? ""}
            className="w-full border border-white/10"
          />
        </figure>
      );
    },
  },
};

export function PortableTextRenderer({
  value,
  className,
}: {
  value: PortableTextBlock[];
  className?: string;
}) {
  return (
    <div className={className}>
      <PortableText value={value} components={components} />
    </div>
  );
}
