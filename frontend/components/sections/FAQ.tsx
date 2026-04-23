"use client";

import { useState, useId } from "react";
import { PortableText, type PortableTextBlock } from "@portabletext/react";
import { cn } from "@/lib/utils";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cleanStega } from "@/sanity/lib/utils";

export type FaqItem = {
  question: string;
  /** Either Portable Text blocks from Sanity, or plain string. */
  answer?: PortableTextBlock[] | string;
  /** Alias used by content fallback files that keep answers as plain text. */
  answerPlain?: string;
};

export type FaqData = {
  eyebrow?: string;
  heading?: string;
  items?: FaqItem[];
};

export function FAQ({ data }: { data?: FaqData }) {
  const cleanData = data ? cleanStega(data) : data;
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const groupId = useId();

  const items = cleanData?.items ?? [];
  const eyebrow = cleanData?.eyebrow ?? "FREQUENTLY ASKED";
  const heading = cleanData?.heading ?? "Common questions.";

  function handleKey(e: React.KeyboardEvent<HTMLButtonElement>, idx: number) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (idx + 1) % items.length;
      document.getElementById(`${groupId}-${next}`)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (idx - 1 + items.length) % items.length;
      document.getElementById(`${groupId}-${prev}`)?.focus();
    }
  }

  return (
    <SectionsWrapper id="faq" eyebrow={eyebrow}>
      <div className="flex flex-col gap-12">
        <h2 className="text-[28px] leading-[36px] tracking-[-0.3px] text-black dark:text-[#efefef] md:text-[36px] md:leading-[46px] lg:text-[44px] lg:leading-[54px] 2xl:text-[48px] 2xl:leading-[58px] 2xl:tracking-[-0.4px]">
          <span className="text-black/70 dark:text-[#efefef]/70">{heading}</span>
        </h2>

        <ul className="flex w-full flex-col gap-4">
          {items.map((item, idx) => {
            const open = openIdx === idx;
            const headingId = `${groupId}-${idx}`;
            const panelId = `${groupId}-${idx}-panel`;
            return (
              <li
                key={item.question}
                className="border p-12 border-black/10 dark:border-white/10 bg-gray-100 dark:bg-[#1a1a1a] overflow-hidden"
              >
                <button
                  id={headingId}
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenIdx(open ? null : idx)}
                  onKeyDown={(e) => handleKey(e, idx)}
                  className={cn(
                    "group flex w-full items-start gap-4 text-left font-funnel md:text-[20px] md:leading-[28px]",
                    "transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  )}
                >
                  <span
                    className={cn(
                      "flex-1 font-medium tracking-[-0.2px]",
                      open ? "text-black dark:text-[#efefef]" : "text-black/90 font-funnel dark:text-[#efefef]/90"
                    )}
                  >
                    {item.question}
                  </span>
                  <ToggleIcon open={open} />
                </button>
                <Panel open={open} id={panelId} labelledBy={headingId}>
                  <AnswerContent item={item} />
                </Panel>
              </li>
            );
          })}
        </ul>
      </div>
    </SectionsWrapper>
  );
}

function ToggleIcon({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
        "transition-colors duration-200",
        open ? "text-orange-500" : "text-orange-500/80 group-hover:text-orange-500"
      )}
    >
      {/* Horizontal bar (always visible) */}
      <span className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-current" />
      {/* Vertical bar (hidden when open — makes a minus) */}
      <span
        className={cn(
          "absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-current transition-transform duration-200",
          open ? "scale-y-0" : "scale-y-100"
        )}
      />
    </span>
  );
}

function Panel({
  open,
  id,
  labelledBy,
  children,
}: {
  open: boolean;
  id: string;
  labelledBy: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      hidden={!open}
      className="text-body text-black/80 dark:text-[#efefef]/80 md:text-[18px] md:leading-[28px]"
    >
      {children}
    </div>
  );
}

function AnswerContent({ item }: { item: FaqItem }) {
  const answer = item.answer ?? item.answerPlain;
  if (!answer) return null;
  if (typeof answer === "string") {
    return <p className="max-w-[72ch] text-black/80 dark:text-[#efefef]/80">{answer}</p>;
  }
  return (
    <div className="prose-none max-w-[72ch] text-black/80 dark:text-[#efefef]/80 [&_p:last-child]:mb-0">
      <PortableText value={answer} />
    </div>
  );
}
