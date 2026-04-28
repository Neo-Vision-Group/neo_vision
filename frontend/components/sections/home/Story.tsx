"use client";

import { useEffect, useRef } from "react";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "@/components/partials/motion/gsap-setup";
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
            scroller.querySelectorAll<HTMLLIElement>("li[data-milestone]")
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
              start: "left 60%",
              end: "left 30%",
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
    { dependencies: [] }
  );

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
          <div className="absolute top-12 left-0 w-full h-px bg-white/20 -z-10" />
          <ol
            ref={scrollerRef}
            className="no-scrollbar story-scroller flex flex-col gap-8 overflow-x-auto px-6 md:flex-row md:gap-16 md:pt-12 md:pb-4 cursor-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iI2ZmNDEwMCIgLz4KICA8cGF0aCBkPSJNMTIgMjBMMTYgMTZNMTIgMjBMMTYgMjRNMTIgMjBIMjgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CiAgPHBhdGggZD0iTTI4IDIwTDI0IDE2TTI4IDIwTDI0IDI0IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4=')_20_20,grab] active:cursor-grabbing"
          >
            {story.milestones.map((m, idx) => (
              <li
                key={m.year + idx}
                data-milestone
                className={cn(
                  "relative flex w-full shrink-0 flex-col gap-2 md:w-85 lg:w-100 xl:w-120 2xl:w-138"
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span
                    className={cn(
                      "font-betatron capitalize text-brand",
                      idx === 0
                        ? "text-8xl tracking-[-3.84px] md:text-[96px] md:leading-none md:tracking-[-5.76px]"
                        : "text-6xl tracking-[-2.88px] md:text-[56px] md:leading-none md:tracking-[-3.84px]"
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
