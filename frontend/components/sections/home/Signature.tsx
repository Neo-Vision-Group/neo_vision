"use client";

import { SectionsWrapper } from "@/components/SectionsWrapper";
import { Button } from "@/components/partials/Button";
import { cn } from "@/lib/utils";
import type { DereferencedLink } from "@/sanity/lib/types";
import { cleanStega, linkResolver, urlForImage } from "@/sanity/lib/utils";
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
  cta?: { buttonText?: string; link?: DereferencedLink | null };
  valueCard?: {
    value?: string;
    body?: string | string[];
    graphic?: SanityImageSource;
  };
};

function normalizeLines(value?: string | string[] | null) {
  if (Array.isArray(value)) {
    return value.map((line) => line.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [];
}

export function Signature({ data }: { data?: SignatureData }) {
  const cleanData = data ? cleanStega(data) : data;
  const ctaHref = linkResolver(cleanData?.cta?.link ?? undefined);
  const ctaLabel = cleanData?.cta?.buttonText?.trim();
  const valueCardValue = cleanData?.valueCard?.value?.trim();
  const valueCardBody = normalizeLines(cleanData?.valueCard?.body);
  const ctaData =
    ctaLabel && ctaHref
      ? {
          label: ctaLabel,
          href: ctaHref,
        }
      : null;
  const valueCardData =
    valueCardValue && valueCardBody.length > 0
      ? {
          value: valueCardValue,
          body: valueCardBody,
          graphic: cleanData?.valueCard?.graphic,
        }
      : null;

  const signature = {
    eyebrow: cleanData?.eyebrow?.trim(),
    heading: cleanData?.heading?.trim(),
    body: cleanData?.body?.trim(),
    secondaryLine: cleanData?.secondaryLine?.trim(),
    steps:
      cleanData?.steps
        ?.map((step, idx) => {
          const title = step.title?.trim();
          const duration = step.duration?.trim();
          const body = step.body?.trim();

          if (!title || !duration || !body) {
            return null;
          }

          return {
        number: `${String(idx + 1).padStart(2, "0")}.`,
            title,
            duration,
            body,
        textured: step.textured,
        graphic: step.graphic,
          };
        })
        .filter((step): step is NonNullable<typeof step> => Boolean(step)) ?? [],
  };

  if (
    !signature.heading &&
    !signature.body &&
    !signature.secondaryLine &&
    signature.steps.length === 0 &&
    !ctaData &&
    !valueCardData
  ) {
    return null;
  }

  const headingLines = signature.heading?.split("\n").filter(Boolean) ?? [];

  return (
    <SectionsWrapper id="signature-model" eyebrow={signature.eyebrow}>
      <div className="flex flex-col gap-12 md:gap-16">
        <div className="flex flex-col gap-6">
          {headingLines.length > 0 ? (
            <h2 className="text-[28px] leading-9 tracking-[-0.3px] text-foreground md:text-[36px] md:leading-12 lg:text-[44px] lg:leading-14 2xl:text-5xl 2xl:leading-14.5 2xl:tracking-[-0.4px]">
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
          ) : null}
          {signature.body ? (
            <p className="max-w-195 dark:text-[#efefefb3] text-[#040404b3]">
              {signature.body}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col">
          <div className="py-6">
            {signature.secondaryLine ? (
              <p className="text-3xl leading-[1.3] md:text-100">
                {signature.secondaryLine}
              </p>
            ) : null}
          </div>
          <div className="h-px w-full dark:bg-[#efefefb3] bg-[#040404b3]" />

          <RevealOnScroll
            as="div"
            stagger={0.12}
            from="bottom"
            distance={24}
            className="grid grid-cols-1 lg:grid-cols-2 lg:auto-rows-fr"
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
          {ctaData || valueCardData ? (
            <div className="grid gap-6 py-8 lg:grid-cols-2 md:gap-6">
              {ctaData ? (
                <Button
                  href={ctaData.href}
                  variant="primary"
                  className="h-full min-h-30 self-stretch px-8 md:min-h-38 md:px-10"
                >
                  {ctaData.label}
                </Button>
              ) : null}
              {valueCardData ? <ValueCard valueCard={valueCardData} /> : null}
            </div>
          ) : null}
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
        "relative h-full p-4 lg:p-6",
        showBottomBorder && "md:border-b border-white/20",
      showRightBorder && "md:border-r border-white/20",
        !showBottomBorder && "border-t border-white/20 md:border-t-0"
      )}
    >
      <div className="group/step relative isolate flex h-full flex-col gap-8 overflow-hidden border border-white/10 bg-[#f7f7f7] p-6 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-brand/40 dark:bg-[#0F0F0F] lg:p-8">
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
          <span className="font-betatron text-4xl leading-none text-brand">
            {step.number}
          </span>
          <div className="flex flex-1 flex-col">
            <h3 className="text-[20px] font-medium leading-[1.3] tracking-[-0.15px] text-foreground md:text-100">
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
  valueCard: { value: string; body: string[]; graphic?: SanityImageSource };
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
      <p className="text-center text-4xl leading-[1.2] text-foreground md:text-[40px]">
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
