import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cn } from "@/lib/utils";
import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";
import Image from 'next/image'

const signatureStepHoverGraphic = "/images/graphic.webp";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  { ssr: false }
);

export type StudyKeyWinsData = {
  eyebrow?: string;
  heading?: string;
  comparison?: {
    beforeLabel?: string;
    afterLabel?: string;
    rows?: Array<{ label?: string; before?: string; after?: string }>;
  };
};

type ComparisonCard = {
  key: "before" | "after";
  label?: string;
  accentClassName: string;
  cardClassName: string;
  valueKey: "before" | "after";
  textured?: boolean;
};

export function StudyKeyWins({ data }: { data?: StudyKeyWinsData }) {
  const cleanData = data ? cleanStega(data) : data;

  const eyebrow = cleanData?.eyebrow ?? "THE KEY WINS";
  const heading = cleanData?.heading;
  const comparison = cleanData?.comparison;
  const rows = comparison?.rows ?? [];
  const beforeLabel = comparison?.beforeLabel;
  const afterLabel = comparison?.afterLabel;

  if (rows.length === 0) {
    return null;
  }

  const cards: ComparisonCard[] = [
    {
      key: "before",
      label: beforeLabel,
      accentClassName: "text-black dark:text-white",
      valueKey: "before",
      cardClassName:
        "border-black/10 bg-[#f7f7f7] shadow-[0_20px_60px_rgba(4,4,4,0.06)] dark:border-white/10 dark:bg-[#0f0f0f] dark:shadow-none",
    },
    {
      key: "after",
      label: afterLabel,
      accentClassName: "text-brand",
      valueKey: "after",
      cardClassName:
        "border-brand/20 bg-[#fff4ef] shadow-[0_24px_80px_rgba(255,68,4,0.12)] dark:border-white/10 dark:bg-[#111111] dark:shadow-[0_24px_80px_rgba(255,68,4,0.08)]",
      textured: true,
    },
  ];

  return (
    <SectionsWrapper
      id="key-wins"
      eyebrow={eyebrow}
    >
      <div className="flex flex-col gap-12">
        {heading ? (
          <h2 className="max-w-[16ch] text-4xl leading-[1.1] tracking-[-1px] text-black dark:text-white md:text-[40px] lg:text-5xl">
            {heading}
          </h2>
        ) : null}

        <RevealOnScroll
          as="div"
          stagger={0.08}
          from="bottom"
          distance={28}
          duration={0.9}
          className="grid grid-cols-1 gap-6 xl:grid-cols-2"
        >
          {cards.map((card) => (
            <article
              key={card.key}
              className={cn(
                "group relative isolate flex min-h-112 flex-col justify-between overflow-hidden border p-8 transition-all duration-300 ease-out hover:-translate-y-0.5 md:p-10  xl:p-12",
                card.cardClassName
              )}
            >
              {card.textured ? (
                <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-white dark:bg-black">      
                  <Image
                    src={signatureStepHoverGraphic}
                    alt=""
                    fill
                    className="absolute inset-0 object-cover invert dark:invert-0"
                  />
                  <div
                    className="absolute inset-0 mix-blend-screen dark:hidden"
                    style={{ background: "#ff4404" }}
                  />
                  <div
                    className="absolute inset-0 hidden mix-blend-multiply dark:block"
                    style={{
                      background: "#ff4404",
                    }}
                  />
                  <div
                    className="absolute inset-0 dark:hidden"
                    style={{
                      backgroundImage: `
                        linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.45) 14%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.45) 86%, rgba(255,255,255,0.9) 100%),
                        linear-gradient(90deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.4) 12%, rgba(255,255,255,0) 24%, rgba(255,255,255,0) 76%, rgba(255,255,255,0.4) 88%, rgba(255,255,255,0.82) 100%),
                        linear-gradient(180deg, rgba(255,68,4,0.08) 0%, rgba(255,68,4,0.18) 100%)
                      `,
                    }}
                  />
                  <div
                    className="absolute inset-0 hidden dark:block"
                    style={{
                      backgroundImage: `
                        linear-gradient(180deg, rgba(11,11,11,0.88) 0%, rgba(11,11,11,0.42) 16%, rgba(11,11,11,0) 32%, rgba(11,11,11,0) 68%, rgba(11,11,11,0.42) 84%, rgba(11,11,11,0.88) 100%),
                        linear-gradient(90deg, rgba(11,11,11,0.88) 0%, rgba(11,11,11,0.42) 12%, rgba(11,11,11,0) 24%, rgba(11,11,11,0) 76%, rgba(11,11,11,0.42) 88%, rgba(11,11,11,0.88) 100%),
                        linear-gradient(180deg, rgba(15,15,15,0.18) 0%, rgba(15,15,15,0.84) 100%)
                      `,
                    }}
                  />
                </div>
              ) : (
                <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(4,4,4,0.04),transparent)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]" />
              )}

              <div className="relative flex flex-col gap-10">
                <div className="flex flex-col gap-4">
                  <span className="font-betatron text-caption uppercase tracking-[-0.16px] text-black/55 dark:text-white/50">
                    {card.key === "before" ? "Before" : "After"}
                  </span>
                  <h3
                    className={cn(
                      "max-w-[12ch] text-4xl leading-[1.05] tracking-[-1px] md:text-[40px]",
                      card.accentClassName
                    )}
                  >
                    {card.label}
                  </h3>
                </div>

                <div className="flex flex-col">
                  {rows.map((row, index) => (
                    <div
                      key={`${row.label}-${card.key}-${index}`}
                      className="grid grid-cols-1 gap-3 border-b border-black/10 py-4 dark:border-white/10 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-6"
                    >
                      <p className="text-sm font-funnel uppercase tracking-[-0.16px] text-black/45 dark:text-white/45">
                        {row.label}
                      </p>
                      <p className="text-base leading-6 text-black/75 dark:text-white/72 md:text-right md:text-[18px] md:leading-7">
                        {row[card.valueKey]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </RevealOnScroll>
      </div>
    </SectionsWrapper>
  );
}
