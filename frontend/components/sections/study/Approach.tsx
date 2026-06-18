import { SectionsWrapper } from "@/components/SectionsWrapper";
import { CalloutCard } from "@/components/partials/CalloutCard";
import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";

const SplitTextReveal = dynamic(
  () =>
    import("@/components/partials/motion/SplitTextReveal").then(
      (mod) => mod.SplitTextReveal
    ),
  { ssr: false }
);

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
          <SplitTextReveal
            as="h2"
            type="words"
            stagger={0.04}
            colorReveal
            className="leading-[1.2] tracking-[-1px] text-[32px]"
          >
            {[heading.faded, heading.bold].filter(Boolean).join(" ")}
          </SplitTextReveal>
        ) : null}
        {body ? (
          <p className="text-[18px] leading-normal text-black dark:text-white">
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
