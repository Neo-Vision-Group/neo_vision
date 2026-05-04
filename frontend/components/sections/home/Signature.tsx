"use client";

import { SectionsWrapper } from "@/components/SectionsWrapper";
import { Button } from "@/components/partials/Button";
import { PortableTextRenderer } from "@/components/partials/PortableTextRenderer";
import { cn } from "@/lib/utils";
import type { DereferencedLink } from "@/sanity/lib/types";
import { cleanStega, linkResolver, urlForImage } from "@/sanity/lib/utils";
import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url";
import dynamic from "next/dynamic";

const signatureStepHoverGraphic = "/images/cta-graphic.jpg";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  { ssr: false }
);

export type SignatureData = {
  eyebrow?: string;
  heading?: PortableTextBlock[];
  body?: string;
  secondaryLine?: string;
  steps?: Array<{
    title: string;
    duration: string;
    body: string;
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
    heading: cleanData?.heading,
    body: cleanData?.body?.trim(),
    secondaryLine: cleanData?.secondaryLine?.trim(),
    steps:
      cleanData?.steps
        ?.map((step, idx) => {
          const title = step.title?.trim();
          const duration = step.duration?.trim();
          const body = step.body?.trim();

          if (!title || !body) {
            return null;
          }

          return {
            number: `${String(idx + 1).padStart(2, "0")}.`,
            title,
            duration,
            body,
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

  return (
    <SectionsWrapper id="signature-model" eyebrow={signature.eyebrow} classNameOverride="px-0">
      <div className="flex flex-col gap-12 md:gap-16">
        <div className="flex flex-col gap-6 px-6 lg:px-16">
          {signature.heading?.length ? (
            <PortableTextRenderer
              value={signature.heading}
              className={cn(
                "[&_p]:my-0",
                "[&_p]:font-funnel",
                "[&_p]:text-[28px]",
                "[&_p]:leading-8.5",
                "[&_p]:tracking-[-0.3px]",
                "[&_p]:text-foreground",
                "md:[&_p]:text-[36px]",
                "md:[&_p]:leading-11",
                "lg:[&_p]:text-[48px]",
                "lg:[&_p]:leading-14.5",
                "lg:[&_p]:tracking-[-0.4px]",
                "[&_p:first-of-type]:font-normal",
                "dark:[&_p:first-of-type]:text-[#efefefb3] [&_p:first-of-type]:text-black/70",
                "[&_p:last-of-type]:font-bold dark:[&_p:last-of-type]:text-white [&_p:last-of-type]:text-black",
              )}
            />
          ) : null}
          {signature.body ? (
            <p className="max-w-195 dark:text-[#efefefb3] text-[#040404b3]">
              {signature.body}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col">
          <div className="py-6 px-6 pb-24 lg:px-16">
            {signature.secondaryLine ? (
              <p className="text-3xl leading-[1.3] md:text-100">
                {signature.secondaryLine}
              </p>
            ) : null}
          </div>
          <div className="h-px w-full dark:bg-white/20 md:border-t-0 bg-black/20" />

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
                showBottomBorder={true}
                showRightBorder={idx % 2 === 0}
              />
            ))}
          </RevealOnScroll>
          <div className="h-px w-full bg-white/20" />
          {ctaData || valueCardData ? (
            <div className="grid gap-6 py-8 lg:grid-cols-2 md:gap-6 px-6 lg:px-16">
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
  };
  showBottomBorder: boolean;
  showRightBorder: boolean;
}) {
  return (
    <div
      className={cn(
        "group/step-shell relative h-full p-4 lg:p-6",
        showBottomBorder && "md:border-b dark:border-white/20 border-black/20",
        showRightBorder && "md:border-r dark:border-white/20 border-black/20",
        !showBottomBorder && "border-t dark:border-white/20 md:border-t-0 border-black/20"
      )}
    >
      <div className="pointer-events-none absolute inset-4 transition-all duration-300 ease-out group-hover/step-shell:inset-0 lg:inset-6">
        <div className="relative isolate h-full w-full overflow-hidden border border-black/10 bg-[#f7f7f7] transition-all duration-300 ease-out group-hover/step-shell:border-brand/40 dark:border-white/10 dark:bg-[#0F0F0F]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-0 transition-opacity duration-300 ease-out group-hover/step-shell:opacity-100"
          >
            <img
              src={signatureStepHoverGraphic}
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
        </div>
      </div>

      <div className="relative z-10 flex h-full flex-col gap-8 p-6 transition-transform duration-300 ease-out group-hover/step-shell:-translate-y-0.5 lg:p-8">
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
