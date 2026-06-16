import Link from "next/link";
import { cn } from "@/lib/utils";
import { HeroBrandDotsBackground } from "@/components/partials/HeroBrandDotsBackground";
import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    )
);

const SplitTextReveal = dynamic(
  () =>
    import("@/components/partials/motion/SplitTextReveal").then(
      (mod) => mod.SplitTextReveal
    )
);

type StudyHeroDetail = {
  _key?: string;
  label?: string;
  value?: string;
};

export type StudyHeroData = {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  chapters?: string[];
  details?: StudyHeroDetail[];
  heroImage?: {
    asset?: {
      url?: string;
    };
  };
};

export function StudyHero({ data }: { data?: StudyHeroData }) {
  const cleanData = data ? cleanStega(data) : data;

  if (!cleanData) {
    return null;
  }

  const eyebrow = cleanData.eyebrow;
  const heading = cleanData.heading;
  const subheading = cleanData.subheading;
  const details =
    cleanData.details?.filter((item) => item?.label && item?.value) ?? [];
  const imageUrl = cleanData.heroImage?.asset?.url;


  return (
    <section
      className={cn(
        "has-hero-pattern relative isolate flex min-h-[calc(100svh-4rem)] lg:h-[calc(100svh-4rem)] lg:max-h-[calc(100svh-4rem)] w-full flex-col lg:overflow-hidden bg-transparent text-black dark:text-white"
      )}
    >

      {/* Text content — padded */}
      <div className="relative shrink-0 flex flex-col gap-6 px-6 pt-10 pb-6 md:gap-10 md:px-8 md:pt-12 md:pb-6 lg:px-12 xl:px-12 2xl:px-30">
        <div className="font-funnel text-[16px] leading-none text-black/65 dark:text-white/70 md:text-[18px]">
          <Link href="/portfolio" className="hover:text-black dark:hover:text-white transition-colors">Work</Link>
          <span className="px-2 text-brand">/</span>
          <span className="text-brand">{heading}</span>
        </div>

        <div className="flex flex-col items-center gap-6 px-0 text-center ">
          <div className="flex flex-col gap-3 md:gap-4">
            {eyebrow ? (
              <p className="font-clash text-[24px] leading-none uppercase text-brand md:text-[28px]">
                {eyebrow}
              </p>
            ) : null}

            <SplitTextReveal as="h1" className="block w-full font-funnel text-[40px] leading-[1.2] tracking-[-1px] text-black dark:text-white md:text-[56px] lg:text-[96px]">
              {heading}
            </SplitTextReveal>
          </div>

          {subheading ? (
            <RevealOnScroll
              as="p"
              className="max-w-150 font-funnel text-[16px] leading-none text-black/80 dark:text-white md:text-[18px]"
              delay={0.15}
            >
              {subheading}
            </RevealOnScroll>
          ) : null}
        </div>
      </div>

      {/* Image — 16:9, sits at the bottom, gets clipped by section overflow-hidden */}
      {imageUrl ? (
        <div className="relative shrink-0 mx-6 md:mx-8 lg:mx-12 xl:mx-12 2xl:mx-30 mb-10 lg:mb-0" style={{ aspectRatio: "16 / 9" }}>
          <div className="absolute inset-0 overflow-hidden bg-[#f2f2f2] dark:bg-[#0f0f0f]">
            <Image
              src={imageUrl}
              alt={heading ?? "Hero image"}
              fill
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-cover"
              priority
            />
          </div>
          {/* BorderWrapper-style overflow corners — spans live on the outer wrapper so they aren't clipped */}
          <span aria-hidden="true" className="pointer-events-none absolute left-0 top-[-2.5%] h-[105%] w-px bg-brand" />
          <span aria-hidden="true" className="pointer-events-none absolute right-0 top-[-2.5%] h-[105%] w-px bg-brand" />
          <span aria-hidden="true" className="pointer-events-none absolute left-[-2.5%] top-0 h-px w-[105%] bg-brand" />
          <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-[-2.5%] h-px w-[105%] bg-brand" />
        </div>
      ) : null}

      {/* Stats — flows below image on mobile, absolutely pinned to section bottom on lg+ */}
      {details.length > 0 ? (
        <div className="relative z-20 mt-auto p-6 border-t border-black/10 backdrop-blur-sm dark:border-white/20 lg:absolute lg:inset-x-0 lg:bottom-0 lg:p-3 lg:pb-8">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:flex lg:flex-row lg:items-stretch">
            {details.map((item, idx, arr) => (
              <div key={item._key ?? `${item.label}-${item.value}`} className={cn("lg:flex-1", arr.length % 2 !== 0 && idx === arr.length - 1 ? "col-span-full" : undefined)}>
                <HighlightCard card={item} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function useScrambleText(text: string | undefined, duration = 2000) {
  const [displayText, setDisplayText] = useState(text || "");
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!text || hasStarted) return;

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [text, hasStarted]);

  useEffect(() => {
    if (!text || !hasStarted) {
      return;
    }

    const targetText = text;
    const iterations = 20;
    const intervalTime = duration / iterations;
    let currentIteration = 0;

    const interval = setInterval(() => {
      currentIteration++;

      if (currentIteration >= iterations) {
        setDisplayText(targetText);
        clearInterval(interval);
        return;
      }

      const progress = currentIteration / iterations;
      const revealedLength = Math.floor(progress * targetText.length);

      let result = targetText.substring(0, revealedLength);

      for (let i = revealedLength; i < targetText.length; i++) {
        if (targetText[i] === " ") {
          result += " ";
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }

      setDisplayText(result);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [text, hasStarted, duration]);

  return { displayText: hasStarted ? displayText : text || "", elementRef };
}

function ScrambleText({
  text,
  className,
}: {
  text: string | undefined;
  className?: string;
}) {
  const { displayText, elementRef } = useScrambleText(text, 2000);

  return (
    <p ref={elementRef} className={className}>
      {displayText}
    </p>
  );
}

function HighlightCard({ card }: { card: StudyHeroDetail }) {
  const value = card.value;
  const label = card.label;

  if (!value && !label) {
    return null;
  }

  return (
    <article className="flex h-full min-h-30 min-w-0 flex-col justify-between gap-2 border border-black/10 bg-white-dark dark:bg-black p-6 md:min-h-0 md:gap-1 md:p-3 lg:gap-2 lg:p-4 dark:border-white/20 dark:bg-[#0f0f0f]">
      {value ? (
        <ScrambleText
          text={value}
          className="font-funnel text-center text-[48px] leading-none text-brand md:text-[48px] lg:text-[48px]"
        />
      ) : null}

      {label ? (
        <p className="font-funnel text-center leading-none text-[24px]">
          {label}
        </p>
      ) : null}
    </article>
  );
}
