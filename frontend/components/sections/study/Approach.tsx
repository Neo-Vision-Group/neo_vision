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
      <div className="flex flex-col gap-8 text-[#efefef]">
        {heading ? (
          <h2 className="text-4xl leading-[1.2] tracking-[-1px] md:text-[40px] lg:text-5xl">
            <span className="text-black dark:text-white">{heading.faded} </span>
            <span className="text-black dark:text-white">{heading.bold}</span>
          </h2>
        ) : null}
        {body ? (
          <p className="max-w-[70ch] text-[18px] leading-normal text-black dark:text-white md:text-[20px] md:leading-7">
            {body}
          </p>
        ) : null}
        {callout?.body ? (
          <CalloutCard
            label={callout.label ?? "Approach"}
            className="border-white/15 bg-black/4 p-8 dark:border-white/20 dark:bg-[#0f0f0f] text-black dark:text-white"
          >
            {callout.body}
          </CalloutCard>
        ) : null}
      </div>
    </SectionsWrapper>
  );
}
