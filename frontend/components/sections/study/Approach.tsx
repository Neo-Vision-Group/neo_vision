import { SectionsWrapper } from "@/components/SectionsWrapper";
import { CalloutCard } from "@/components/partials/CalloutCard";
import { cleanStega } from "@/sanity/lib/utils";

export type StudyApproachData = {
  eyebrow?: string;
  heading?: {
    faded?: string;
    bold?: string;
  };
  body?: string;
  callout?: {
    label?: string;
    body?: string;
  };
};

export function StudyApproach({ data }: { data?: StudyApproachData }) {
  const cleanData = data ? cleanStega(data) : data;

  const eyebrow = cleanData?.eyebrow ?? "OUR APPROACH";
  const heading = cleanData?.heading;
  const body = cleanData?.body;
  const callout = cleanData?.callout;

  if (!heading && !body && !callout) {
    return null;
  }

  return (
    <SectionsWrapper
      id="approach"
      eyebrow={eyebrow}
    >
      <div className="flex flex-col gap-8">
        {heading ? (
          <h2 className="text-[28px] leading-[36px] tracking-[-0.3px] text-foreground md:text-[36px] md:leading-[46px] lg:text-[44px] lg:leading-[54px]">
            <span className="text-foreground/70">{heading.faded} </span>
            <span className="font-bold">{heading.bold}</span>
          </h2>
        ) : null}
        {body ? (
          <p className="max-w-[70ch] text-body text-foreground/70 md:text-[20px] md:leading-[28px]">
            {body}
          </p>
        ) : null}
        {callout?.body ? (
          <CalloutCard label={callout.label ?? "Approach"}>
            {callout.body}
          </CalloutCard>
        ) : null}
      </div>
    </SectionsWrapper>
  );
}
