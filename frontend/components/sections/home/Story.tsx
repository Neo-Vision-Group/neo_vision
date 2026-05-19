"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SectionsWrapper } from "@/components/SectionsWrapper";
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

  // ── refs ──────────────────────────────────────────────────────────────────
  const trackerContainerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLOListElement>(null);
  const lineFillRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const dotTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const trackerInnerRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [edgePadding, setEdgePadding] = useState(24);
  const totalYears = story.milestones.length;

  // ── helpers ───────────────────────────────────────────────────────────────

  // Measure the center-X of each dot relative to the inner translating wrapper.
  // Using the inner wrapper (not the outer container) means positions are stable
  // fixed layout values regardless of the current scroll-driven translation.
  const getDotPositions = useCallback(() => {
    const inner = trackerInnerRef.current;
    if (!inner) return [];
    const innerRect = inner.getBoundingClientRect();
    return dotRefs.current.map((dot) => {
      if (!dot) return 0;
      const r = dot.getBoundingClientRect();
      return r.left + r.width / 2 - innerRect.left;
    });
  }, []);

  // Drive ALL dot visual state (lit, active, size, glow, rings) imperatively
  const applyDotStates = useCallback((nextActiveIndex: number) => {
    dotRefs.current.forEach((dot, i) => {
      if (!dot) return;
      const isActive = i === nextActiveIndex;
      const isLit = i <= nextActiveIndex;
      dot.dataset.active = isActive ? "true" : "false";
      dot.dataset.lit = isLit ? "true" : "false";
    });
    tickRefs.current.forEach((tick, i) => {
      if (!tick) return;
      const isActive = i === nextActiveIndex;
      const isReached = i < nextActiveIndex;
      tick.dataset.active = isActive ? "true" : "false";
      tick.style.opacity = isActive ? "1" : isReached ? "0.55" : "0.4";
    });
  }, []);

  const syncFillAndDots = useCallback((nextActiveIndex: number) => {
    const lineFill = lineFillRef.current;
    if (!lineFill) return;

    const positions = getDotPositions();
    if (positions.length === 0) return;
    const targetX = positions[nextActiveIndex];

    const startWidth = lineFill.getBoundingClientRect().width;
    const fillTransitionMs = 700;

    lineFill.style.transition = "width 0.7s cubic-bezier(0.4, 0, 0.2, 1)";
    lineFill.style.width = targetX + "px";

    dotTimeouts.current.forEach((t) => clearTimeout(t));
    dotTimeouts.current = [];

    // Light dots that are already behind the fill immediately; stagger the rest
    dotRefs.current.forEach((dot, i) => {
      if (!dot) return;
      const dotX = positions[i];

      if (i <= nextActiveIndex) {
        if (dotX <= startWidth) {
          dot.dataset.lit = "true";
        } else {
          const distanceToReach = dotX - startWidth;
          const totalDistance = targetX - startWidth;
          const ratio = totalDistance > 0 ? distanceToReach / totalDistance : 0;
          const delay = fillTransitionMs * Math.sqrt(ratio);
          dotTimeouts.current.push(
            setTimeout(() => { dot.dataset.lit = "true"; }, delay)
          );
        }
      } else {
        if (dotX > targetX && dotX <= startWidth) {
          const distanceToReach = startWidth - dotX;
          const totalDistance = startWidth - targetX;
          const ratio = totalDistance > 0 ? distanceToReach / totalDistance : 0;
          const delay = fillTransitionMs * Math.sqrt(ratio);
          dotTimeouts.current.push(
            setTimeout(() => { dot.dataset.lit = "false"; }, delay)
          );
        } else {
          dot.dataset.lit = "false";
        }
      }
    });

    applyDotStates(nextActiveIndex);
  }, [getDotPositions, applyDotStates]);

  // Scroll the scroller so that milestone `index` is centered
  const scrollToMilestone = useCallback((index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const items = Array.from(scroller.querySelectorAll<HTMLLIElement>("li[data-milestone]"));
    const target = items[index];
    if (!target) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const cardRect = target.getBoundingClientRect();
    const scrollLeft =
      scroller.scrollLeft +
      (cardRect.left - scrollerRect.left) -
      scrollerRect.width / 2 +
      cardRect.width / 2;
    scroller.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, []);

  // ── scroll-driven tracker (live fill during drag) ─────────────────────────
  useEffect(() => {
    const scroller = scrollerRef.current;
    const lineFill = lineFillRef.current;
    const container = trackerContainerRef.current;
    if (!scroller || !lineFill || !container) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      // Live fill: interpolate between dot positions based on which milestone
      // items straddle the scroller's visible center
      requestAnimationFrame(() => {
        const positions = getDotPositions();
        if (positions.length === 0) return;

        const items = Array.from(
          scroller.querySelectorAll<HTMLLIElement>("li[data-milestone]")
        );
        if (items.length === 0) return;

        const scrollerRect = scroller.getBoundingClientRect();
        const scrollerCenter = scrollerRect.left + scrollerRect.width / 2;

        // Screen-space center of each item — changes as scrollLeft changes
        const itemCenters = items.map((item) => {
          const r = item.getBoundingClientRect();
          return r.left + r.width / 2;
        });

        // Find the pair of items that straddle the scroller center:
        // aIdx = last item whose screen-center is <= scrollerCenter (just passed)
        // bIdx = next item (approaching)
        let aIdx = 0;
        for (let i = 0; i < itemCenters.length; i++) {
          if (itemCenters[i] <= scrollerCenter) aIdx = i;
        }
        const bIdx = Math.min(aIdx + 1, itemCenters.length - 1);

        let liveFill: number;
        if (aIdx === bIdx) {
          liveFill = positions[aIdx];
        } else {
          const span = itemCenters[bIdx] - itemCenters[aIdx];
          const t = span !== 0
            ? Math.max(0, Math.min(1, (scrollerCenter - itemCenters[aIdx]) / span))
            : 0;
          liveFill = positions[aIdx] + t * (positions[bIdx] - positions[aIdx]);
        }

        lineFill.style.transition = "none";
        lineFill.style.width = liveFill + "px";

        // Keep tracker dots in sync with the scroller's scroll position
        const trackerInner = trackerInnerRef.current;
        if (trackerInner) {
          trackerInner.style.transition = "none";
          trackerInner.style.transform = `translateX(-${scroller.scrollLeft}px)`;
        }

        // Active index: item whose screen-center is closest to scroller center
        let liveActiveIndex = 0;
        let closestDist = Infinity;
        itemCenters.forEach((center, i) => {
          const dist = Math.abs(center - scrollerCenter);
          if (dist < closestDist) { closestDist = dist; liveActiveIndex = i; }
        });

        dotRefs.current.forEach((dot, i) => {
          if (!dot) return;
          dot.dataset.lit = positions[i] <= liveFill + 1 ? "true" : "false";
          dot.dataset.active = i === liveActiveIndex ? "true" : "false";
        });
        tickRefs.current.forEach((tick, i) => {
          if (!tick) return;
          const isActive = i === liveActiveIndex;
          const isReached = i < liveActiveIndex;
          tick.dataset.active = isActive ? "true" : "false";
          tick.style.opacity = isActive ? "1" : isReached ? "0.55" : "0.4";
        });
      });

      // Snap-on-settle: after scroll stops, find the closest milestone
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const items = Array.from(
          scroller.querySelectorAll<HTMLLIElement>("li[data-milestone]")
        );
        const scrollerRect = scroller.getBoundingClientRect();
        const scrollerCenter = scrollerRect.left + scrollerRect.width / 2;

        let closestIndex = 0;
        let closestDist = Infinity;
        items.forEach((item, i) => {
          const rect = item.getBoundingClientRect();
          const dist = Math.abs(rect.left + rect.width / 2 - scrollerCenter);
          if (dist < closestDist) { closestDist = dist; closestIndex = i; }
        });

        lineFill.style.transition = "width 0.7s cubic-bezier(0.4, 0, 0.2, 1)";

        if (closestIndex !== activeIndex) {
          setActiveIndex(closestIndex);
          requestAnimationFrame(() => syncFillAndDots(closestIndex));
        } else {
          syncFillAndDots(activeIndex);
        }
      }, 80);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      clearTimeout(scrollTimeout);
    };
  }, [activeIndex, getDotPositions, syncFillAndDots]);

  // ── edge padding (same as original) ──────────────────────────────────────
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
      const nextPadding = Math.max(24, (scroller.clientWidth - firstItem.offsetWidth) / 2);
      setEdgePadding((current) =>
        Math.abs(current - nextPadding) < 1 ? current : nextPadding
      );
    };

    const updateActiveStyles = () => {
      const items = getItems();
      if (items.length === 0) return;
      const inactiveScale = window.innerWidth >= 768 ? 56 / 96 : 0.625;
      const scrollerRect = scroller.getBoundingClientRect();
      const scrollerCenter = scrollerRect.left + scrollerRect.width / 2;
      const activationDistance = Math.max(scrollerRect.width * 0.35, 1);

      items.forEach((item) => {
        const storyItem = item.querySelector<HTMLElement>("[data-story-item]");
        if (!storyItem) return;
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distance = Math.abs(scrollerCenter - itemCenter);
        const progress = Math.max(0, 1 - distance / activationDistance);
        const scale = inactiveScale + (1 - inactiveScale) * progress;
        const opacity = 0.2 + progress * 0.8;
        storyItem.style.opacity = String(opacity);
        storyItem.style.transform = reducedMotion.matches
          ? `scale(${progress > 0.5 ? 1 : inactiveScale})`
          : `scale(${scale})`;
      });
    };

    const sync = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        updateEdgePadding();
        updateActiveStyles();
      });
    };

    // Initialize first item active
    const items = getItems();
    const inactiveScale = window.innerWidth >= 768 ? 56 / 96 : 0.625;
    items.forEach((item, index) => {
      const storyItem = item.querySelector<HTMLElement>("[data-story-item]");
      if (!storyItem) return;
      storyItem.style.opacity = index === 0 ? "1" : "0.2";
      storyItem.style.transform = index === 0 ? "scale(1)" : `scale(${inactiveScale})`;
    });

    updateEdgePadding();
    scroller.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      cancelAnimationFrame(frameId);
      scroller.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [story.milestones.length]);

  // ── pointer drag-to-scroll ────────────────────────────────────────────────
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
      if (el!.hasPointerCapture(e.pointerId)) el!.releasePointerCapture(e.pointerId);
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

  // ── keyboard nav ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const next = Math.max(0, activeIndex - 1);
        setActiveIndex(next);
        scrollToMilestone(next);
        requestAnimationFrame(() => syncFillAndDots(next));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = Math.min(totalYears - 1, activeIndex + 1);
        setActiveIndex(next);
        scrollToMilestone(next);
        requestAnimationFrame(() => syncFillAndDots(next));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, totalYears, scrollToMilestone, syncFillAndDots]);

  // ── resize re-sync ────────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => {
      scrollToMilestone(activeIndex);
      requestAnimationFrame(() => syncFillAndDots(activeIndex));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex, scrollToMilestone, syncFillAndDots]);

  // ── initialize ────────────────────────────────────────────────────────────
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const init = () => {
      const items = Array.from(
        scroller.querySelectorAll<HTMLLIElement>("li[data-milestone]")
      );
      const firstItem = items[0];
      if (firstItem) {
        const scrollerRect = scroller.getBoundingClientRect();
        const cardRect = firstItem.getBoundingClientRect();
        const scrollLeft =
          scroller.scrollLeft +
          (cardRect.left - scrollerRect.left) -
          scrollerRect.width / 2 +
          cardRect.width / 2;
        scroller.scrollTo({ left: scrollLeft, behavior: "instant" });
      }
      setTimeout(() => {
        const trackerInner = trackerInnerRef.current;
        if (trackerInner) {
          trackerInner.style.transform = `translateX(-${scroller.scrollLeft}px)`;
        }
        syncFillAndDots(0);
      }, 100);
    };
    if (document.fonts?.ready) {
      document.fonts.ready.then(init);
    } else {
      setTimeout(init, 100);
    }
  }, [syncFillAndDots, story.milestones.length]);

  // ── render ────────────────────────────────────────────────────────────────
  if (!story.heading && story.milestones.length === 0) {
    return null;
  }

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
          {/* ── Tracker row (line + tick dots) ── */}
          <div
            ref={trackerContainerRef}
            className="relative mb-8 hidden md:mb-12 lg:block overflow-hidden"
            style={{ height: 40 }}
          >
            {/* Inner wrapper — translates with scroller.scrollLeft so the active
                dot is always centered in the visible container */}
            <div
              ref={trackerInnerRef}
              className="absolute top-0 left-0 h-full"
              style={{ willChange: "transform" }}
            >
              {/* Rail: background + orange fill, absolutely centered vertically */}
              <div className="pointer-events-none absolute inset-x-0 top-1/2 h-0 -translate-y-1/2">
                <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
                <div
                  ref={lineFillRef}
                  className="absolute left-0 top-0 h-[1.5px] bg-gradient-to-r from-brand to-[#E85223]"
                  style={{
                    width: 0,
                    boxShadow: "0 0 14px rgba(255,80,10,0.6)",
                    transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
                  }}
                />
              </div>

              {/* Tick buttons — same padding + widths as the scroller so dots align */}
              <div
                className="relative flex h-full items-center md:gap-16"
                style={{ paddingLeft: edgePadding, paddingRight: edgePadding }}
              >
                {story.milestones.map((m, idx) => (
                  <button
                    key={m.year + idx}
                    ref={(el) => { tickRefs.current[idx] = el; }}
                    data-active={idx === activeIndex ? "true" : "false"}
                    className="story-tick-btn relative flex h-full shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 focus-visible:outline-none w-full md:w-85 lg:w-100 xl:w-120 2xl:w-138"
                    style={{ opacity: idx === activeIndex ? 1 : idx < activeIndex ? 0.55 : 0.4 }}
                    aria-label={`Jump to ${m.year}`}
                    onClick={() => {
                      setActiveIndex(idx);
                      scrollToMilestone(idx);
                      requestAnimationFrame(() => syncFillAndDots(idx));
                    }}
                  >
                    {/* Pulse rings — shown via CSS when parent data-active="true" */}
                    <span className="story-tick-ring-1 pointer-events-none absolute rounded-full border border-brand" style={{ width: 14, height: 14 }} />
                    <span className="story-tick-ring-2 pointer-events-none absolute rounded-full border border-brand" style={{ width: 14, height: 14 }} />
                    <span className="story-tick-ring-3 pointer-events-none absolute rounded-full border border-brand" style={{ width: 14, height: 14 }} />
                    {/* Dot — sits on the line; all state driven by CSS data-attribute selectors */}
                    <span
                      ref={(el) => { dotRefs.current[idx] = el; }}
                      data-lit={idx === activeIndex ? "true" : "false"}
                      data-active={idx === activeIndex ? "true" : "false"}
                      className="story-tick-dot absolute rounded-full border transition-[width,height,box-shadow,border-color,background-color] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Milestone list (original layout) ── */}
          <ol
            ref={scrollerRef}
            className="no-scrollbar story-scroller min-w-0 flex flex-col gap-8 overflow-x-auto px-6 lg:flex-row md:gap-16 md:pt-4 md:pb-4 cursor-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iI2ZmNDEwMCIgLz4KICA8cGF0aCBkPSJNMTIgMjBMMTYgMTZNMTIgMjBMMTYgMjRNMTIgMjBIMjgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CiAgPHBhdGggZD0iTTI4IDIwTDI0IDE2TTI4IDIwTDI0IDI0IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4=')_20_20,grab] active:cursor-grabbing lg:w-auto lg:flex-none"
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
