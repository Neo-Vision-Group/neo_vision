import { SectionsWrapper } from "@/components/SectionsWrapper";
import { CaseStudyCard, type CaseStudyCardData } from "@/components/partials/CaseStudyCard";
import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  { ssr: false }
);

export type StudyMoreLikeThisData = {
  heading?: {
    regular?: string;
    bold?: string;
  };
  items?: CaseStudyCardData[];
};

export function StudyMoreLikeThis({ data }: { data?: StudyMoreLikeThisData }) {
  const cleanData = data ? cleanStega(data) : data;

  const heading = cleanData?.heading;
  const items = cleanData?.items ?? [];

  if (items.length === 0) {
    return null;
  }

  return (
    <SectionsWrapper
      id="more-like-this"
      eyebrow="MORE WORK"
    >
      <div className="flex flex-col gap-12">
        {heading ? (
          <h2 className="text-[28px] leading-[36px] tracking-[-0.3px] text-foreground md:text-[36px] md:leading-[46px] lg:text-[44px] lg:leading-[54px]">
            {heading.regular}{" "}
            <span className="font-bold">{heading.bold}</span>
          </h2>
        ) : null}
        <RevealOnScroll
          as="div"
          stagger={0.08}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {items.slice(0, 3).map((item, idx) => (
            <CaseStudyCard key={item._id ?? item.client + idx} item={item} />
          ))}
        </RevealOnScroll>
      </div>
    </SectionsWrapper>
  );
}
