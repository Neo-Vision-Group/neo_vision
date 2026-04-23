"use client";

import { cn } from "@/lib/utils";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { RevealOnScroll } from "@/components/partials/motion/RevealOnScroll";
import { cleanStega } from "@/sanity/lib/utils";
import ArrowDownIcon from "@/components/icons/ArrowDownIcon";
import { HeadingShape } from "@/components/sections/PageHero";

export type FreeResourcesData = {
  eyebrow?: string;
  heading?: HeadingShape;
  body?: string;
  items?: Array<{
    title?: string;
    description?: string;
    file?: {
      asset?: {
        url?: string;
      };
    };
    externalUrl?: string;
  }>;
};

function Heading({ value }: { value: HeadingShape }) {
  if (typeof value === "string") {
    return <span>{value}</span>;
  }

  const { faded, bold, trailing, regular } = value;
  return (
    <span>
      {faded ? <span className="text-foreground/70">{faded} </span> : null}
      {regular ? <span>{regular} </span> : null}
      {bold ? <span className="font-bold">{bold}</span> : null}
      {trailing ? (
        <>
          <br />
          <span className="text-foreground/70">{trailing}</span>
        </>
      ) : null}
    </span>
  );
}

export function FreeResources({ data }: { data?: FreeResourcesData }) {
  const cleanData = data ? cleanStega(data) : data;

  const items = cleanData?.items ?? [];

  if (items.length === 0) {
    return null;
  }

  return (
    <SectionsWrapper
      id="resources"
      eyebrow={cleanData?.eyebrow ?? "FREE RESOURCES"}
    >
      <div className="flex flex-col gap-12">
        <div className="px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <h2 className="text-[28px] leading-[36px] tracking-[-0.3px] text-foreground md:text-[36px] md:leading-[46px] lg:text-[44px] lg:leading-[54px]">
            <Heading value={cleanData?.heading ?? {}} />
          </h2>
          {cleanData?.body ? (
            <p className="mt-4 max-w-[60ch] text-body text-foreground/70">
              {cleanData.body}
            </p>
          ) : null}
        </div>
        <RevealOnScroll
          as="div"
          stagger={0.06}
          className="grid grid-cols-1 gap-4 px-6 md:grid-cols-2 md:px-6 lg:px-8 xl:grid-cols-4 xl:px-12 2xl:px-16"
        >
          {items.map((item, idx) => (
            <ResourceCard key={idx} item={item} />
          ))}
        </RevealOnScroll>
      </div>
    </SectionsWrapper>
  );
}

function ResourceCard({
  item,
}: {
  item: NonNullable<FreeResourcesData["items"]> [number];
}) {
  const downloadUrl = item?.file?.asset?.url ?? item?.externalUrl ?? "#";
  const isExternal = !!item?.externalUrl && !item?.file?.asset?.url;

  return (
    <article
      className={cn(
        "group flex h-full flex-col border border-border bg-surface",
        "transition-all duration-300 ease-out",
        "hover:border-brand/50"
      )}
    >
      {/* Icon header */}
      <div className="flex h-14 w-14 items-center justify-center bg-brand">
        <ArrowDownIcon className="h-5 w-5 text-background" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-6 pt-5">
        <h3 className="text-h4 font-medium tracking-[-0.2px] text-foreground">
          {item?.title}
        </h3>
        {item?.description ? (
          <p className="text-body-2 text-foreground/70">{item.description}</p>
        ) : null}
      </div>

      {/* Download button - full width at bottom */}
      <div className="mt-auto p-6 pt-0">
        <a
          href={downloadUrl}
          target={isExternal ? "_blank" : "_self"}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className={cn(
            "flex w-full items-center justify-center gap-2",
            "border border-foreground/20 px-4 py-3",
            "text-body-2 font-medium text-foreground",
            "transition-colors duration-200",
            "hover:border-brand hover:bg-brand hover:text-background"
          )}
          download={!isExternal}
        >
          Download
        </a>
      </div>
    </article>
  );
}