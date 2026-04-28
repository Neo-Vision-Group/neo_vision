"use client";

import dynamic from "next/dynamic";

import { CountingNumber } from "@/components/partials/motion/CountingNumber";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  { ssr: false }
);

export type HeroStat = {
  number: number;
  suffix?: string;
  label: string;
};

export function HeroStats({
  stats,
  delay = 0,
  variant = "default",
}: {
  stats?: HeroStat[];
  delay?: number;
  variant?: "default" | "contactDark";
}) {
  if (!stats?.length) {
    return null;
  }

  return (
    <RevealOnScroll
      as="div"
      className={
        variant === "contactDark"
          ? "flex flex-col gap-3 p-3 md:flex-row md:items-stretch md:gap-3"
          : "flex flex-col gap-3 md:flex-row md:items-stretch"
      }
      stagger={0.1}
      delay={delay}
    >
      {stats.map((stat, idx) => (
        <div
          key={`${stat.number}-${stat.label}-${idx}`}
          className="contents"
        >
          <StatCard stat={stat} variant={variant} />
          {idx < stats.length - 1 ? (
            <div className="hidden md:flex md:flex-row md:items-center md:self-stretch">
              <div className="h-full w-px bg-white/20" />
            </div>
          ) : null}
        </div>
      ))}
    </RevealOnScroll>
  );
}

function StatCard({
  stat,
  variant,
}: {
  stat: HeroStat;
  variant: "default" | "contactDark";
}) {
  if (variant === "contactDark") {
    return (
      <div className="flex flex-1 flex-col items-start justify-center border border-white/20 dark:bg-[#0f0f0f] bg-white p-6 md:min-h-22">
        <div className="flex w-full flex-col gap-3">
          <div className="font-betatron text-4xl leading-[1.2] text-brand">
            <CountingNumber
              value={stat.number}
              suffix={stat.suffix}
              duration={2000}
            />
          </div>
          <p className="w-full font-funnel text-[14px] leading-[1.2] tracking-[-0.5px] dark:text-[#efefef] text-foreground">
            {stat.label}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-start justify-center border border-white/20 bg-[#EFEFEFB3] p-6 dark:bg-black">
      <div className="flex flex-col gap-3">
        <div className="font-betatron text-4xl leading-[1.2] tracking-[-2.88px] text-brand">
          <CountingNumber
            value={stat.number}
            suffix={stat.suffix}
            duration={2000}
          />
        </div>
        <p className="w-full font-funnel text-100 font-bold leading-[1.2] text-foreground">
          {stat.label}
        </p>
      </div>
    </div>
  );
}
