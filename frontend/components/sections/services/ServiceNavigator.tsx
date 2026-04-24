"use client";

import dynamic from "next/dynamic";
import ArrowRight from "@/components/icons/ArrowRight";
import ResolvedLink from "@/components/ResolvedLink";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { DereferencedLink } from "@/sanity/lib/types";
import { cleanStega } from "@/sanity/lib/utils";

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
  const content = (
    <>
      <ArrowRight
        color="currentColor"
        width={38}
        height={24}
        className="h-6 w-[38px] shrink-0"
      />
      <span className="font-funnel text-[24px] font-bold leading-[1.2] text-black transition-colors duration-200 dark:text-[#efefef]">
        {cta?.buttonText ?? "Learn more"}
      </span>
    </>
  );

  if (cta?.link) {
    return (
      <ResolvedLink
        link={cta.link}
        className={`${className ?? ""} group inline-flex items-center gap-3`}
      >
        {content}
      </ResolvedLink>
    );
  }

  return <div className={`${className ?? ""} inline-flex items-center gap-3`}>{content}</div>;
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
      <span className="font-funnel text-[18px] leading-[1.5] text-white">
        {buttonText ?? "Book a call"}
      </span>
      <ArrowRight color="#ffffff" width={38} height={24} className="h-6 w-[38px] shrink-0" />
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
    cards: cards.length > 0 ? cards : fallbackCards,
    closingText:
      cleanData?.closingText ??
      "Still unsure? Book a 30-min call - we'll figure it out together",
    closingCta: cleanData?.closingCta ?? {
      buttonText: "Book a call",
      link: { _type: "link", linkType: "href", href: "/contact" },
    },
  };

  return (
    <SectionsWrapper id="service-navigator" eyebrow={navigator.eyebrow}>
      <div className="flex flex-col gap-12 px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-[720px]">
          <h2 className="font-funnel text-[36px] leading-[1.15] tracking-[-0.8px] text-black dark:text-[#efefef] md:text-[48px] md:tracking-[-1px]">
            <span className="text-black/70 dark:text-[#efefef]/70">
              {navigator.headingRegular}
            </span>
            <br />
            <span className="font-bold text-black dark:text-[#efefef]">
              {navigator.headingBold}
            </span>
          </h2>
        </div>

        <RevealOnScroll
          as="div"
          stagger={0.08}
          from="bottom"
          distance={24}
          duration={0.8}
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          {navigator.cards.map((card, index) => (
            <article
              key={card._key ?? `${card.prompt}-${index}`}
              className="flex min-h-[290px] flex-col justify-between gap-10 border border-black/15 bg-black/[0.04] p-8 dark:border-white/20 dark:bg-[#0f0f0f] md:p-12"
            >
              <div className="flex flex-col gap-3">
                {card.prompt ? (
                  <h3 className="font-funnel text-[28px] leading-[1.2] tracking-[-0.8px] text-black dark:text-[#efefef] md:text-[32px] md:tracking-[-1px]">
                    {card.prompt}
                  </h3>
                ) : null}
                {card.details ? (
                  <p className="font-funnel text-[18px] leading-[1.5] text-black/70 dark:text-[#efefef]/70">
                    {card.details}
                  </p>
                ) : null}
              </div>

              <CardLink cta={card.cta} className="self-start text-black dark:text-[#efefef]" />
            </article>
          ))}
        </RevealOnScroll>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-[760px] font-funnel text-[28px] leading-[1.2] tracking-[-0.8px] text-black dark:text-[#efefef] md:text-[32px] md:tracking-[-1px]">
            {navigator.closingText}
          </p>
          <ClosingLink
            buttonText={navigator.closingCta.buttonText}
            link={navigator.closingCta.link}
          />
        </div>
      </div>
    </SectionsWrapper>
  );
}
