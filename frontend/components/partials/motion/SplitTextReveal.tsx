"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useTheme } from "next-themes";
import "./gsap-setup";
import { scheduleScrollTriggerRefresh } from "./scheduleScrollTriggerRefresh";

export function SplitTextReveal({
  children,
  as: Component = "span",
  className,
  type = "chars",
  delay = 0,
  stagger = 0.03,
  duration = 0.9,
  distance = 24,
  scrollTriggered = false,
  colorReveal = false,
  colorFrom = "rgba(239,239,239,0.25)",
  colorTo,
  scrubStart = "top 75%",
  scrubEnd = "top 25%",
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** What to split into. `chars` is most dramatic, `words` lighter DOM. */
  type?: "chars" | "words" | "lines";
  delay?: number;
  stagger?: number;
  duration?: number;
  distance?: number;
  /** If true, play when element enters viewport. Else plays on mount. */
  scrollTriggered?: boolean;
  /** If true, uses scrub-based color reveal (text appears as you scroll). */
  colorReveal?: boolean;
  /** Starting color for text reveal. */
  colorFrom?: string;
  /** Ending color for text reveal. */
  colorTo?: string;
  /** ScrollTrigger start for color scrub. */
  scrubStart?: string;
  /** ScrollTrigger end for color scrub. */
  scrubEnd?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const resolvedColor =
    colorTo ?? (mounted ? (resolvedTheme === "dark" ? "rgba(239,239,239,1)" : "rgba(15,15,15,1)") : undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const finalColor = resolvedColor ?? window.getComputedStyle(el).color;

      const mm = gsap.matchMedia();
      mm.add(
        {
          reduced: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          if (ctx.conditions?.reduced) {
            if (colorReveal) {
              gsap.set(el, { color: finalColor, visibility: "visible" });
            } else {
              gsap.set(el, { opacity: 1, visibility: "visible" });
            }
            return;
          }

          if (colorReveal) {
            gsap.set(el, { opacity: 1, visibility: "visible" });
            const split = SplitText.create(el, { type: "words" });
            gsap.set(split.words, { color: colorFrom });
            const tween = gsap.to(split.words, {
              color: finalColor,
              stagger,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: scrubStart,
                end: scrubEnd,
                scrub: 1,
                invalidateOnRefresh: true,
              },
            });
            return () => {
              tween.kill();
              split.revert();
            };
          }

          gsap.set(el, { opacity: 1, visibility: "visible" });

          const split = SplitText.create(el, {
            type,
            mask: type,
          });
          const targets = type === "chars" ? split.chars : type === "words" ? split.words : split.lines;

          const tween = gsap.fromTo(
            targets,
            { opacity: 0, yPercent: distance ? 100 : 0, y: distance ? 0 : distance },
            {
              opacity: 1,
              yPercent: 0,
              y: 0,
              duration,
              delay,
              stagger,
              ease: "power3.out",
              scrollTrigger: scrollTriggered
                ? { trigger: el, start: "top 85%", toggleActions: "play none none none" }
                : undefined,
            }
          );

          return () => {
            tween.kill();
            split.revert();
          };
        }
      );

      scheduleScrollTriggerRefresh();
      return () => {
        mm.revert();
      };
    },
    { scope: ref, dependencies: [type, delay, stagger, duration, distance, scrollTriggered, colorReveal, colorFrom, resolvedColor, scrubStart, scrubEnd] }
  );

  const Tag = Component as ElementType;
  return (
    <Tag ref={ref as React.Ref<HTMLElement>} className={className} style={{ visibility: "hidden" }}>
      {children}
    </Tag>
  );
}
