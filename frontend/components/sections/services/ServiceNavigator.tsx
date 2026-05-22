"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatedBorder } from "@/components/AnimatedBorder";
import ArrowRight from "@/components/icons/ArrowRight";
import ResolvedLink from "@/components/ResolvedLink";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cn } from "@/lib/utils";
import { DereferencedLink } from "@/sanity/lib/types";
import { cleanStega } from "@/sanity/lib/utils";
import { Button } from "@/components/partials/Button";
import ArrowRightPixel from "@/components/icons/ArrowRightPixel";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  { ssr: false }
);

type ServiceNavigatorCard = {
  _key?: string;
  prompt?: string;
  details?: string;
  cta?: {
    buttonText?: string;
    link?: DereferencedLink;
  };
};

export type ServiceNavigatorData = {
  eyebrow?: string;
  headingRegular?: string;
  headingBold?: string;
  cards?: ServiceNavigatorCard[];
  closingText?: string;
  closingCta?: {
    buttonText?: string;
    link?: DereferencedLink;
  };
};

const fallbackCards: ServiceNavigatorCard[] = [
  {
    _key: "engineering",
    prompt: '"We need software built"',
    details: "websites, platforms, apps",
    cta: {
      buttonText: "Engineering",
      link: { _type: "link", linkType: "href", href: "/services/engineering" },
    },
  },
  {
    _key: "automation",
    prompt: '"We want to automate processes"',
    details: "workflows, email, reporting",
    cta: {
      buttonText: "AI Automation",
      link: { _type: "link", linkType: "href", href: "/services/ai-transformation" },
    },
  },
  {
    _key: "agents",
    prompt: '"We need an AI agent"',
    details: "support, ops, decision-making",
    cta: {
      buttonText: "AI Agents",
      link: { _type: "link", linkType: "href", href: "/services/ai-transformation" },
    },
  },
  {
    _key: "readiness",
    prompt: '"We don\'t know where AI fits"',
    details: "EUR5K, 2-4 weeks, no commitment",
    cta: {
      buttonText: "AI Readiness Assessment",
      link: { _type: "link", linkType: "href", href: "/services/readiness" },
    },
  },
  {
    _key: "fde",
    prompt: '"We want someone embedded"',
    details: "3-6 months, on-site, proven ROI",
    cta: {
      buttonText: "Forward Deployed Engineer",
      link: { _type: "link", linkType: "href", href: "/contact" },
    },
  },
];

function CardLink({
  cta,
  className,
}: {
  cta?: ServiceNavigatorCard["cta"];
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <>
      <AnimatedBorder isHovered={isHovered} />
      <ArrowRightPixel
        color="currentColor"
        width={38}
        height={24}
        className="relative z-10 h-6 w-10 shrink-0"
      />
      <span className="relative z-10 font-funnel text-100 font-bold leading-[1.2]">
        {cta?.buttonText ?? "Learn more"}
      </span>
    </>
  );

  const interactiveClassName = `${className ?? ""} relative inline-flex items-center gap-3 px-2 py-1 transition-colors duration-200 ${
    isHovered ? "text-brand" : "text-black dark:text-[#efefef]"
  }`;

  if (cta?.link) {
    return (
      <ResolvedLink
        link={cta.link}
        className={interactiveClassName}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        {content}
      </ResolvedLink>
    );
  }

  return (
    <div
      className={interactiveClassName}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {content}
    </div>
  );
}

function ClosingLink({
  buttonText,
  link,
}: {
  buttonText?: string;
  link?: DereferencedLink;
}) {
  const content = (
    <>
      <span className="font-funnel text-[18px] leading-normal text-white">
        {buttonText ?? "Book a call"}
      </span>
      <ArrowRight color="#ffffff" width={38} height={24} className="h-6 w-10 shrink-0" />
    </>
  );

  const className =
    "inline-flex items-center justify-center gap-3 bg-brand px-6 py-3 transition-transform duration-200 hover:-translate-y-0.5";

  if (link) {
    return (
      <ResolvedLink link={link} className={className}>
        {content}
      </ResolvedLink>
    );
  }

  return <div className={className}>{content}</div>;
}

