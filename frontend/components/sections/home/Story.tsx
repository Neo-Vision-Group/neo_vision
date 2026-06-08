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
  const [edgePadding, setEdgePadding] = useState(0);
  const totalYears = story.milestones.length;

  // Cached dot positions — updated by ResizeObserver + resize, never read mid-frame after a write
  const cachedDotPositionsRef = useRef<number[]>([]);
  // Cached fill width — updated after every write so syncFillAndDots never re-reads the DOM
  const cachedFillWidthRef = useRef(0);
  // Cached firstItem width — updated by ResizeObserver so updateEdgePadding never reads offsetWidth inline
  const firstItemWidthRef = useRef(0);

  // ── mobile vertical tracker refs ─────────────────────────────────────────
  const vTrackerRef = useRef<HTMLDivElement>(null);
  const vLineFillRef = useRef<HTMLDivElement>(null);
  const vDotRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // ── helpers ───────────────────────────────────────────────────────────────

  // Re-measure dot positions and store in the cache ref.
  // Call this only from layout-safe contexts (ResizeObserver cb, rAF after resize,
  // or once after fonts/init) — never inline after a DOM write.
  const refreshDotPositionCache = useCallback(() => {
    const inner = trackerInnerRef.current;
    if (!inner) return;
    const innerRect = inner.getBoundingClientRect();
    cachedDotPositionsRef.current = dotRefs.current.map((dot) => {
      if (!dot) return 0;
      const r = dot.getBoundingClientRect();
      return r.left + r.width / 2 - innerRect.left;
    });
  }, []);

  // Read from cache — zero layout cost.
  const getDotPositions = useCallback(() => {
    return cachedDotPositionsRef.current;
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

    // Use cached fill width — avoids a forced reflow after the previous style write
    const startWidth = cachedFillWidthRef.current;
    const fillTransitionMs = 700;

    lineFill.style.transition = "width 0.7s cubic-bezier(0.4, 0, 0.2, 1)";
    lineFill.style.width = targetX + "px";
    cachedFillWidthRef.current = targetX;

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

  // ── edge padding (lg+ horizontal scroller only) ───────────────────────────
  useEffect(() => {
    if (window.innerWidth < 1024) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let frameId = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const getItems = () =>
      Array.from(scroller.querySelectorAll<HTMLLIElement>("li[data-milestone]"));

    // Seed firstItemWidthRef from the actual DOM once, then ResizeObserver keeps it fresh
    const [firstItem] = getItems();
    if (firstItem) {
      firstItemWidthRef.current = firstItem.offsetWidth;
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          firstItemWidthRef.current = entry.contentRect.width;
        }
      });
      ro.observe(firstItem);
      // Cleanup handled in the returned cleanup fn below
      const originalCleanup = () => ro.disconnect();
      // Store for use in the effect cleanup
      (scroller as HTMLElement & { _itemRo?: () => void })._itemRo = originalCleanup;
    }

    const updateEdgePadding = () => {
      const nextPadding = Math.max(24, (scroller.clientWidth - firstItemWidthRef.current) / 2);
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
      (scroller as HTMLElement & { _itemRo?: () => void })._itemRo?.();
    };
  }, [story.milestones.length]);

  // ── pointer drag-to-scroll ────────────────────────────────────────────────
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let activePointerId: number | null = null;
    let startX = 0;
    let startScroll = 0;

    let cachedOffsetLeft = 0;

    function onDown(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      activePointerId = e.pointerId;
      // Read offsetLeft once here — reuse in onMove to avoid per-event layout reads
      cachedOffsetLeft = el!.offsetLeft;
      startX = e.pageX - cachedOffsetLeft;
      startScroll = el!.scrollLeft;
      el!.dataset.grabbing = "true";
      el!.setPointerCapture(e.pointerId);
      e.preventDefault();
      window.getSelection()?.removeAllRanges();
    }
    function onMove(e: PointerEvent) {
      if (activePointerId !== e.pointerId) return;
      const x = e.pageX - cachedOffsetLeft;
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

  // ── keep dot position cache fresh via ResizeObserver ─────────────────────
  useEffect(() => {
    const inner = trackerInnerRef.current;
    if (!inner) return;
    const ro = new ResizeObserver(() => {
      refreshDotPositionCache();
    });
    ro.observe(inner);
    return () => ro.disconnect();
  }, [refreshDotPositionCache]);

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
      requestAnimationFrame(() => {
        refreshDotPositionCache();
        syncFillAndDots(activeIndex);
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex, scrollToMilestone, syncFillAndDots, refreshDotPositionCache]);

  // ── mobile vertical scroll-driven activation ──────────────────────────────
  useEffect(() => {
    // Only run on mobile (vertical layout)
    if (typeof window === "undefined" || window.innerWidth >= 1024) return;

    const scroller = scrollerRef.current;
    if (!scroller) return;

    const items = Array.from(
      scroller.querySelectorAll<HTMLLIElement>("li[data-milestone]")
    );
    if (items.length === 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const inactiveScale = 0.625;
    let frameId = 0;
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const updateActiveStyles = () => {
      const viewportCenter = window.innerHeight / 2;
      const activationDistance = window.innerHeight * 0.5;

      let liveActiveIndex = 0;
      let closestDist = Infinity;

      items.forEach((item, i) => {
        const storyItem = item.querySelector<HTMLElement>("[data-story-item]");
        if (!storyItem) return;

        const rect = item.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const distanceFromCenter = Math.abs(viewportCenter - itemCenter);

        if (distanceFromCenter < closestDist) {
          closestDist = distanceFromCenter;
          liveActiveIndex = i;
        }

        // Interpolate scale/opacity based on distance from viewport center
        const progress = Math.max(0, Math.min(1, 1 - distanceFromCenter / activationDistance));
        const scale = inactiveScale + (1 - inactiveScale) * progress;
        const opacity = 0.2 + progress * 0.8;

        storyItem.style.opacity = String(opacity);
        storyItem.style.transform = reducedMotion.matches
          ? `scale(${progress > 0.5 ? 1 : inactiveScale})`
          : `scale(${scale})`;
      });

      // Update dots and ticks to match the active item
      dotRefs.current.forEach((dot, i) => {
        if (!dot) return;
        const isActive = i === liveActiveIndex;
        const isReached = i < liveActiveIndex;
        dot.dataset.lit = isReached || isActive ? "true" : "false";
        dot.dataset.active = isActive ? "true" : "false";
      });

      tickRefs.current.forEach((tick, i) => {
        if (!tick) return;
        const isActive = i === liveActiveIndex;
        const isReached = i < liveActiveIndex;
        tick.dataset.active = isActive ? "true" : "false";
        tick.style.opacity = isActive ? "1" : isReached ? "0.55" : "0.4";
      });

      if (liveActiveIndex !== activeIndex) {
        setActiveIndex(liveActiveIndex);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateActiveStyles);

      // Snap-on-settle: sync fill line after scroll stops
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        syncFillAndDots(activeIndex);
      }, 80);
    };

    // Ensure first item is visible on initial load before scroll position is known
    const firstStoryItem = items[0]?.querySelector<HTMLElement>("[data-story-item]");
    if (firstStoryItem) {
      firstStoryItem.style.opacity = "1";
      firstStoryItem.style.transform = "scale(1)";
    }
    // Initialize
    updateActiveStyles();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateActiveStyles);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(scrollTimeout);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateActiveStyles);
    };
  }, [activeIndex, story.milestones.length, syncFillAndDots]);

  // ── mobile vertical tracker: position dots + drive fill on window scroll ──
  useEffect(() => {
    const col = vTrackerRef.current;
    const scroller = scrollerRef.current;
    if (!col || !scroller) return;

    let frameId = 0;

    const getDocTop = (el: HTMLElement) => {
      let t = 0;
      let n: HTMLElement | null = el;
      while (n) { t += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
      return t;
    };

    const positionAndFill = () => {
      const items = Array.from(scroller.querySelectorAll<HTMLLIElement>("li[data-milestone]"));
      if (items.length === 0) return;

      const vFill = vLineFillRef.current;

      // ── BATCH READS ── all geometry queries before any style writes ──────
      const colTop = getDocTop(col);
      const dotYs: number[] = items.map((item) => {
        return getDocTop(item) + item.offsetHeight / 2 - colTop;
      });
      const viewportCenter = window.innerHeight / 2;
      const itemViewportCenters = items.map((item) => {
        const r = item.getBoundingClientRect();
        return r.top + r.height / 2;
      });

      // Compute fill interpolation from reads
      let aIdx = 0;
      for (let i = 0; i < itemViewportCenters.length; i++) {
        if (itemViewportCenters[i] <= viewportCenter) aIdx = i;
      }
      const bIdx = Math.min(aIdx + 1, items.length - 1);

      let fillH: number;
      if (aIdx === bIdx) {
        fillH = dotYs[aIdx];
      } else {
        const span = itemViewportCenters[bIdx] - itemViewportCenters[aIdx];
        const t = span !== 0
          ? Math.max(0, Math.min(1, (viewportCenter - itemViewportCenters[aIdx]) / span))
          : 0;
        fillH = dotYs[aIdx] + t * (dotYs[bIdx] - dotYs[aIdx]);
      }

      // ── BATCH WRITES ── all style mutations after all reads ──────────────
      vDotRefs.current.forEach((dot, i) => {
        if (!dot || dotYs[i] == null) return;
        dot.style.top = `${dotYs[i] - 5}px`;
        dot.style.opacity = "1";
      });

      if (vFill) {
        vFill.style.height = `${fillH}px`;
      }

      // Sync vDot active/lit states
      vDotRefs.current.forEach((dot, i) => {
        if (!dot) return;
        dot.dataset.active = i === aIdx ? "true" : "false";
        dot.dataset.lit = i <= aIdx ? "true" : "false";
      });
    };

    const onScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(positionAndFill);
    };

    // Initial position after fonts load
    const init = () => requestAnimationFrame(positionAndFill);
    if (document.fonts?.ready) {
      document.fonts.ready.then(init);
    } else {
      setTimeout(init, 100);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", positionAndFill);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", positionAndFill);
    };
  }, [story.milestones.length]);

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
        // Batch reads first, then write
        const scrollerRect = scroller.getBoundingClientRect();
        const cardRect = firstItem.getBoundingClientRect();
        const scrollLeft =
          scroller.scrollLeft +
          (cardRect.left - scrollerRect.left) -
          scrollerRect.width / 2 +
          cardRect.width / 2;
        scroller.scrollTo({ left: scrollLeft, behavior: "instant" });
      }
      // Populate dot position cache before first syncFillAndDots call
      refreshDotPositionCache();
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
  }, [syncFillAndDots, story.milestones.length, refreshDotPositionCache]);

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
                  className="absolute left-0 top-0 h-[1.5px] bg-linear-to-r from-brand to-[#E85223]"
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

          {/* ── Mobile vertical tracker + milestone list ── */}
          <div className="flex flex-row lg:block">
            {/* Vertical tracker — left of content on mobile/tablet, hidden on lg+ */}
            <div ref={vTrackerRef} className="relative mr-3 w-4 shrink-0 lg:hidden">
              {/* Rail */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-white/10" />
              {/* Fill */}
              <div
                ref={vLineFillRef}
                className="absolute left-1/2 top-0 w-[1.5px] -translate-x-1/2 bg-linear-to-b from-brand to-[#E85223]"
                style={{ height: 0, boxShadow: "0 0 14px rgba(255,80,10,0.6)" }}
              />
              {/* Dots aligned to each item's vertical center */}
              {story.milestones.map((m, idx) => (
                <span
                  key={m.year + idx + "-vdot"}
                  ref={(el) => { vDotRefs.current[idx] = el; }}
                  data-lit={idx === 0 ? "true" : "false"}
                  data-active={idx === 0 ? "true" : "false"}
                  className="story-tick-dot absolute left-1/2 -translate-x-1/2 rounded-full border transition-[width,height,box-shadow,border-color,background-color] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{ opacity: 0 }}
                />
              ))}
            </div>

            {/* Milestone list */}
            <ol
              ref={scrollerRef}
              className="no-scrollbar story-scroller min-w-0 flex flex-col gap-8 overflow-x-auto lg:flex-row md:gap-16 md:pt-4 md:pb-4 cursor-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iI2ZmNDEwMCIgLz4KICA8cGF0aCBkPSJNMTIgMjBMMTYgMTZNMTIgMjBMMTYgMjRNMTIgMjBIMjgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CiAgPHBhdGggZD0iTTI4IDIwTDI0IDE2TTI4IDIwTDI0IDI0IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zj4=')_20_20,grab] active:cursor-grabbing lg:w-auto lg:flex-none"
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
      </div>
    </SectionsWrapper>
  );
}
