import { Button } from "@/components/partials/Button";
import { cleanStega } from "@/sanity/lib/utils";

export type PortfolioCtaData = {
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

export function PortfolioCta({ data }: { data?: PortfolioCtaData }) {
  const cleanData = data ? cleanStega(data) : data;

  const heading = cleanData?.heading;
  const body = cleanData?.body;
  const cta = cleanData?.cta;

  if (!heading) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 border border-brand/40 bg-surface px-6 py-12 md:px-6 md:py-16 lg:px-8 xl:px-12 2xl:px-16">
      <h2 className="text-[28px] leading-[36px] tracking-[-0.3px] text-foreground md:text-[36px] md:leading-[46px] lg:text-[44px] lg:leading-[54px]">
        {heading?.regular}{" "}
        <span className="font-bold">{heading?.bold}</span>
      </h2>
      {body ? (
        <p className="max-w-[70ch] text-body text-foreground/70 md:text-[20px] md:leading-[28px]">
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
  );
}