export function ServiceNavigator({ data }: { data?: ServiceNavigatorData }) {
  const cleanData = data ? cleanStega(data) : data;
  const cards = cleanData?.cards?.filter((card) => card?.prompt || card?.cta?.buttonText) ?? [];

  const navigator = {
    eyebrow: cleanData?.eyebrow ?? "WHAT WE DO",
    headingRegular: cleanData?.headingRegular ?? "Not sure which service you need?",
    headingBold: cleanData?.headingBold ?? "Start here.",
    cards: cards,
    closingText:
      cleanData?.closingText ??
      "Still unsure? Book a 30-min call - we'll figure it out together",
    closingCta: cleanData?.closingCta ?? {
      buttonText: "Book a call",
      link: { _type: "link", linkType: "href", href: "/contact" },
    },
  };
  const cardRows: Array<typeof navigator.cards> = [];

  for (let index = 0; index < navigator.cards.length; index += 2) {
    cardRows.push(navigator.cards.slice(index, index + 2));
  }

  return (
    <SectionsWrapper
      id="service-navigator"
      eyebrow={navigator.eyebrow}
      classNameOverride="px-0 pb-24"
    >
      <div className="flex flex-col gap-12">
        <div className="px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <h2 className="font-funnel text-[36px] leading-[1.15] tracking-[-0.8px] text-black dark:text-[#efefef] md:text-5xl md:tracking-[-1px]">
            <span className="text-black/70 dark:text-[#efefef]/70">
              {navigator.headingRegular}
            </span>
            <br />
            <span className="font-bold text-black dark:text-[#efefef]">
              {navigator.headingBold}
            </span>
          </h2>
        </div>

        <div className="border-t border-black/20 dark:border-white/20">
          <RevealOnScroll
            as="div"
            stagger={0.08}
            from="bottom"
            distance={24}
            duration={0.8}
            className="flex flex-col"
          >
            {cardRows.map((row, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                className="grid grid-cols-1 border-b border-black/20 dark:border-white/20 lg:grid-cols-2"
              >
                {row.map((card, columnIndex) => (
                  <div
                    key={card._key ?? `${card.prompt}-${rowIndex}-${columnIndex}`}
                    className={cn(
                      "flex p-6 md:p-8",
                      columnIndex === 0 && "lg:border-r lg:border-black/20 lg:dark:border-white/20"
                    )}
                  >
                    <article className="flex h-full w-full flex-col justify-between gap-12 border border-black/10 bg-black/4 p-8 dark:border-white/10 dark:bg-[#0f0f0f] md:p-12">
                      <div className="flex flex-col gap-3">
                        {card.prompt ? (
                          <h3 className="font-funnel text-[28px] leading-[1.2] tracking-[-0.8px] text-black dark:text-[#efefef] md:text-4xl md:tracking-[-1px]">
                            {card.prompt}
                          </h3>
                        ) : null}
                        {card.details ? (
                          <p className="font-funnel text-[18px] leading-normal text-black/70 dark:text-[#efefef]/70">
                            {card.details}
                          </p>
                        ) : null}
                      </div>

                      <CardLink cta={card.cta} className="self-start" />
                    </article>
                  </div>
                ))}

                {row.length === 1 ? (
                  <div
                    aria-hidden="true"
                    className="hidden lg:block"
                  />
                ) : null}
              </div>
            ))}
          </RevealOnScroll>
        </div>

        <div className="flex flex-col gap-6 px-6 md:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 xl:px-12 2xl:px-16">
          <p className="font-funnel max-w-2/3 text-[28px] leading-[1.2] tracking-[-0.8px] text-black dark:text-[#efefef] md:text-4xl md:tracking-[-1px]">
            {navigator.closingText}
          </p>
          <Button>
            <p className="text-white font-funnel text-[18px] leading-normal">
              {navigator.closingCta.buttonText}
            </p>
          </Button>
        </div>
      </div>
    </SectionsWrapper>
  );
}
