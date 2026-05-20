"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cleanStega, urlForImage } from "@/sanity/lib/utils";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import TeamArrowLeft from '@/components/icons/TeamArrowLeft'
import TeamArrowRight from '@/components/icons/TeamArrowRight'
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import Image from "next/image";

const SplitTextReveal = dynamic(
  () =>
    import("@/components/partials/motion/SplitTextReveal").then(
      (mod) => mod.SplitTextReveal
    ),
  { ssr: false }
);

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  portrait?: Record<string, unknown>;
  order?: number;
};

export type TeamData = {
  eyebrow?: string;
  heading?: string;
  members?: Array<TeamMember>;
  closingStatement?: string;
};

export function Team({ data }: { data?: TeamData }) {
  const cleanData = data ? cleanStega(data) : data;

  const team = {
    eyebrow: cleanData?.eyebrow?.trim(),
    heading: cleanData?.heading?.trim(),
    members:
      cleanData?.members
        ?.filter(
          (member) =>
            member.name?.trim() && member.role?.trim() && member.bio?.trim(),
        )
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) ?? [],
    closingStatement: cleanData?.closingStatement?.trim(),
  };

  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isDarkTheme = !mounted || theme === "dark";
  const arrowColor = isDarkTheme ? "#efefef" : "#0f0f0f";

  const hasMultiple = team.members.length > 1;
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const id = setTimeout(() => setMounted(true), 0); return () => clearTimeout(id); }, []);

  const scroll = useCallback((dir: "prev" | "next") => {
    if (!scrollerRef.current) return;
    const items = Array.from(scrollerRef.current.querySelectorAll("[data-member]"));
    if (items.length === 0) return;

    // Find current centered item or closest to center
    const scrollerRect = scrollerRef.current.getBoundingClientRect();
    const scrollerCenter = scrollerRect.left + scrollerRect.width / 2;

    let currentIndex = 0;
    let minDistance = Infinity;

    items.forEach((item, i) => {
      const el = item as HTMLElement;
      const rect = el.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const distance = Math.abs(scrollerCenter - itemCenter);
      if (distance < minDistance) {
        minDistance = distance;
        currentIndex = i;
      }
    });

    const nextIndex =
      dir === "next"
        ? Math.min(currentIndex + 1, items.length - 1)
        : Math.max(currentIndex - 1, 0);

    const targetItem = items[nextIndex] as HTMLElement;
    const targetRect = targetItem.getBoundingClientRect();
    const scrollLeft =
      scrollerRef.current.scrollLeft +
      (targetRect.left - scrollerRect.left) -
      (scrollerRect.width / 2 - targetRect.width / 2);

    scrollerRef.current.scrollTo({
      left: scrollLeft,
      behavior: "smooth",
    });
  }, [scrollerRef]);

  if (!team.heading && team.members.length === 0 && !team.closingStatement) {
    return null;
  }

  return (
    <SectionsWrapper id="the-team" eyebrow={team.eyebrow}>
      <div className="flex flex-col gap-12">
        <SplitTextReveal
          className="block text-balance text-3xl leading-9 tracking-[-0.3px] whitespace-normal md:text-[36px] md:leading-12 lg:text-[44px] lg:leading-14 2xl:text-5xl 2xl:leading-14.5 2xl:tracking-[-0.4px]"
          type="words"
          as="h2"
          stagger={0.04}
          colorReveal
        >
          {team.heading}
        </SplitTextReveal>

        <div className="relative">
          <div
            ref={scrollerRef}
            className="no-scrollbar flex gap-24 overflow-x-auto pb-12"
          >
            {team.members.map((member, i) => {
              const portraitUrl = member.portrait
                ? urlForImage(member.portrait)?.width(858).height(1046).fit("crop").url()
                : typeof member.portrait === 'string' ? member.portrait : null;

              return (
                <div
                  key={i}
                  data-member
                  className="flex shrink-0 flex-col items-start gap-12 md:items-center lg:flex-row justify-between"
                >
                  <div className="flex min-w-0 flex-1 flex-col items-end">
                    <div className="flex min-w-0 w-full flex-col gap-12 md:max-w-2xl md:gap-16 md:py-6 lg:max-w-3xl">
                      <div className="flex min-w-0 flex-col gap-12">
                        <div className="flex flex-col gap-6">
                          <div className="flex min-w-0 flex-col">
                            <p className="font-funnel text-[32px] leading-[1.08] tracking-[-0.9px] text-muted dark:text-muted md:text-[48px] lg:text-[56px]">
                              {member.name}
                            </p>
                            <p className="font-funnel text-64 text-muted dark:text-muted md:text-[18px]">
                              {member.role}
                            </p>
                          </div>
                          <div className="h-px w-full bg-decoration-dark dark:bg-decoration-light" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-funnel text-64 leading-normal text-foreground md:text-[18px]">
                            {member.bio}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-white dark:bg-dark md:w-108">
                    <BinaryGlitchField />
                    <div className="absolute inset-0" />
                    {portraitUrl && (
                      <div className="absolute inset-0 z-10 overflow-hidden">
                        <div className="relative size-full">
                          <Image
                            src={portraitUrl}
                            alt={member.name}
                            className="object-cover"
                            fill
                            sizes="(min-width: 768px) 432px, 100vw"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {hasMultiple && (
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                aria-label="Previous team member"
                onClick={() => scroll("prev")}
                className="group flex size-12 items-center justify-center transition-colors"
              >
                <TeamArrowLeft key={arrowColor} color={arrowColor} />
              </button>
              <button
                type="button"
                aria-label="Next team member"
                onClick={() => scroll("next")}
                className="group flex size-12 items-center justify-center transition-colors"
              >
                <TeamArrowRight key={arrowColor} color={arrowColor} />
              </button>
            </div>
          )}
        </div>

        {team.closingStatement && (
          <div className="leading-8 text-foreground">
            <ClosingStatement parts={team.closingStatement} />
          </div>
        )}
      </div>
    </SectionsWrapper>
  );
}

function BinaryGlitchField() {
  const [mounted, setMounted] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const initId = setTimeout(() => {
      setMounted(true);
      setLines(createBinaryLines());
    }, 0);

    if (mediaQuery?.matches) {
      return () => clearTimeout(initId);
    }

    const interval = window.setInterval(() => {
      setLines(createBinaryLines());
    }, 70);

    return () => {
      clearTimeout(initId);
      window.clearInterval(interval);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-[-8%] overflow-hidden">
      <div className="absolute inset-0" />
      <div className="absolute inset-0 text-[22px] bg-white dark:bg-dark uppercase leading-[1.05] tracking-[0.24em] text-decoration-dark dark:text-decoration-light md:text-[28px]" style={{ fontFamily: "'OHMonoVF', monospace" }}>
        {lines.map((line, index) => (
          <p
            key={`${index}-${line.slice(0, 10)}`}
            className="whitespace-nowrap"
            style={{
              transform: `translate3d(${index % 2 === 0 ? "-3%" : "1%"}, ${
                index * 92
              }%, 0)`,
            }}
          >
            {line}
          </p>
        ))}
      </div>
      <div className="absolute inset-0" />
    </div>
  );
}

function createBinaryLines(lineCount = 9, lineLength = 28) {
  return Array.from({ length: lineCount }, () =>
    Array.from({ length: lineLength }, () =>
      Math.random() > 0.5 ? "1" : "0"
    ).join("")
  );
}

function ClosingStatement({
  parts,
}: {
  parts: string;
}) {
  return (
    <span className="dark:text-[#efefef] text-[#040404] text-xl md:text-2xl lg:text-3xl font-funnel">
      {parts}
    </span>
  );
}
