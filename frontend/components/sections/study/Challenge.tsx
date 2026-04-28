import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  { ssr: false }
);

export type StudyChallengeData = {
  eyebrow?: string;
  heading?: string;
  body?: string;
  issues?: Array<{ tag?: string; body?: string }>;
};

export function StudyChallenge({ data }: { data?: StudyChallengeData }) {
  const cleanData = data ? cleanStega(data) : data;

  const eyebrow = cleanData?.eyebrow ?? "THE CHALLENGE";
  const heading = cleanData?.heading;
  const body = cleanData?.body;
  const issues = cleanData?.issues ?? [];

  if (!heading && !body && issues.length === 0) {
    return null;
  }

  return (
    <SectionsWrapper
      id="challenge"
      eyebrow={eyebrow}
    >
      <div className="flex flex-col gap-12 text-[#efefef]">
        {heading ? (
          <div className="flex flex-col gap-3">
            <h2 className="text-4xl leading-[1.2] tracking-[-1px] md:text-[40px] lg:text-5xl">
              {heading}
            </h2>
          </div>
        ) : null}
        {body
          ? body
              .split("\n")
              .filter((paragraph) => paragraph.trim())
              .map((paragraph, index) => (
                <p
                  key={`${paragraph.slice(0, 24)}-${index}`}
                  className="max-w-[72ch] text-[18px] leading-normal text-black dark:text-white md:text-[20px] md:leading-7"
                >
                  {paragraph}
                </p>
              ))
          : null}
        {issues.length > 0 ? (
          <RevealOnScroll
            as="div"
            stagger={0.06}
            className="grid grid-cols-1 gap-6 border-y border-white/15 py-6 md:grid-cols-2"
          >
            {issues.map((iss, idx) => (
              <article
                key={(iss.tag ?? "iss") + idx}
                className="flex min-h-[190px] flex-col justify-between border border-white/15 bg-black/4 p-8 dark:border-white/20 dark:bg-[#0f0f0f]s p-8"
              >
                <span className="font-betatron text-5xl leading-[1.2] tracking-[-2.88px] text-brand">
                  {iss.tag}
                </span>
                <p className="text-100 font-bold leading-[1.2] text-black dark:text-white">
                  {iss.body}
                </p>
              </article>
            ))}
          </RevealOnScroll>
        ) : null}
      </div>
    </SectionsWrapper>
  );
}
