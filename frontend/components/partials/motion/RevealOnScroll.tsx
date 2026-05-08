"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import "./gsap-setup";
import { cn } from "../../../lib/utils";

export function RevealOnScroll({
  children,
  as: Component = "div",
  className,
  delay = 0,
  stagger,
  from = "bottom",
  distance = 32,
  duration = 0.9,
  start = "top 85%",
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds before the reveal starts. */
  delay?: number;
  /** If set, stagger each direct child's reveal by this many seconds. */
  stagger?: number;
  /** Where the content animates in from. */
  from?: "bottom" | "top" | "left" | "right";
  /** Translation distance in pixels. */
  distance?: number;
  /** Tween duration in seconds. */
  duration?: number;
  /** ScrollTrigger `start` value — default enters when element top hits 85% viewport. */
  start?: string;
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
          const reduced = ctx.conditions?.reduced;
          const targets: Element[] = stagger ? Array.from(el.children) : [el];

          if (reduced) {
            gsap.set(targets, { opacity: 1, x: 0, y: 0, visibility: "visible" });
            return;
          }

          const axis: "x" | "y" = from === "left" || from === "right" ? "x" : "y";
          const sign = from === "bottom" || from === "right" ? 1 : -1;

          gsap.fromTo(
            targets,
            { opacity: 0, [axis]: sign * distance },
            {
              opacity: 1,
              [axis]: 0,
              visibility: "visible",
              duration,
              delay,
              stagger,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start,
                toggleActions: "play none none none",
              },
            }
          );
        }
      );
    },
    { scope: ref, dependencies: [] }
  );

  const Tag = Component as ElementType;
  return (
    <Tag ref={ref as React.Ref<HTMLElement>} className={className} style={{ visibility: "hidden" }}>
      {children}
    </Tag>
  );
}

/** Convenience wrapper for a commonly-used set of defaults. */
export function RevealHeading({
  children,
  className,
  as = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return (
    <RevealOnScroll as={as} className={cn(className)} from="bottom" distance={24} duration={0.8}>
      {children}
    </RevealOnScroll>
  );
}
