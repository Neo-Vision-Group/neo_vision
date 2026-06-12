"use client";

import { useEffect, useRef, useState } from "react";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cn } from "@/lib/utils";
import { cleanStega } from "@/sanity/lib/utils";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import TeamArrowLeft from "@/components/icons/TeamArrowLeft";
import TeamArrowRight from "@/components/icons/TeamArrowRight";

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

  const [activeIndex, setActiveIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  if (!story.heading && story.milestones.length === 0) {
    return null;
  }

  const hasMultiple = story.milestones.length > 1;
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < story.milestones.length - 1;

  // Touch state for swipe detection on text content
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && canGoNext) {
      swiper?.slideNext();
    } else if (isRightSwipe && canGoPrev) {
      swiper?.slidePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const isDark = !mounted || resolvedTheme === "dark";
  const arrowColor = isDark ? "#efefef" : "#0f0f0f";

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        swiper?.slidePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        swiper?.slideNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [swiper]);

  return (
    <SectionsWrapper id="our-story" eyebrow={story.eyebrow}>
      <div className="flex flex-col gap-12 overflow-hidden">
        <SplitTextReveal
          duration={0.6}
          as="h2"
          type="words"
          stagger={0.04}
          colorReveal
          className="text-4xl leading-[1.2] tracking-[-1px] md:text-5xl max-w-225"
        >
          {story.heading}
        </SplitTextReveal>

        <div className="relative flex flex-col items-center">
          {/* Single continuous line behind all dots - aligned to center */}
          <div className="absolute w-screen h-px bg-dark/20 dark:bg-white/20 top-[100px] md:top-[120px] left-1/2 -translate-x-1/2" />

          {/* Years Carousel (Swiper) */}
          <div className="relative w-full max-w-[400px] lg:max-w-[500px]">
            <Swiper
              slidesPerView={1}
              spaceBetween={0}
              onSwiper={setSwiper}
              onSlideChange={(s) => setActiveIndex(s.activeIndex)}
              className="!overflow-visible"
            >
              {story.milestones.map((m, idx) => (
                <SwiperSlide key={m.year} className="flex flex-col items-center text-center">
                  <div className="flex flex-col items-center text-center">
                    {/* Year - clash font */}
                    <h3
                      className={cn(
                        "font-clash text-[30px] md:text-[40px] tracking-[-1px] transition-colors duration-300",
                        idx === activeIndex
                          ? "text-brand"
                          : "text-dark dark:text-white"
                      )}
                    >
                      {m.year}
                    </h3>

                    {/* Timeline dot with pulse rings */}
                    <div className="relative flex items-center justify-center w-full my-6 md:my-8">
                      <div
                        className="story-tick-btn relative flex items-center justify-center w-20 h-20 cursor-pointer"
                        data-active={idx === activeIndex ? "true" : "false"}
                        onClick={() => swiper?.slideTo(idx)}
                      >
                        {/* Pulse rings - animated via CSS when data-active="true" */}
                        <span className="story-tick-ring-1 pointer-events-none absolute rounded-full border border-brand" style={{ width: 20, height: 20 }} />
                        <span className="story-tick-ring-2 pointer-events-none absolute rounded-full border border-brand" style={{ width: 20, height: 20 }} />
                        <span className="story-tick-ring-3 pointer-events-none absolute rounded-full border border-brand" style={{ width: 20, height: 20 }} />
                        {/* Center square */}
                        <span
                          className="story-tick-dot absolute border transition-all duration-300"
                          data-lit={idx === activeIndex ? "true" : "false"}
                          data-active={idx === activeIndex ? "true" : "false"}
                        />
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Content Area with Side Arrows */}
          <div className="relative flex items-center justify-center w-full max-w-2xl mt-12 md:mt-16 pt-8">
            {/* Prev Arrow - left side */}
            {hasMultiple && (
              <button
                type="button"
                aria-label="Previous year"
                onClick={() => swiper?.slidePrev()}
                disabled={!canGoPrev}
                className="absolute left-0 lg:-left-16 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center transition-colors disabled:opacity-30 text-dark dark:text-white hover:text-brand"
              >
                <TeamArrowLeft color={arrowColor} />
              </button>
            )}

            {/* Text Content - funnel font, no card, with swipe support */}
            <div
              className="relative min-h-[120px] md:min-h-[160px] flex-1 mx-16 md:mx-20 touch-pan-y"
              aria-live="polite"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {story.milestones.map((m, idx) => (
                <div
                  key={m.year}
                  className={cn(
                    "w-full transition-all duration-500 ease-out",
                    "font-funnel text-dark dark:text-white text-center",
                    "flex items-center justify-center p-4",
                    idx === activeIndex
                      ? "opacity-100 translate-y-0 z-10 pointer-events-auto"
                      : "opacity-0 translate-y-10 z-0 pointer-events-none absolute inset-0"
                  )}
                >
                  <p className="text-lg md:text-xl lg:text-2xl leading-relaxed max-w-full break-words">{m.body}</p>
                </div>
              ))}
            </div>

            {/* Next Arrow - right side */}
            {hasMultiple && (
              <button
                type="button"
                aria-label="Next year"
                onClick={() => swiper?.slideNext()}
                disabled={!canGoNext}
                className="absolute right-0 lg:-right-16 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center transition-colors disabled:opacity-30 text-dark dark:text-white hover:text-brand"
              >
                <TeamArrowRight color={arrowColor} />
              </button>
            )}
          </div>
        </div>
      </div>
    </SectionsWrapper>
  );
}
