"use client";

import { useRef, useState, useId } from "react";
import { PortableText, type PortableTextBlock } from "@portabletext/react";
import { cn } from "@/lib/utils";
import { SectionsWrapper } from "@/components/SectionsWrapper";

export type FaqData = {
  eyebrow?: string;
  heading?: string;
  items: Array<{
    question: string;
    /** Either Portable Text blocks from Sanity, or plain string. */
    answer?: PortableTextBlock[] | string;
    /** Alias used by content fallback files that keep answers as plain text. */
    answerPlain?: string;
  }>;
};

export function FAQ({ data }: { data?: FaqData }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const groupId = useId();

  const items = data?.items ?? [];

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
    <SectionsWrapper eyebrow={data?.eyebrow ?? "FAQ"}>
      <div className="flex flex-col gap-12 lg:flex-row lg:gap-0">
        {/* Sidebar */}
        <div className="flex shrink-0 flex-col gap-6 lg:w-[372px] lg:pt-24">
          <div className="h-px w-full bg-white/20" />
          <div className="px-12 py-6">
            <p className="font-betatron text-[32px] leading-[1.2] text-foreground">
              {data?.eyebrow ?? "FREQUENTLY ASKED"}
            </p>
          </div>
          <div className="h-px w-full bg-white/20" />
        </div>

        {/* Divider */}
        <div className="hidden h-px w-full bg-white/20 lg:block lg:w-px lg:flex-none" />

        {/* Main content */}
        <div className="flex flex-1 flex-col gap-12 pt-24 lg:gap-12">
          <div className="h-px w-full bg-white/20" />
          <div className="px-12">
            <h2 className="font-funnel text-[48px] leading-[1.2] tracking-[-1px] text-foreground lg:text-[48px]">
              {data?.heading ?? "Common questions."}
            </h2>
          </div>

          <div className="flex flex-col gap-6 px-6 lg:px-12">
            {items.map((item, idx) => {
              const open = openIdx === idx;
              const headingId = `${groupId}-${idx}`;
              const panelId = `${groupId}-${idx}-panel`;
              return (
                <li key={item.question} className="list-none">
                  <button
                    id={headingId}
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIdx(open ? null : idx)}
                    onKeyDown={(e) => handleKey(e, idx)}
                    className={cn(
                      "group w-full border border-white/20 bg-[#0f0f0f] p-12 text-left transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    )}
                  >
                    <div className="flex items-start gap-12">
                      <span
                        className={cn(
                          "flex-1 font-funnel text-[32px] leading-[1.2] tracking-[-1px]",
                          open ? "text-foreground" : "text-foreground/90"
                        )}
                      >
                        {item.question}
                      </span>
                      <ToggleIcon open={open} />
                    </div>
                    <Panel open={open} id={panelId} labelledBy={headingId}>
                      <AnswerContent item={item} />
                    </Panel>
                  </button>
                </li>
              );
            })}
          </div>
        </div>
      </div>
    </SectionsWrapper>
  );
}

function ToggleIcon({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center",
        "transition-colors duration-200",
        open ? "text-brand" : "text-foreground/60 group-hover:text-foreground"
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
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      hidden={!open}
      className="pb-6 pr-8 text-body text-foreground/80 md:text-[18px] md:leading-[28px]"
    >
      {children}
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
