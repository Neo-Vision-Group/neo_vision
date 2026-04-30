"use client";

import { useEffect, useRef, useState } from "react";
import { cleanStega, urlForImage } from "@/sanity/lib/utils";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "@/components/partials/motion/gsap-setup";
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
  portrait?: any;
  order?: number;
};

type ClosingStatementPart = string | { bold: string };
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

  if (!team.heading && team.members.length === 0 && !team.closingStatement) {
    return null;
  }

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDarkTheme = !mounted || resolvedTheme === "dark";
  const arrowColor = isDarkTheme ? "#EFEFEF" : "#0F0F0F";
  const arrowButtonClassName = isDarkTheme
    ? "border-white/10 hover:bg-white/5"
    : "border-black/10 hover:bg-black/5";

  useEffect(() => {
    setMounted(true);
  }, []);

  // ----- Pointer drag-to-scroll with pointer capture -------------------
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let activePointerId: number | null = null;
    let startX = 0;
    let startScroll = 0;

    function onDown(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      activePointerId = e.pointerId;
      startX = e.pageX - el!.offsetLeft;
      startScroll = el!.scrollLeft;
      el!.dataset.grabbing = "true";
      el!.setPointerCapture(e.pointerId);
      e.preventDefault();
      window.getSelection()?.removeAllRanges();
    }
    function onMove(e: PointerEvent) {
      if (activePointerId !== e.pointerId) return;
      const x = e.pageX - el!.offsetLeft;
      el!.scrollLeft = startScroll - (x - startX);
    }
    function onRelease(e: PointerEvent) {
      if (activePointerId !== e.pointerId) return;
      activePointerId = null;
      delete el!.dataset.grabbing;
      if (el!.hasPointerCapture(e.pointerId)) {
        el!.releasePointerCapture(e.pointerId);
      }
    }

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onRelease);
    el.addEventListener("pointercancel", onRelease);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onRelease);
      el.removeEventListener("pointercancel", onRelease);
    };
  }, []);

  // ----- Scroll-linked opacity fade ------------------------------------
  useGSAP(
    () => {
      const scroller = scrollerRef.current;
      if (!scroller) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          reduced: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const items = Array.from(
            scroller.querySelectorAll<HTMLDivElement>("[data-member]")
          );
          if (ctx.conditions?.reduced) {
            gsap.set(items, { opacity: 1 });
            return;
          }

          items.forEach((item, idx) => {
            gsap.set(item, { opacity: idx === 0 ? 1 : 0.2 });
          });

          const triggers: ScrollTrigger[] = [];
          items.forEach((item, idx) => {
            if (idx === 0) return;
            const st = ScrollTrigger.create({
              trigger: item,
              scroller,
              horizontal: true,
              start: "left 70%",
              end: "left 40%",
              scrub: 0.5,
              animation: gsap.to(item, { opacity: 1, ease: "none" }),
            });
            triggers.push(st);
          });

          return () => {
            triggers.forEach((t) => t.kill());
          };
        }
      );
    },
    { dependencies: [team.members] }
  );

  const hasMultiple = team.members.length > 1;

  const scroll = (dir: "prev" | "next") => {
    if (!scrollerRef.current) return;
    const items = Array.from(scrollerRef.current.querySelectorAll("[data-member]"));
    if (items.length === 0) return;

    // Find current centered item or closest to center
    const scrollerRect = scrollerRef.current.getBoundingClientRect();
    const scrollerCenter = scrollerRect.left + scrollerRect.width / 2;

    let currentIndex = 0;
    let minDistance = Infinity;

    items.forEach((item, i) => {
      const rect = item.getBoundingClientRect();
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
  };

  return (
    <SectionsWrapper id="the-team" eyebrow={team.eyebrow} hideTopBorder>
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
            className="no-scrollbar flex overflow-x-auto px-6 pb-12 md:px-12 cursor-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iI2ZmNDEwMCIgLz4KICA8cGF0aCBkPSJNMTIgMjBMMTYgMTZNMTIgMjBMMTYgMjRNMTIgMjBIMjgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CiAgPHBhdGggZD0iTTI4IDIwTDI0IDE2TTI4IDIwTDI0IDI0IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4=')_20_20,grab] active:cursor-grabbing"
          >
            {team.members.map((member, i) => {
              const portraitUrl = member.portrait
                ? urlForImage(member.portrait)?.width(858).height(1046).fit("crop").url()
                : typeof member.portrait === 'string' ? member.portrait : null;

              return (
                <div
                  key={i}
                  data-member
                  className="flex w-[85vw] shrink-0 flex-col items-start gap-12 pr-24 md:w-[70vw] md:items-center md:pr-48 lg:flex-row"
                >
                  <div className="flex min-w-0 flex-1 flex-col items-end">
                    <div className="flex min-w-0 w-full flex-col gap-12 md:max-w-[42rem] md:gap-16 md:py-6 lg:max-w-[48rem]">
                      <div className="flex min-w-0 flex-col gap-12 md:px-6">
                        <div className="flex flex-col gap-6">
                          <div className="flex min-w-0 flex-col px-6">
                            {hasMultiple && (
                              <div className="mb-6 flex items-center gap-3">
                                <button
                                  type="button"
                                  aria-label="Previous team member"
                                  onClick={() => scroll("prev")}
                                  className={`group flex size-12 items-center justify-center rounded-full border transition-colors ${arrowButtonClassName}`}
                                >
                                  <TeamArrowLeft color={arrowColor} />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Next team member"
                                  onClick={() => scroll("next")}
                                  className={`group flex size-12 items-center justify-center rounded-full border transition-colors ${arrowButtonClassName}`}
                                >
                                  <TeamArrowRight color={arrowColor} />
                                </button>
                              </div>
                            )}
                            <p className="font-funnel text-[34px] leading-[1.08] tracking-[-0.9px] text-foreground md:text-[48px] lg:text-[56px]">
                              {member.name}
                            </p>
                            <p className="font-funnel text-64 leading-normal text-[#EFEFEFB3] md:text-[18px]">
                              {member.role}
                            </p>
                          </div>
                          <div className="h-px w-full bg-white/20" />
                        </div>
                        <div className="min-w-0 px-6">
                          <p className="font-funnel text-64 leading-normal text-foreground md:text-[18px]">
                            {member.bio}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative aspect-429/523 w-full shrink-0 overflow-hidden bg-black md:w-108">
                    <BinaryGlitchField />
                    <div className="absolute inset-0" />
                    {portraitUrl && (
                      <div className="absolute inset-x-[12%] bottom-0 top-[12%] overflow-hidden border border-white/10 bg-black/20 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] md:inset-x-[14%] md:top-[13%]">
                        <div className="relative size-full">
                          <Image
                            src={portraitUrl}
                            alt={member.name}
                            className="object-cover"
                            fill
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 md:px-12">
          {team.closingStatement && (
            <div className="leading-8 text-foreground">
              <ClosingStatement parts={team.closingStatement} />
            </div>
          )}
        </div>
      </div>
    </SectionsWrapper>
  );
}

function BinaryGlitchField() {
  const [lines, setLines] = useState(() => createBinaryLines());

  useEffect(() => {
    const mediaQuery =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    if (mediaQuery?.matches) {
      return;
    }

    const interval = window.setInterval(() => {
      setLines(createBinaryLines());
    }, 70);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="absolute inset-[-8%] overflow-hidden opacity-90">
      <div className="absolute inset-0" />
      <div className="absolute inset-0 font-mono text-[22px] uppercase leading-[1.05] tracking-[0.24em] text-white/40 md:text-[28px]">
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
    <span className="dark:text-[#efefefb3] text-[#040404b3] text-xl md:text-2xl lg:text-3xl font-funnel">
      {parts}
    </span>
  );
}
