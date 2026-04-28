import { SectionsWrapper } from "@/components/SectionsWrapper";
import { Button } from "@/components/partials/Button";
import { cleanStega } from "@/sanity/lib/utils";

export type StudyClosingCtaData = {
  heading?: {
    regular?: string;
    bold?: string;
  };
  body?: string;
  cta?: {
    label?: string;
    href?: string;
  };
};

export function StudyClosingCta({ data }: { data?: StudyClosingCtaData }) {
  const cleanData = data ? cleanStega(data) : data;

  const heading = cleanData?.heading;
  const body = cleanData?.body;
  const cta = cleanData?.cta;

  if (!heading) {
    return null;
  }

  return (
    <SectionsWrapper
      id="closing"
      eyebrow="START"
      hideTopBorder
    >
      <div className="flex flex-col gap-8 border-t border-white/20 bg-linear-to-b from-background to-surface/60 px-6 py-16 md:px-6 md:py-24 lg:px-8 xl:px-12">
        <h2 className="text-deco-h4 leading-9 tracking-[-0.3px] text-foreground md:text-5xl md:leading-14.5 md:tracking-[-0.4px] lg:text-[56px] lg:leading-16 xl:text-[72px] xl:leading-20 2xl:text-[88px] 2xl:leading-[92px]">
          {heading.regular}{" "}
          <span className="font-bold">{heading.bold}</span>
        </h2>
        {body ? (
          <p className="max-w-[70ch] text-body text-foreground/70 md:text-[20px] md:leading-7">
            {body}
          </p>
        ) : null}
        {cta?.label && cta?.href ? (
          <div>
            <Button href={cta.href} variant="primary">
              {cta.label}
            </Button>
          </div>
        ) : null}
      </div>
    </SectionsWrapper>
  );
}
