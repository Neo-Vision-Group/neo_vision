import { SectionsWrapper } from "@/components/SectionsWrapper";
import { RevealOnScroll } from "@/components/partials/motion/RevealOnScroll";
import { cleanStega } from "@/sanity/lib/utils";

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
      <div className="flex flex-col gap-8">
        {heading ? (
          <h2 className="text-[28px] leading-[36px] tracking-[-0.3px] text-foreground md:text-[36px] md:leading-[46px] lg:text-[44px] lg:leading-[54px]">
            {heading}
          </h2>
        ) : null}
        {body ? (
          <p className="max-w-[70ch] text-body text-foreground/70 md:text-[20px] md:leading-[28px]">
            {body}
          </p>
        ) : null}
        {issues.length > 0 ? (
          <RevealOnScroll
            as="div"
            stagger={0.06}
            className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"
          >
            {issues.map((iss, idx) => (
              <article
                key={(iss.tag ?? "iss") + idx}
                className="flex flex-col gap-2 border border-brand/30 bg-surface p-4"
              >
                <span className="font-betatron text-caption uppercase tracking-wider text-brand">
                  {iss.tag}
                </span>
                <p className="text-body-2 text-foreground/80">{iss.body}</p>
              </article>
            ))}
          </RevealOnScroll>
        ) : null}
      </div>
    </SectionsWrapper>
  );
}
