"use client";

import posthog from '@/lib/posthog-client';
import { Button } from "@/components/partials/Button";

export function InsightClosingCta() {
  return (
    <section id="closing" className="px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-16">
      <div className="flex flex-col gap-6 border border-brand/40 bg-surface p-8 md:p-12 max-w-4xl mx-auto">
        <h2 className="text-[36px] font-normal leading-[1.2] tracking-[-1px] text-foreground md:text-[44px]">
          Ready to ship this? <span className="font-bold">Let&apos;s talk scope.</span>
        </h2>
        <p className="max-w-[60ch] text-[18px] text-foreground/70">
          Every engagement starts with a short discovery, no sales pitch.
        </p>
        <div>
          <Button
            href="/contact"
            variant="primary"
            onClick={() => posthog.capture("insight_cta_clicked", { cta_label: "Book a call", destination: "/contact" })}
          >
            Book a call
          </Button>
        </div>
      </div>
    </section>
  );
}