"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { urlForImage } from "@/sanity/lib/utils";
import type { InsightAuthorData } from "@/app/insights/[slug]/page";

interface InsightAuthorProps {
  author?: InsightAuthorData | null;
}

export function InsightAuthor({ author }: InsightAuthorProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isDarkTheme = !mounted || theme === "dark";

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  const hasContent = Boolean(
    author?.name || author?.role || author?.bio || author?.portrait
  );

  if (!hasContent) return null;

  const portraitUrl = author?.portrait
    ? urlForImage(author.portrait)?.width(858).height(1046).fit("crop").url()
    : null;

  return (
    <section
      id="author"
      className="py-16 bg-white dark:bg-dark"
    >
      <div className="bg-white dark:bg-dark">
        <div className="border-t border-black/10 dark:border-white/10" />
        <div className="flex flex-col gap-8 overflow-hidden py-8 px-6 lg:px-8 xl:px-16 2xl:px-30 lg:flex-row lg:justify-between lg:items-stretch">
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div className="flex min-w-0 w-full flex-col gap-12 pb-6 md:gap-16 md:py-6 lg:pr-12">
              <div className="flex min-w-0 flex-col gap-6 text-left">
                <div className="flex flex-col gap-6">
                  <div className="flex min-w-0 flex-col">
                    {author?.name ? (
                      <p className="font-funnel text-[32px] leading-[1.08] tracking-[-0.9px] text-muted dark:text-muted md:text-[48px] lg:text-[56px]">
                        {author.name}
                      </p>
                    ) : null}
                    {author?.role ? (
                      <p className="font-funnel text-64 text-muted dark:text-muted md:text-[18px]">
                        {author.role}
                      </p>
                    ) : null}
                  </div>
                  <div className="h-px w-full bg-decoration-dark dark:bg-decoration-light" />
                </div>
                {author?.bio ? (
                  <div className="min-w-0">
                    <p className="font-funnel text-64 leading-normal text-foreground md:text-[18px]">
                      {author.bio}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="relative w-full max-w-[360px] self-center lg:self-start lg:max-w-none lg:w-108">
            <div className="relative aspect-square w-full max-w-[360px] shrink-0 overflow-hidden bg-white dark:bg-dark lg:max-w-none lg:w-108">
              <BinaryGlitchField isDark={isDarkTheme} />
              <div className="absolute inset-0" />
              {portraitUrl ? (
                <div className="absolute inset-0 z-10 overflow-hidden">
                  <div className="relative size-full">
                    <Image
                      src={portraitUrl}
                      alt={author?.name ?? "Article author portrait"}
                      fill
                      sizes="(min-width: 1024px) 432px, 100vw"
                      className="object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 z-10 flex items-center justify-center text-[40px] font-medium text-foreground/35">
                  {getInitials(author?.name)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BinaryGlitchField({ isDark }: { isDark: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const initId = setTimeout(() => {
      setMounted(true);
      setLines(createBinaryLines());
    }, 0);

    if (mediaQuery?.matches) {
      return () => clearTimeout(initId);
    }

    const interval = window.setInterval(() => {
      setLines(createBinaryLines());
    }, 70);

    const stopId = setTimeout(() => {
      window.clearInterval(interval);
    }, 3500);

    return () => {
      clearTimeout(initId);
      clearTimeout(stopId);
      window.clearInterval(interval);
    };
  }, []);

  if (!mounted) return null;

  const dotColor = isDark ? "220,220,220" : "30,30,30";

  return (
    <div className="absolute inset-[-8%] overflow-hidden">
      <div className="absolute inset-0" />
      <div
        className="absolute inset-0 font-mono text-[22px] leading-[1.05] md:text-[28px] select-none"
        style={{ color: `rgb(${dotColor})` }}
      >
        {lines.map((line, index) => (
          <p
            key={`${index}-${line.slice(0, 10)}`}
            className="whitespace-nowrap"
            style={{
              transform: `translate3d(${index % 2 === 0 ? "-3%" : "1%"}, ${
                index * 92
              }%, 0)`,
              maskImage: `radial-gradient(circle at center, rgba(0,0,0,1) 0.5px, transparent 1.2px)`,
              maskSize: "2.5px 2.5px",
              WebkitMaskImage: `radial-gradient(circle at center, rgba(0,0,0,1) 0.5px, transparent 1.2px)`,
              WebkitMaskSize: "2.5px 2.5px",
            }}
          >
            {line}
          </p>
        ))}
      </div>
      <div className="absolute inset-0" />
    </div>
  );
}

function createBinaryLines(lineCount = 9, lineLength = 28) {
  return Array.from({ length: lineCount }, () =>
    Array.from({ length: lineLength }, (_, i) =>
      i % 11 === 10 ? "." : (Math.random() > 0.5 ? "1" : "0")
    ).join("")
  );
}

function getInitials(name?: string | null) {
  if (!name) return "NVT";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

