"use client";

import { SectionsWrapper } from "@/components/SectionsWrapper";
import { Button } from "@/components/partials/Button";
import { cn } from "@/lib/utils";
import { signatureModel as signatureFallback } from "@/lib/content/home";
import { cleanStega, urlForImage } from "@/sanity/lib/utils";
import type { SanityImageSource } from "@sanity/image-url";
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

export type SignatureData = {
  eyebrow?: string;
  heading?: string;
  body?: string;
  secondaryLine?: string;
  steps?: Array<{
    title: string;
    duration: string;
    body: string;
    textured?: boolean;
    graphic?: SanityImageSource;
  }>;
  cta?: { buttonText?: string; link?: any };
  valueCard?: {
    value: string;
    body: string;
    graphic?: SanityImageSource;
  };
};

export function Signature({ data }: { data?: SignatureData }) {
  const cleanData = data ? cleanStega(data) : data;

  const signature = {
    eyebrow: cleanData?.eyebrow ?? signatureFallback.eyebrow,
    heading: cleanData?.heading ?? `${signatureFallback.heading.faded}\n${signatureFallback.heading.bold}`,
    body: cleanData?.body ?? signatureFallback.body,
    secondaryLine: cleanData?.secondaryLine ?? signatureFallback.secondaryLine,
    steps: cleanData?.steps?.map((step, idx) => ({
      number: `${String(idx + 1).padStart(2, "0")}.`,
      title: step.title,
      duration: step.duration,
      body: step.body,
      textured: step.textured,
      graphic: step.graphic,
    })) ?? signatureFallback.steps,
    cta: {
      label: cleanData?.cta?.buttonText ?? signatureFallback.cta.label,
      href: cleanData?.cta?.link?.href ?? cleanData?.cta?.link?.page ?? cleanData?.cta?.link?.post ?? signatureFallback.cta.href,
    },
    valueCard: {
      value: cleanData?.valueCard?.value ?? signatureFallback.valueCard.value,
      body: cleanData?.valueCard?.body ? cleanData.valueCard.body.split('\n').filter(Boolean) : signatureFallback.valueCard.body,
      graphic: cleanData?.valueCard?.graphic,
    },
  };

  const headingLines = signature.heading.split('\n').filter(Boolean);

  return (
    <SectionsWrapper id="signature-model" eyebrow={signature.eyebrow}>
      <div className="flex flex-col gap-12 md:gap-16">
        <div className="flex flex-col gap-6">
          <h2 className="text-[28px] leading-9 tracking-[-0.3px] text-foreground md:text-[36px] md:leading-12 lg:text-[44px] lg:leading-14 2xl:text-12 2xl:leading-14.5 2xl:tracking-[-0.4px]">
            {headingLines.map((line, idx) => (
              <span key={idx}>
                {idx === 0 ? (
                  <SplitTextReveal
                    as="span"
                    type="words"
                    stagger={0.04}
                    colorReveal
                    className="font-normal text-foreground/70"
                  >
                    {line}
                  </SplitTextReveal>
                ) : (
                  <>
                    <br />
                    <SplitTextReveal
                      as="span"
                      type="words"
                      stagger={0.04}
                      colorReveal
                      className="font-bold"
                    >
                      {line}
                    </SplitTextReveal>
                  </>
                )}
              </span>
            ))}
          </h2>
          <p className="max-w-[780px] text-body text-foreground">
            {signature.body}
          </p>
        </div>

        <div className="flex flex-col">
          <div className="py-6">
            <p className="text-[20px] font-bold leading-[1.3] text-foreground md:text-6">
              {signature.secondaryLine}
            </p>
          </div>
          <div className="h-px w-full bg-white/20" />

          <RevealOnScroll
            as="div"
            stagger={0.12}
            from="bottom"
            distance={24}
            className="grid grid-cols-1 lg:grid-cols-2"
          >
            {signature.steps.map((step, idx) => (
              <StepCard
                key={step.number}
                step={step}
                showBottomBorder={idx < 2}
                showRightBorder={idx % 2 === 0}
              />
            ))}
          </RevealOnScroll>
          <div className="h-px w-full bg-white/20" />

          <div className="grid gap-6 py-8 lg:grid-cols-2 md:gap-6">
            <Button
              href={signature.cta.href}
              variant="primary"
              className="h-full min-h-30 self-stretch px-8 md:min-h-[152px] md:px-10"
            >
              {signature.cta.label}
            </Button>
            <ValueCard valueCard={signature.valueCard} />
          </div>
        </div>
      </div>
    </SectionsWrapper>
  );
}

function StepCard({
  step,
  showBottomBorder,
  showRightBorder,
}: {
  step: {
    number: string;
    title: string;
    duration: string;
    body: string;
    textured?: boolean;
    graphic?: SanityImageSource;
  };
  showBottomBorder: boolean;
  showRightBorder: boolean;
}) {
  const graphicUrl = step.graphic
    ? urlForImage(step.graphic).width(1600).fit("max").url()
    : "/figma/signature-texture.png";
  const isTextured = Boolean(step.textured);

  return (
    <div
      className={cn(
        "relative p-4 lg:p-6",
        showBottomBorder && "md:border-b border-white/20",
      showRightBorder && "md:border-r border-white/20",
        !showBottomBorder && "border-t border-white/20 md:border-t-0"
      )}
    >
      <div className="group/step relative isolate flex flex-col dark:bg-[#0F0F0F] bg-[#f7f7f7] gap-8 overflow-hidden border border-white/10 p-6 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-brand/40 lg:p-8">
        {isTextured ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-white dark:bg-black"
          >
            <img
              src={graphicUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover invert dark:invert-0"
            />
            <div
              className="absolute inset-0 mix-blend-screen dark:hidden"
              style={{ background: "#ff4404" }}
            />
            <div
              className="absolute inset-0 hidden mix-blend-multiply dark:block"
              style={{ background: "#ff4404" }}
            />
          </div>
        ) : null}

        <div className="flex items-start gap-6">
          <span className="font-betatron text-12 leading-none tracking-[-2.88px] text-brand">
            {step.number}
          </span>
          <div className="flex flex-1 flex-col">
            <h3 className="text-[20px] font-medium leading-[1.3] tracking-[-0.15px] text-foreground md:text-6">
              {step.title}
            </h3>
            <p className="text-body text-foreground">{step.duration}</p>
          </div>
        </div>
        <p className="text-body text-foreground">{step.body}</p>
      </div>
    </div>
  );
}

function ValueCard({
  valueCard,
}: {
  valueCard: { value: string; body: readonly string[]; graphic?: SanityImageSource };
}) {
  const graphicUrl = valueCard.graphic
    ? urlForImage(valueCard.graphic).width(1600).fit("max").url()
    : "/figma/signature-texture.png";

  return (
    <div className="relative isolate flex flex-col gap-6 border border-white/15 bg-[#EFEFEFB3] p-6 dark:bg-black">
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-white dark:bg-black">
        <img
          src={graphicUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover invert dark:invert-0"
        />
        <div
          className="absolute inset-0 mix-blend-screen dark:hidden"
          style={{ background: "#ff4404" }}
        />
        <div
          className="absolute inset-0 hidden mix-blend-multiply dark:block"
          style={{ background: "#ff4404" }}
        />
      </div>
      <p className="text-center text-deco-h4 leading-[1.2] text-foreground md:text-[40px]">
        {valueCard.value}
      </p>
      <div className="text-center text-body text-foreground">
        {valueCard.body.map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </div>
    </div>
  );
}
