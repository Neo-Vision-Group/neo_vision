"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import "./gsap-setup";
import { useTheme } from 'next-themes'

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
  colorTo = "rgba(239,239,239,1)",
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

  const { theme, setTheme } = useTheme()

  const toColor = theme === "dark" ? "rgba(239,239,239,1)" : "rgba(0,0,0,1)"

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          reduced: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          if (ctx.conditions?.reduced) {
            if (colorReveal) {
              gsap.set(el, { color: toColor });
            } else {
              gsap.set(el, { opacity: 1 });
            }
            return;
          }

          if (colorReveal) {
            gsap.set(el, { opacity: 1 });
            const split = SplitText.create(el, { type: "words" });
            gsap.set(split.words, { color: colorFrom });
            const tween = gsap.to(split.words, {
              color: toColor,
              stagger,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: scrubStart,
                end: scrubEnd,
                scrub: 1,
              },
            });
            return () => {
              tween.kill();
              split.revert();
            };
          }

          gsap.set(el, { opacity: 1 });

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
    },
    { scope: ref, dependencies: [type, delay, stagger, duration, distance, scrollTriggered, colorReveal, colorFrom, colorTo, scrubStart, scrubEnd] }
  );

  const Tag = Component as ElementType;
  return (
    <Tag ref={ref as React.Ref<HTMLElement>} className={className} style={{ opacity: 0 }}>
      {children}
    </Tag>
  );
}