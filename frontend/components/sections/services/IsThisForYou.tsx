import { SectionsWrapper } from "@/components/SectionsWrapper";
import dynamic from "next/dynamic";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
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
          <h2 className="text-[28px] leading-9 tracking-[-0.3px] text-foreground md:text-[36px] md:leading-12 lg:text-[44px] lg:leading-14">
            {heading}
          </h2>
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
                className="flex items-center gap-3 bg-surface p-6"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-brand">
                </div>
                <span className="text-body-2 text-black dark:text-white">{item.text}</span>
              </article>
            ))}
          </RevealOnScroll>
        ) : null}
      </div>
    </SectionsWrapper>
  );
}