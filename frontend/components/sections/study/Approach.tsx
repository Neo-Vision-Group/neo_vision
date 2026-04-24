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
          <h2 className="text-[32px] leading-[1.2] tracking-[-1px] md:text-[40px] lg:text-[48px]">
            <span className="text-[#efefef]/70">{heading.faded} </span>
            <span className="font-bold text-[#efefef]">{heading.bold}</span>
          </h2>
        ) : null}
        {body ? (
          <p className="max-w-[70ch] text-[18px] leading-[1.5] text-[#efefef]/70 md:text-[20px] md:leading-[28px]">
            {body}
          </p>
        ) : null}
        {callout?.body ? (
          <CalloutCard
            label={callout.label ?? "Approach"}
            className="border-white/15 bg-[#0f0f0f] text-[#efefef]"
          >
            {callout.body}
          </CalloutCard>
        ) : null}
      </div>
    </SectionsWrapper>
  );
}
