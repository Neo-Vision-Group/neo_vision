import { SectionsWrapper } from "@/components/SectionsWrapper";
import { Button } from "@/components/partials/Button";
import { cleanStega } from "@/sanity/lib/utils";
import { HeadingShape } from "@/components/sections/PageHero";

export type InsightsCtaData = {
  heading?: HeadingShape;
  body?: string;
  cta?: { label?: string; href?: string };
};

export function InsightsCta({ data }: { data?: InsightsCtaData }) {
  const cleanData = data ? cleanStega(data) : data;

  return (
    <SectionsWrapper
      id="question-cta"
      eyebrow="STILL WONDERING?"
    >
      <div className="flex flex-col gap-8 border border-brand/40 bg-surface px-6 py-12 md:px-6 md:py-16 lg:px-8 xl:px-12 2xl:px-16 dark:border-brand/60">
        <h2 className="text-[28px] leading-9 tracking-[-0.3px] text-foreground md:text-[36px] md:leading-12 lg:text-[44px] lg:leading-14">
          <Heading value={cleanData?.heading ?? {}} />
        </h2>
        {cleanData?.body ? (
          <p className="max-w-[70ch] text-body text-foreground/70 md:text-[20px] md:leading-7">
            {cleanData.body}
          </p>
        ) : null}
        {cleanData?.cta?.label && cleanData.cta?.href ? (
          <div>
            <Button href={cleanData.cta.href} variant="primary">
              {cleanData.cta.label}
            </Button>
          </div>
        ) : null}
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
