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
            className="text-4xl leading-[1.2] tracking-[-1px] md:text-[40px] lg:text-5xl"
          >
            {[heading.faded, heading.bold].filter(Boolean).join(" ")}
          </SplitTextReveal>
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
