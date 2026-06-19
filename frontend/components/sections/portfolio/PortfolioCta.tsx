"use client";

import posthog from '@/lib/posthog-client';
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

function normalizeCopy(value?: string) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[\u2019']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function PortfolioCta({ data }: { data?: PortfolioCtaData }) {
  const cleanData = data ? cleanStega(data) : data;

  const heading = cleanData?.heading;
  const body = cleanData?.body;
  const cta = cleanData?.cta;
  const isLegacyIndustryCta =
    normalizeCopy(heading?.regular) === "dont see your industry" &&
    normalizeCopy(heading?.bold) === "weve probably built in it";

  if (!heading || isLegacyIndustryCta) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 border border-brand/40 bg-surface px-6 py-12 md:px-6 md:py-16 lg:px-8 xl:px-12 2xl:px-16">
      <h2 className="text-[28px] leading-12 tracking-[-0.3px] text-foreground md:text-[36px] md:leading-12 lg:text-[44px] lg:leading-14">
        {heading?.regular}{" "}
        <span className="font-bold">{heading?.bold}</span>
      </h2>
      {body ? (
        <p className="max-w-[70ch] text-body text-foreground/70 md:text-[20px] md:leading-7">
          {body}
        </p>
      ) : null}
      {cta?.label && cta?.href ? (
        <div>
          <Button
            href={cta.href}
            variant="primary"
            data-cta-location="portfolio_cta"
            onClick={() => posthog.capture("portfolio_cta_clicked", { cta_label: cta.label, destination: cta.href })}
          >
            {cta.label}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
