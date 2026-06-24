"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cleanStega, urlForImage } from "@/sanity/lib/utils";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import TeamArrowLeft from '@/components/icons/TeamArrowLeft'
import TeamArrowRight from '@/components/icons/TeamArrowRight'
import LinkedInIcon from '@/components/icons/LinkedInIcon'
import { AnimatedBorder } from '@/components/AnimatedBorder'
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import Image from "next/image";
import BinaryGlitchField from "@/components/partials/BinaryGlitchField";

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
  linkedin?: string;
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
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [animKeys, setAnimKeys] = useState<Record<number, number>>({});
  const [isFullyInView, setIsFullyInView] = useState(false);

  useEffect(() => { const id = setTimeout(() => setMounted(true), 0); return () => clearTimeout(id); }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFullyInView(entry.isIntersecting && entry.intersectionRatio >= 1);
      },
      { threshold: 1 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !hasMultiple) return;

    const updateScrollState = () => {
      const atStart = el.scrollLeft <= 1;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
      setCanScrollPrev(!atStart);
      setCanScrollNext(!atEnd);
    };

    const handleUserScroll = () => {
      if (!isProgrammaticScrollRef.current) {
        autoStoppedRef.current = true;
      }
    };

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    el.addEventListener("scroll", handleUserScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      el.removeEventListener("scroll", handleUserScroll);
    };
  }, [hasMultiple]);

  const scrollAnimRef = useRef<number>(0);
  const autoStoppedRef = useRef(false);
  const autoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isProgrammaticScrollRef = useRef(false);

  const scrollToIndex = useCallback((targetIndex: number) => {
    if (!scrollerRef.current) return;
    const items = Array.from(scrollerRef.current.querySelectorAll("[data-member]"));
    if (items.length === 0) return;

    const scrollerRect = scrollerRef.current.getBoundingClientRect();
    const targetItem = items[targetIndex] as HTMLElement;
    const targetRect = targetItem.getBoundingClientRect();
    const targetScrollLeft =
      scrollerRef.current.scrollLeft +
      (targetRect.left - scrollerRect.left) -
      (scrollerRect.width / 2 - targetRect.width / 2);

    const startScrollLeft = scrollerRef.current.scrollLeft;
    const delta = targetScrollLeft - startScrollLeft;
    const duration = 700;
    const startTime = performance.now();

    cancelAnimationFrame(scrollAnimRef.current);

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const el = scrollerRef.current;
    el.style.scrollSnapType = "none";
    isProgrammaticScrollRef.current = true;

    const step = (now: number) => {
      if (!scrollerRef.current) return;
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      scrollerRef.current.scrollLeft = startScrollLeft + delta * easeOutCubic(t);
      if (t < 1) {
        scrollAnimRef.current = requestAnimationFrame(step);
      } else {
        scrollerRef.current.style.scrollSnapType = "";
        isProgrammaticScrollRef.current = false;
      }
    };

    scrollAnimRef.current = requestAnimationFrame(step);

    setAnimKeys(prev => ({ ...prev, [targetIndex]: (prev[targetIndex] ?? 0) + 1 }));
  }, [scrollerRef]);

  const scroll = useCallback((dir: "prev" | "next") => {
    if (!scrollerRef.current) return;
    const items = Array.from(scrollerRef.current.querySelectorAll("[data-member]"));
    if (items.length === 0) return;

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

    scrollToIndex(nextIndex);
  }, [scrollerRef, scrollToIndex]);

  const handleArrowClick = useCallback((dir: "prev" | "next") => {
    autoStoppedRef.current = true;
    scroll(dir);
  }, [scroll]);

  useEffect(() => {
    if (!hasMultiple || !isFullyInView) return;
    autoIntervalRef.current = setInterval(() => {
      if (autoStoppedRef.current) return;
      const el = scrollerRef.current;
      if (!el) return;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
      if (atEnd) {
        scrollToIndex(0);
      } else {
        scroll("next");
      }
    }, 4000);
    return () => {
      if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
      autoIntervalRef.current = null;
    };
  }, [hasMultiple, isFullyInView, scroll, scrollToIndex]);

  if (!team.heading && team.members.length === 0 && !team.closingStatement) {
    return null;
  }

  return (
    <SectionsWrapper id="the-team" eyebrow={team.eyebrow}>
      <div ref={sectionRef} className="flex flex-col gap-12">
        <SplitTextReveal
          className="block text-balance text-3xl leading-12 tracking-[-0.3px] whitespace-normal md:text-[36px] md:leading-12 lg:text-[44px] lg:leading-14 2xl:text-5xl 2xl:leading-14.5 2xl:tracking-[-0.4px]"
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
            className="no-scrollbar grid grid-flow-col auto-cols-[100%] overflow-x-auto snap-x snap-mandatory"
          >
            {team.members.map((member, i) => {
              const portraitUrl = member.portrait
                ? typeof member.portrait === 'string'
                  ? member.portrait
                  : (() => {
                      const { crop, hotspot, ...rest } = member.portrait as Record<string, unknown>;
                      void crop;
                      void hotspot;
                      return urlForImage(rest)?.width(858).fit("clip").url();
                    })()
                : null;

              return (
                <div
                  key={i}
                  data-member
                  className="flex w-full shrink-0 snap-start flex-col md:gap-8 lg:flex-row lg:justify-between lg:items-stretch"
                >
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex min-w-0 w-full flex-col gap-12 pb-5 md:gap-16 md:py-6 md:pb-20 lg:pr-12">
                      {hasMultiple && (
                        <div className="flex lg:hidden items-center gap-3">
                          <button
                            type="button"
                            aria-label="Previous team member"
                            onClick={() => handleArrowClick("prev")}
                            disabled={!canScrollPrev}
                            className="group flex size-12 items-center justify-center disabled:transition-colors disabled:opacity-30"
                          >
                            <TeamArrowLeft color={arrowColor} disabled={!canScrollPrev} />
                          </button>
                          <button
                            type="button"
                            aria-label="Next team member"
                            onClick={() => handleArrowClick("next")}
                            disabled={!canScrollNext}
                            className="group flex size-12 items-center justify-center disabled:transition-colors disabled:opacity-30"
                          >
                            <TeamArrowRight color={arrowColor} disabled={!canScrollNext} />
                          </button>
                        </div>
                      )}
                      <div className="flex min-w-0 flex-col gap-12 text-left">
                        <div className="flex flex-col gap-6">
                          <div className="flex min-w-0 flex-col">
                            <div className="flex items-center justify-between gap-4">
                              <p className="font-funnel text-[32px] leading-[1.08] tracking-[-0.9px] text-muted dark:text-muted md:text-[48px] lg:text-[56px]">
                                {member.name}
                              </p>
                              {member.linkedin && (
                                <a
                                  href={member.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`${member.name} on LinkedIn`}
                                  className="group group/linkedin relative flex size-[50px] shrink-0 items-center justify-center bg-[var(--bg-card)] transition-colors hover:bg-[rgba(255,65,0,0.3)] active:bg-[var(--brand)]"
                                >
                                  <LinkedInIcon className="size-6 text-black dark:text-white transition-colors group-active/linkedin:text-white" />
                                  <AnimatedBorder groupHover />
                                </a>
                              )}
                            </div>
                            <p className="font-funnel text-64 text-muted dark:text-muted md:text-[14px]">
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

                  <div className="relative w-full max-w-[360px] self-center lg:self-start lg:max-w-none lg:w-108">
                    <div className="relative aspect-square w-full max-w-[360px] shrink-0 overflow-hidden bg-white dark:bg-dark lg:max-w-none lg:w-108">
                      <BinaryGlitchField key={`${i}-${animKeys[i] ?? 0}`} isDark={isDarkTheme} />
                      <div className="absolute inset-0" />
                      {portraitUrl && (
                        <div className="absolute inset-0 z-10 overflow-hidden">
                          <Image
                            src={portraitUrl}
                            alt={member.name}
                            className="object-contain"
                            fill
                            sizes="(min-width: 1024px) 432px, 100vw"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {hasMultiple && (
            <>
              {/* Desktop/Laptop (lg+) - bottom left, moved lower to avoid text overlap */}
              <div className="hidden lg:flex absolute bottom-4 left-0 z-10 items-center gap-3">
                <button
                  type="button"
                  aria-label="Previous team member"
                  onClick={() => handleArrowClick("prev")}
                  disabled={!canScrollPrev}
                  className="group flex size-12 items-center justify-center transition-colors disabled:opacity-30"
                >
                  <TeamArrowLeft color={arrowColor} disabled={!canScrollPrev} />
                </button>
                <button
                  type="button"
                  aria-label="Next team member"
                  onClick={() => handleArrowClick("next")}
                  disabled={!canScrollNext}
                  className="group flex size-12 items-center justify-center transition-colors disabled:opacity-30"
                >
                  <TeamArrowRight color={arrowColor} disabled={!canScrollNext} />
                </button>
              </div>

            </>
          )}
        </div>

        {team.closingStatement && (
          <div className="">
            <ClosingStatement parts={team.closingStatement} />
          </div>
        )}
      </div>
    </SectionsWrapper>
  );
}

function ClosingStatement({
  parts,
}: {
  parts: string;
}) {
  return (
    <span className="dark:text-[#efefef] text-[#040404] text-[32px] font-funnel">
      {parts}
    </span>
  );
}
