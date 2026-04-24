"use client";

import { cn } from "@/lib/utils";
import { CountingNumber } from "@/components/partials/motion/CountingNumber";
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

export type HeadingShape =
  | string
  | {
      faded?: string | null;
      bold?: string | null;
      trailing?: string | null;
      regular?: string | null;
    };

export type PageHeroData = {
  eyebrow?: string;
  headingType?: 'simple' | 'multipart';
  heading?: string;
  headingMultipart?: {
    faded?: string | null;
    bold?: string | null;
    trailing?: string | null;
    regular?: string | null;
  };
  subheading?: string;
  stats?: Array<{
    number: number;
    suffix?: string;
    label: string;
  }>;
};

export function PageHero({ data }: { data?: PageHeroData }) {
  const cleanData = data ? cleanStega(data) : data;

  const eyebrow = cleanData?.eyebrow;
  const subheading = cleanData?.subheading;
  
  // Determine heading shape based on headingType
  let heading: HeadingShape;
  if (cleanData?.headingType === 'multipart' && cleanData?.headingMultipart) {
    heading = cleanData.headingMultipart;
  } else {
    heading = cleanData?.heading || '';
  }

  // Get stats
  const stats = cleanData?.stats;

  return (
    <section
      className={cn(
        "relative isolate flex w-full flex-col overflow-hidden border-b border-border bg-white dark:bg-background"
      )}
    >
      {/* Light mode video background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-white dark:hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover mix-blend-difference"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-brand mix-blend-screen" />
      </div>

      {/* Dark mode video background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden dark:block">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(0deg, #9D2B03 0%, #9D2B03 100%)" }}
        />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="relative flex flex-col gap-10 px-6 py-16 md:gap-14 md:px-6 md:py-24 lg:px-8 lg:py-28 xl:px-12 xl:py-32 2xl:px-16 2xl:py-40">
        {eyebrow ? (
          <p className="font-betatron text-[32px] leading-[1.2] uppercase text-brand">
            {eyebrow}
          </p>
        ) : null}

        <SplitTextReveal as="h1" className="block">
          <Heading value={heading} />
        </SplitTextReveal>

        {subheading ? (
          <RevealOnScroll
            as="p"
            className="max-w-[683px] font-funnel text-[18px] leading-normal text-foreground"
            delay={0.15}
          >
            {subheading}
          </RevealOnScroll>
        ) : null}

        {stats && stats.length > 0 ? (
          <RevealOnScroll
            as="div"
            className="flex flex-col gap-3 md:flex-row md:items-stretch"
            stagger={0.1}
            delay={0.25}
          >
            {stats.map((stat, idx) => (
              <>
                <StatCard key={idx} stat={stat} />
                {idx < stats.length - 1 && (
                  <div className="hidden md:flex md:flex-row md:items-center md:self-stretch">
                    <div className="h-full w-px bg-white/20" />
                  </div>
                )}
              </>
            ))}
          </RevealOnScroll>
        ) : null}
      </div>
    </section>
  );
}

function StatCard({
  stat,
}: {
  stat: { number: number; suffix?: string; label: string };
}) {
  return (
    <div className="flex flex-1 flex-col items-start dark:bg-black bg-[#EFEFEFB3] justify-center border border-white/20 p-6">
      <div className="flex flex-col gap-3">
        <p className="font-betatron text-[48px] leading-[1.2] tracking-[-2.88px] text-brand">
          <CountingNumber
            value={stat.number}
            suffix={stat.suffix}
            duration={2000}
          />
        </p>
        <p className="w-full font-funnel text-[24px] font-bold leading-[1.2] text-foreground">
          {stat.label}
        </p>
      </div>
    </div>
  );
}

function Heading({ value }: { value: HeadingShape }) {
  const base =
    "font-funnel text-[96px] capitalize leading-[1.2] tracking-[-1px] text-foreground";

  if (typeof value === "string") {
    return <span className={base}>{value}</span>;
  }

  const { faded, bold, trailing, regular } = value;
  return (
    <span className={base}>
      {faded ? <span className="text-foreground/70">{faded} </span> : null}
      {regular ? <span>{regular} </span> : null}
      {bold ? <span className="font-bold">{bold}</span> : null}
      {trailing ? (
        <>
          <br />
          <span className="text-foreground/70">{trailing}</span>
        </>
      ) : null}
    </span>
  );
}
