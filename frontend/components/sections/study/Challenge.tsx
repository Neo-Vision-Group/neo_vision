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

const SplitTextReveal = dynamic(
  () =>
    import("@/components/partials/motion/SplitTextReveal").then(
      (mod) => mod.SplitTextReveal
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
      classNameOverride="px-0"
    >
      <div className="flex flex-col gap-12 text-[#efefef]">
        {heading ? (
          <div className="flex flex-col gap-3 px-6 lg:px-16">
            <SplitTextReveal
              as="h2"
              type="words"
              stagger={0.04}
              colorReveal
              className="text-4xl leading-[1.2] tracking-[-1px] md:text-[40px] lg:text-5xl"
            >
              {heading}
            </SplitTextReveal>
          </div>
        ) : null}
        {body
          ? body
              .split("\n")
              .filter((paragraph) => paragraph.trim())
              .map((paragraph, index) => (
                <p
                  key={`${paragraph.slice(0, 24)}-${index}`}
                  className="text-[18px] leading-normal px-6 lg:px-16 text-black dark:text-white md:text-[20px] md:leading-7"
                >
                  {paragraph}
                </p>
              ))
          : null}
        {issues.length > 0 ? (
          <div className="mt-auto border-t border-black/15 dark:border-white/15">
            <RevealOnScroll
              as="div"
              stagger={0.06}
              className="grid grid-cols-1 border-l border-black/15 md:grid-cols-2 dark:border-white/15"
            >
              {issues.map((iss, idx) => (
                <article
                  key={(iss.tag ?? "iss") + idx}
                  className="border-b border-r border-black/15 p-6 dark:border-white/15 last:odd:col-span-full"
                >
                  <div className="group relative isolate flex min-h-[190px] flex-col justify-between border border-white/15 bg-black/4 p-8 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-brand/40 dark:border-white/20 dark:bg-[#0f0f0f]">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 ease-out dark:group-hover:opacity-100"
                    >
                      <div className="absolute inset-0" style={{ background: "#4a0e00" }} />
                      <div className="absolute inset-0 mix-blend-multiply" style={{ background: "#7a1a00" }} />
                    </div>
                    <span className="font-clash text-3xl lg:text-5xl leading-[1.2] tracking-[-2.88px] text-brand">
                      {iss.tag}
                    </span>
                    <p className="text-100 font-bold leading-[1.2] text-black dark:text-white">
                      {iss.body}
                    </p>
                  </div>
                </article>
              ))}
            </RevealOnScroll>
          </div>
        ) : null}
      </div>
    </SectionsWrapper>
  );
}
