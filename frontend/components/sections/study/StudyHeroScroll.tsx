"use client";

import { useEffect, useRef } from "react";
import { cleanStega } from "@/sanity/lib/utils";
import { StudyHero, StudyHeroStats, type StudyHeroData } from "./Hero";

export { type StudyHeroData };

export function StudyHeroScroll({ data }: { data?: StudyHeroData }) {
  const cleanData = data ? cleanStega(data) : data;
  const details =
    cleanData?.details?.filter((item) => item?.label && item?.value) ?? [];

  const wrapperRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const statsEl = statsRef.current;

    if (!wrapper || !statsEl || details.length === 0) return;

    const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;
    const prefersReduced = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const applyLayout = () => {
      if (!isDesktop() || prefersReduced()) {
        statsEl.style.position = "";
        statsEl.style.bottom = "";
        statsEl.style.left = "";
        statsEl.style.right = "";
        statsEl.style.zIndex = "";
        wrapper.style.minHeight = "";
        const heroEl = wrapper.querySelector<HTMLElement>("section.has-hero-pattern");
        if (heroEl) heroEl.style.paddingBottom = "";
        return;
      }

      const statsH = statsEl.offsetHeight;
      // total height: viewport + statsH scroll travel + statsH clearance below image
      wrapper.style.minHeight = `calc(100dvh - 4rem + ${statsH * 2}px)`;
      // push image up inside the section so it fully clears the stats at rest
      const heroEl = wrapper.querySelector<HTMLElement>("section.has-hero-pattern");
      if (heroEl) heroEl.style.paddingBottom = `${statsH}px`;
    };

    const updatePosition = () => {
      if (!isDesktop() || prefersReduced()) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const wrapperBottom = wrapperRect.bottom;

      if (wrapperBottom <= window.innerHeight) {
        statsEl.style.position = "absolute";
        statsEl.style.bottom = "0";
        statsEl.style.left = "0";
        statsEl.style.right = "0";
        statsEl.style.zIndex = "20";
      } else {
        statsEl.style.position = "fixed";
        statsEl.style.bottom = "0";
        statsEl.style.left = `${wrapperRect.left}px`;
        statsEl.style.right = `${window.innerWidth - wrapperRect.right}px`;
        statsEl.style.zIndex = "20";
      }
    };

    applyLayout();
    updatePosition();

    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", applyLayout, { passive: true });

    const ro = new ResizeObserver(() => {
      applyLayout();
      updatePosition();
    });
    ro.observe(statsEl);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", applyLayout);
      ro.disconnect();
      statsEl.style.position = "";
      statsEl.style.bottom = "";
      statsEl.style.left = "";
      statsEl.style.right = "";
      statsEl.style.zIndex = "";
      wrapper.style.minHeight = "";
      const heroEl = wrapper.querySelector<HTMLElement>("section.has-hero-pattern");
      if (heroEl) heroEl.style.paddingBottom = "";
    };
  }, [details.length]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <StudyHero data={data} hideStats={details.length > 0} />

      {details.length > 0 ? (
        <div ref={statsRef} className="w-full">
          <StudyHeroStats details={details} />
        </div>
      ) : null}
    </div>
  );
}
