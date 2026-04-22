import { SectionsWrapper } from "@/components/SectionsWrapper";
import { ResourceCard, type ResourceCardData } from "@/components/partials/ResourceCard";
import { RevealOnScroll } from "@/components/partials/motion/RevealOnScroll";
import { cleanStega } from "@/sanity/lib/utils";
import { HeadingShape } from "@/components/sections/PageHero";

export type InsightsResourcesData = {
  eyebrow?: string;
  heading?: HeadingShape;
  body?: string;
  items?: ResourceCardData[];
};

export function InsightsResources({ data }: { data?: InsightsResourcesData }) {
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
          {items.slice(0, 8).map((r, idx) => (
            <ResourceCard key={r._id ?? r.title + idx} resource={r} />
          ))}
        </RevealOnScroll>
      </div>
    </SectionsWrapper>
  );
}

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
