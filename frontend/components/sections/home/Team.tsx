"use client";

import { useState } from "react";
import { RevealOnScroll } from "@/components/partials/motion/RevealOnScroll";
import ArrowRight from "@/components/icons/ArrowRight";
import { team as teamFallback } from "@/lib/content/home";
import { cleanStega, urlForImage } from "@/sanity/lib/utils";
import { SectionsWrapper } from "@/components/SectionsWrapper";

/**
 * The Team — frame 141:10964.
 *
 * Member carousel (prev/next cycles through `members[]`) with a
 * supporting portrait image on the right. Closing statement below
 * renders a mixed array of strings + `{ bold }` parts, separated by
 * \n for line breaks.
 *
 * Sanity-aware: pass `data` to drive the section from a Sanity doc
 * (used on About). Without `data` it falls back to home.ts content.
 */

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  portrait?: any;
  order?: number;
};

type ClosingStatementPart = string | { bold: string };

export type TeamData = {
  eyebrow?: string;
  heading?: string;
  members?: Array<TeamMember>;
  closingStatement?: string;
};

export function Team({ data }: { data?: TeamData }) {
  const cleanData = data ? cleanStega(data) : data;

  const team = {
    eyebrow: cleanData?.eyebrow ?? teamFallback.eyebrow,
    heading: cleanData?.heading
      ? cleanData.heading
      : `${teamFallback.heading.faded}\n${teamFallback.heading.bold}`,
    members:
      cleanData?.members && cleanData.members.length > 0
        ? [...cleanData.members].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        : teamFallback.members,
    closingStatement: cleanData?.closingStatement
      ? parseClosingStatement(cleanData.closingStatement)
      : teamFallback.closingStatement,
  };

  const [idx, setIdx] = useState(0);
  const member = team.members[idx] ?? team.members[0];
  const hasMultiple = team.members.length > 1;

  const portraitUrl = member.portrait
    ? urlForImage(member.portrait)?.width(858).height(1046).fit("crop").url()
    : member.portrait;

  return (
    <SectionsWrapper eyebrow={team.eyebrow}>
            <div className="flex flex-1 flex-col gap-12 pb-16 pt-24">
        {/* Top border */}
        <div className="h-px w-full bg-white/20" />

        {/* Heading */}
        <div className="px-12">
          <h2 className="font-funnel text-[48px] leading-[1.2] tracking-[-1px] text-foreground/70">
            {team.heading.split("\n").map((line, idx) => {
              const parts = line.split(/\*\*(.*?)\*\*/);
              return (
                <span key={idx}>
                  {parts.map((part, i) =>
                    i % 2 === 1 ? (
                      <span key={i} className="font-bold text-foreground">
                        {part}
                      </span>
                    ) : (
                      part
                    )
                  )}
                  {idx < team.heading.split("\n").length - 1 && " "}
                </span>
              );
            })}
          </h2>
        </div>

        {/* Team member card */}
        <RevealOnScroll
          as="div"
          stagger={0.15}
          from="bottom"
          distance={24}
          className="flex items-center px-6"
        >
          {/* Left column - info and navigation */}
          <div className="flex flex-1 flex-col items-end">
            <div className="flex max-w-[650px] flex-col gap-16 py-6">
              {/* Navigation arrows */}
              <div className="flex items-start gap-3 px-6">
                <button
                  type="button"
                  aria-label="Previous team member"
                  disabled={!hasMultiple}
                  onClick={() =>
                    setIdx((i) => (i - 1 + team.members.length) % team.members.length)
                  }
                  className="flex items-center justify-center text-foreground transition-opacity disabled:opacity-30"
                >
                  <ArrowRight color="currentColor" width={36} height={24} className="rotate-180" />
                </button>
                <button
                  type="button"
                  aria-label="Next team member"
                  disabled={!hasMultiple}
                  onClick={() => setIdx((i) => (i + 1) % team.members.length)}
                  className="flex items-center justify-center text-foreground transition-opacity disabled:opacity-30"
                >
                  <ArrowRight color="currentColor" width={36} height={24} />
                </button>
              </div>

              {/* Member info */}
              <div className="flex flex-1 flex-col justify-center gap-12">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col px-6">
                    <p className="font-funnel text-[32px] leading-[1.2] tracking-[-1px] text-foreground">
                      {member.name}
                    </p>
                    <p className="font-funnel text-[18px] leading-[1.5] text-foreground/70">
                      {member.role}
                    </p>
                  </div>
                  <div className="h-px w-full bg-white/20" />
                </div>
                <div className="px-6">
                  <p className="font-funnel text-[18px] leading-normal text-foreground">
                    {member.bio}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - photo */}
          <div className="relative h-[523px] w-[429px] shrink-0 overflow-hidden bg-[#0f0f0f]">
            {/* Binary pattern overlay */}
            <p
              className="absolute left-0 top-0 w-full font-mono text-[36px] uppercase leading-[1.4] text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(179.945deg, rgba(239, 239, 239, 0.4) 0.532%, rgba(239, 239, 239, 0.04) 56.559%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
              }}
            >
              10010111010.10010111010.10010111010.10010111010.10010111010.10010111010.10010111010.10010111010.10010111010.10010111010.10010111010.10010111010.10010111010.10010111010.10010111010.10010111010
            </p>
            {/* Portrait image */}
            {portraitUrl ? (
              <img
                src={portraitUrl}
                alt={member.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            {/* Logo overlay - placeholder for now */}
            <div className="absolute left-[21px] top-[21px] h-[81px] w-[63px] bg-brand/20" />
          </div>
        </RevealOnScroll>

        {/* Closing statement */}
        <div className="flex justify-center px-6">
          <p className="flex-1 font-funnel text-[32px] leading-[1.2] tracking-[-1px] text-foreground/70">
            <ClosingStatement parts={team.closingStatement} />
          </p>
        </div>
      </div>
    </SectionsWrapper>
  );
}

function parseClosingStatement(text: string): ClosingStatementPart[] {
  const parts: ClosingStatementPart[] = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push({ bold: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

function ClosingStatement({
  parts,
}: {
  parts: ReadonlyArray<ClosingStatementPart>;
}) {
  return (
    <>
      {parts.map((part, idx) => {
        if (typeof part === "string") {
          const segments = part.split("\n");
          return (
            <span key={`s-${idx}`}>
              {segments.map((seg, i) => (
                <span key={`s-${idx}-${i}`}>
                  {i > 0 ? <br /> : null}
                  {seg}
                </span>
              ))}
            </span>
          );
        }
        return (
          <span key={`b-${idx}`} className="font-semibold text-foreground">
            {part.bold}
          </span>
        );
      })}
    </>
  );
}
