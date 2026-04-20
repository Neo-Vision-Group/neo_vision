"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import "./gsap-setup";

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
}) {
  const ref = useRef<HTMLElement>(null);

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
            // Accessibility: show text immediately, no split, no motion.
            gsap.set(el, { opacity: 1 });
            return;
          }

          // Parent wrapper is set to opacity:0 inline to prevent FOUC
          // before JS runs. Now that the split is ready, unhide the
          // container — the split children carry their own animations.
          gsap.set(el, { opacity: 1 });

          const split = SplitText.create(el, {
            type,
            mask: type, // clip each target to its own box — creates the "wipe" feel
          });
          const targets = type === "chars" ? split.chars : type === "words" ? split.words : split.lines;

          gsap.fromTo(
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
            split.revert();
          };
        }
      );
    },
    { scope: ref, dependencies: [] }
  );

  const Tag = Component as ElementType;
  return (
    <Tag ref={ref as React.Ref<HTMLElement>} className={className} style={{ opacity: 0 }}>
      {children}
    </Tag>
  );
}
