"use client";

import { useEffect, useRef, useState } from "react";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { Logo } from "@/components/icons/Logo";
import { cn } from "@/lib/utils";
import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";

const SplitTextReveal = dynamic(
  () =>
    import("@/components/partials/motion/SplitTextReveal").then(
      (mod) => mod.SplitTextReveal
    ),
  { ssr: false }
);

export type StoryData = {
  eyebrow?: string;
  heading?: string;
  milestones?: Array<{ year: string; body: string }>;
};

export function Story({ data }: { data?: StoryData }) {
  const cleanData = data ? cleanStega(data) : data;

  const story = {
    eyebrow: cleanData?.eyebrow?.trim(),
    heading: cleanData?.heading?.trim(),
    milestones:
      cleanData?.milestones
        ?.map((milestone) => {
          const year = milestone.year?.trim();
          const body = milestone.body?.trim();

          if (!year || !body) {
            return null;
          }

          return { year, body };
        })
        .filter((milestone): milestone is NonNullable<typeof milestone> => Boolean(milestone)) ?? [],
  };

  if (!story.heading && story.milestones.length === 0) {
    return null;
  }

  const scrollerRef = useRef<HTMLOListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [edgePadding, setEdgePadding] = useState(24);
  const [scrollProgress, setScrollProgress] = useState(0);

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

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let frameId = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const getItems = () =>
      Array.from(scroller.querySelectorAll<HTMLLIElement>("li[data-milestone]"));

    const updateEdgePadding = () => {
      const [firstItem] = getItems();
      if (!firstItem) return;

      const nextPadding = Math.max(
        24,
        (scroller.clientWidth - firstItem.offsetWidth) / 2
      );

      setEdgePadding((current) =>
        Math.abs(current - nextPadding) < 1 ? current : nextPadding
      );
    };

    const updateActiveIndex = () => {
      const items = getItems();
      if (items.length === 0) return;

      const scrollerRect = scroller.getBoundingClientRect();
      const scrollerCenter = scrollerRect.left + scrollerRect.width / 2;
      const inactiveScale = window.innerWidth >= 768 ? 56 / 96 : 0.625;
      const activationDistance = Math.max(scrollerRect.width * 0.35, 1);
      const metrics = items.map((item, index) => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distance = Math.abs(scrollerCenter - itemCenter);
        const progress = Math.max(0, 1 - distance / activationDistance);

        return { item, index, distance, progress };
      });

      let nextActiveIndex = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      metrics.forEach(({ index, distance }) => {
        if (distance < minDistance) {
          minDistance = distance;
          nextActiveIndex = index;
        }
      });

      metrics.forEach(({ item, index, progress }) => {
        const storyItem = item.querySelector<HTMLElement>("[data-story-item]");
        const scale = inactiveScale + (1 - inactiveScale) * progress;
        const itemOpacity = 0.2 + progress * 0.8;

        storyItem && (storyItem.style.opacity = String(itemOpacity));

        if (storyItem) {
          storyItem.style.transform = reducedMotion.matches
            ? index === nextActiveIndex
              ? "scale(1)"
              : `scale(${inactiveScale})`
            : `scale(${scale})`;
        }
      });

      setActiveIndex((current) =>
        current === nextActiveIndex ? current : nextActiveIndex
      );
    };

    const updateScrollProgress = () => {
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      if (maxScroll <= 0) {
        setScrollProgress(0);
        return;
      }
      const progress = scroller.scrollLeft / maxScroll;
      setScrollProgress(Math.max(0, Math.min(1, progress)));
    };

    const syncScroller = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        updateEdgePadding();
        updateActiveIndex();
        updateScrollProgress();
      });
    };

    // Force first item to be visually active on mount
    const initializeFirstItemActive = () => {
      const items = getItems();
      if (items.length === 0) return;

      const inactiveScale = window.innerWidth >= 768 ? 56 / 96 : 0.625;

      items.forEach((item, index) => {
        const storyItem = item.querySelector<HTMLElement>("[data-story-item]");
        if (!storyItem) return;

        if (index === 0) {
          storyItem.style.opacity = "1";
          storyItem.style.transform = "scale(1)";
        } else {
          storyItem.style.opacity = "0.2";
          storyItem.style.transform = reducedMotion.matches
            ? `scale(${inactiveScale})`
            : `scale(${inactiveScale})`;
        }
      });

      setActiveIndex(0);
    };

    initializeFirstItemActive();
    updateEdgePadding();
    scroller.addEventListener("scroll", syncScroller, { passive: true });
    window.addEventListener("resize", syncScroller);

    return () => {
      cancelAnimationFrame(frameId);
      scroller.removeEventListener("scroll", syncScroller);
      window.removeEventListener("resize", syncScroller);
    };
  }, [story.milestones.length]);

  return (
    <SectionsWrapper id="our-story" eyebrow={story.eyebrow}>
      <div className="flex flex-col gap-12">
        <SplitTextReveal
          duration={0.6}
          as="h2"
          type="words"
          stagger={0.04}
          colorReveal
          className="text-4xl leading-[1.2] tracking-[-1px]  md:text-5xl max-w-225"
        >
            {story.heading}
        </SplitTextReveal>

        <div className="relative -mx-6">
          {/* Storyline tracker */}
          <div className="relative mb-8 px-6 md:mb-12">
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                className="absolute left-0 top-0 h-full bg-brand transition-all duration-75 ease-out"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
            {/* Moving logo point */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-75 ease-out"
              style={{ left: `${scrollProgress * 100}%` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand shadow-lg">
                <Logo className="h-6 w-6" darkMode accentColor="#efefef" />
              </div>
            </div>
          </div>
          <ol
            ref={scrollerRef}
            className="no-scrollbar story-scroller flex flex-col gap-8 overflow-x-auto px-6 md:flex-row md:gap-16 md:pt-12 md:pb-4 cursor-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iI2ZmNDEwMCIgLz4KICA8cGF0aCBkPSJNMTIgMjBMMTYgMTZNMTIgMjBMMTYgMjRNMTIgMjBIMjgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CiAgPHBhdGggZD0iTTI4IDIwTDI0IDE2TTI4IDIwTDI0IDI0IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4=')_20_20,grab] active:cursor-grabbing"
            style={{
              paddingLeft: edgePadding,
              paddingRight: edgePadding,
            }}
          >
            {story.milestones.map((m, idx) => (
              <li
                key={m.year + idx}
                data-milestone
                data-active={idx === activeIndex ? "true" : "false"}
                className={cn(
                  "relative flex w-full shrink-0 flex-col gap-2 transition-opacity duration-300 ease-out md:w-85 lg:w-100 xl:w-120 2xl:w-138"
                )}
              >
                <div className="flex flex-col gap-0.5" data-story-item>
                  <span
                    className={cn(
                      "block origin-left font-betatron capitalize text-brand text-8xl leading-none tracking-[-3.84px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none md:text-[96px] md:tracking-[-5.76px]"
                    )}
                  >
                    {m.year}
                  </span>
                  <p className="py-4 text-4xl leading-[1.2] tracking-[-1px] text-foreground md:py-12 md:text-4xl 2xl:text-4xl">
                    {m.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </SectionsWrapper>
  );
}
