import { SectionsWrapper } from "@/components/SectionsWrapper";
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

export type IsThisForYouData = {
  eyebrow?: string;
  heading?: string;
  items?: Array<{ text?: string }>;
};

export function IsThisForYou({ data }: { data?: IsThisForYouData }) {
  const eyebrow = data?.eyebrow ?? "IS THIS FOR YOU?";
  const heading = data?.heading;
  const items = data?.items ?? [];

  if (!heading && items.length === 0) {
    return null;
  }

  return (
    <SectionsWrapper eyebrow={eyebrow}>
      <div className="flex flex-col gap-12">
        {heading ? (
          <SplitTextReveal
            as="h2"
            type="words"
            stagger={0.04}
            colorReveal
            className="text-[28px] leading-12 tracking-[-0.3px] text-foreground md:text-[36px] md:leading-12 lg:text-[44px] lg:leading-14"
          >
            {heading}
          </SplitTextReveal>
        ) : null}
        {items.length > 0 ? (
          <RevealOnScroll
            as="div"
            stagger={0.06}
            className="grid grid-cols-1"
          >
            {items.map((item, idx) => (
              <article
                key={(item.text ?? "item") + idx}
                className="flex gap-3 items-center bg-surface p-6"
              >
                <div className="flex h-3 w-3 md:h-6 md:w-6 shrink-0 items-center justify-center bg-brand" />
                <span className="text-[18px] font-funnel text-black dark:text-white">{item.text}</span>
              </article>
            ))}
          </RevealOnScroll>
        ) : null}
      </div>
    </SectionsWrapper>
  );
}