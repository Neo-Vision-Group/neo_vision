import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cleanStega } from "@/sanity/lib/utils";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  { ssr: false }
);

const SplitTextReveal = dynamic(
  () =>
    import("@/components/partials/motion/SplitTextReveal").then(
      (mod) => mod.SplitTextReveal
    ),
  { ssr: false }
);

export type SoundFamiliarData = {
  eyebrow?: string;
  heading?: string;
  painPoints?: Array<{
    _key?: string;
    title?: string;
    body?: string;
  }>;
};

export function SoundFamiliar({ data }: { data?: SoundFamiliarData }) {
  const cleanData = data ? cleanStega(data) : data;

  if (!cleanData?.painPoints || cleanData.painPoints.length === 0) {
    return null;
  }

  return (
    <SectionsWrapper
      id="sound-familiar"
      eyebrow={cleanData?.eyebrow ?? "SOUND FAMILIAR?"}
      classNameOverride="px-0"
    >
      <div className="flex flex-col gap-12 pb-24">
        {cleanData?.heading && (
          <div className="px-6 lg:px-8 xl:px-16">
            <SplitTextReveal
              as="h2"
              type="words"
              stagger={0.04}
              colorReveal
              className="text-[28px] leading-12 tracking-[-0.3px] text-foreground md:text-[36px] md:leading-12 lg:text-[44px] lg:leading-14"
            >
              {cleanData.heading}
            </SplitTextReveal>
          </div>
        )}
        <div className="border-t border-black/20 dark:border-white/20">
          <RevealOnScroll
            as="div"
            stagger={0.08}
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {cleanData.painPoints.map((p, idx) => (
                <div
                  key={(p.title ?? "pp") + idx}
                  className={cn(
                    "p-6 border-b border-black/20 dark:border-white/20 flex flex-col",
                    (idx + 1) % 2 !== 0 && "md:border-r md:border-black/20 md:dark:border-white/20"
                  )}
                >
                  <article className="group relative isolate flex flex-1 flex-col gap-12 border border-white/10 bg-white-light dark:border-white/20 dark:bg-[#0f0f0f] p-6 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-brand/40">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 ease-out dark:group-hover:opacity-100"
                    >
                      <div
                        className="absolute inset-0"
                        style={{ background: "#4a0e00" }}
                      />
                      <div
                        className="absolute inset-0 mix-blend-multiply"
                        style={{ background: "#7a1a00" }}
                      />
                    </div>
                    <h3 className="text-[32px] text-brand font-clash">{p.title}</h3>
                    <p className="font-funnel text-muted-light dark:text-muted-dark text-[18px]">{p.body}</p>
                  </article>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </SectionsWrapper>
  );
}
