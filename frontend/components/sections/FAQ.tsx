"use client";

import { useId, useState } from "react";
import { PortableText, type PortableTextBlock } from "@portabletext/react";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cn } from "@/lib/utils";
import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";

const SplitTextReveal = dynamic(
  () =>
    import("@/components/partials/motion/SplitTextReveal").then(
      (mod) => mod.SplitTextReveal
    ),
  { ssr: false }
);

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
  const items = cleanData?.items ?? [];
  const [openIdx, setOpenIdx] = useState<number | null>(items.length > 0 ? 0 : null);
  const groupId = useId();
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
      <div className="flex flex-col gap-8 md:gap-12">
        <div className="w-full md:max-w-227 md:px-6">
          <SplitTextReveal
            colorReveal
            as="h2"
            className="font-funnel text-[36px] leading-[1.15] tracking-[-1px] text-foreground md:text-5xl md:leading-[1.2]"
          >
            {heading}
          </SplitTextReveal>
        </div>

        <ul className="flex w-full max-w-227 flex-col gap-4 md:gap-6">
          {items.map((item, idx) => {
            const open = openIdx === idx;
            const headingId = `${groupId}-${idx}`;
            const panelId = `${groupId}-${idx}-panel`;

            return (
              <li
                key={item.question}
                className={cn(
                  "overflow-hidden border border-border bg-white dark:bg-black transition-colors duration-200",
                  open && "border-brand/30"
                )}
              >
                <button
                  id={headingId}
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenIdx(open ? null : idx)}
                  onKeyDown={(e) => handleKey(e, idx)}
                  className={cn(
                    "group flex w-full items-start gap-6 p-6 text-left transition-colors duration-200 md:gap-12 md:p-12",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  )}
                >
                  <span className="flex-1 font-funnel text-100 text-black dark:text-white leading-[1.2] tracking-[-0.72px] md:text-deco-h4 md:tracking-[-1px]">
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
      className="relative mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center text-brand md:h-12 md:w-12"
    >
      <span className="absolute left-1/2 top-1/2 h-1 w-5 -translate-x-1/2 -translate-y-1/2 bg-current md:h-1 md:w-7" />
      <span
        className={cn(
          "absolute left-1/2 top-1/2 h-5 w-1 -translate-x-1/2 -translate-y-1/2 bg-current transition-transform duration-200 md:h-7 md:w-1",
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
      aria-hidden={!open}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
    >
      <div className="overflow-hidden">
        <div className="px-6 pb-6 text-64 leading-[1.55] text-foreground/70 md:px-12 md:pb-12 md:text-[18px] md:leading-normal">
          {children}
        </div>
      </div>
    </div>
  );
}

function AnswerContent({ item }: { item: FaqItem }) {
  const answer = item.answer ?? item.answerPlain;
  if (!answer) return null;

  if (typeof answer === "string") {
    return <p className="max-w-[72ch]">{answer}</p>;
  }

  return (
    <div className="prose-none max-w-[72ch] [&_p]:mb-3 [&_p:last-child]:mb-0">
      <PortableText value={answer} />
    </div>
  );
}
