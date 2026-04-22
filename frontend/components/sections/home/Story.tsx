"use client";

import { useEffect, useRef } from "react";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cn } from "@/lib/utils";
import { story as storyFallback } from "@/lib/content/home";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "@/components/partials/motion/gsap-setup";
import { cleanStega } from "@/sanity/lib/utils";

/**
 * Our Story — frame 141:10919.
 *
 * Horizontal timeline with three interactive polish layers:
 *
 * 1. **No-scrollbar** — CSS class hides the native scroller chrome
 *    (scroll still works via trackpad/touch/drag).
 * 2. **Custom drag cursor** — SVG data-URL cursor that shows a
 *    brand-orange circle with ↔ arrows, swapping to a "grabbing"
 *    variant on :active. Falls back to `grab`/`grabbing` where
 *    custom cursors aren't supported.
 * 3. **Scroll-linked lightening** — each milestone starts at
 *    opacity 0.2; as the user scrolls horizontally and the milestone
 *    crosses the center of the scroller, it animates to opacity 1.
 *    Uses GSAP ScrollTrigger with `horizontal: true` and the
 *    scroller itself as the trigger container.
 * 4. **Pointer drag-to-scroll with pointer capture** — click+drag
 *    updates `scrollLeft`, covering desktop pointers without a
 *    scrollbar handle. Pointer capture guarantees release events
 *    even outside the viewport (no stuck-drag state), and
 *    `preventDefault()` on pointerdown suppresses text selection.
 *
 * Reduce-motion: skips the opacity animation; all items show at full
 * opacity.
 */
export type StoryData = {
  eyebrow?: string;
  heading?: string;
  milestones?: Array<{ year: string; body: string }>;
};

export function Story({ data }: { data?: StoryData }) {
  const cleanData = data ? cleanStega(data) : data;

  const story = {
    eyebrow: cleanData?.eyebrow ?? storyFallback.eyebrow,
    heading: cleanData?.heading
      ? cleanData.heading
      : `${storyFallback.heading.faded} ${storyFallback.heading.bold}\n${storyFallback.heading.trailing}`,
    milestones:
      cleanData?.milestones && cleanData.milestones.length > 0
        ? cleanData.milestones
        : storyFallback.milestones,
  };

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
        <h2 className="text-[28px] leading-[36px] tracking-[-0.3px] text-foreground md:text-[36px] md:leading-[46px] lg:text-[44px] lg:leading-[54px] 2xl:text-[48px] 2xl:leading-[58px] 2xl:tracking-[-0.4px]">
          {story.heading.split("\n").map((line, idx) => (
            <span key={idx}>
              {line}
              {idx < story.heading.split("\n").length - 1 && <br />}
            </span>
          ))}
        </h2>

        <div className="relative -mx-6">
          <ol
            ref={scrollerRef}
            className="no-scrollbar story-scroller flex flex-col gap-8 overflow-x-auto px-6 md:flex-row md:gap-16 md:py-4"
          >
            {story.milestones.map((m, idx) => (
              <li
                key={m.year + idx}
                data-milestone
                className={cn(
                  "relative flex w-full shrink-0 flex-col gap-2 md:w-[340px] lg:w-[400px] xl:w-[480px] 2xl:w-[550px]"
                )}
              >
                <span
                  className={cn(
                    "font-display capitalize text-brand-hover",
                    idx === 0
                      ? "text-[64px] tracking-[-3.84px] md:text-[96px] md:leading-none md:tracking-[-5.76px]"
                      : "text-[48px] tracking-[-2.88px] md:text-[64px] md:leading-none md:tracking-[-3.84px]"
                  )}
                >
                  {m.year}
                </span>
                <p className="py-4 text-[24px] leading-[30px] tracking-[-0.15px] text-foreground md:py-12 md:text-[28px] md:leading-[36px] 2xl:text-[32px] 2xl:leading-[38px]">
                  {m.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </SectionsWrapper>
  );
}
