"use client";

import { useState } from "react";

import { AnimatedBorder } from "@/components/AnimatedBorder";
import ArrowRightPixel from "@/components/icons/ArrowRightPixel";
import ResolvedLink from "@/components/ResolvedLink";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { DereferencedLink } from "@/sanity/lib/types";
import { cleanStega } from "@/sanity/lib/utils";
import Badge from "@/components/partials/Badge";

type AIServiceCard = {
  _key?: string;
  service?: {
    name?: string;
    description?: string;
    tag?: string;
    price?: string;
    duration?: string;
  };
  cta?: {
    buttonText?: string;
    link?: DereferencedLink;
  };
};

export type AIServicesData = {
  eyebrow?: string;
  services?: AIServiceCard[];
};

function CardLink({
  cta,
  className,
}: {
  cta?: AIServiceCard["cta"];
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <>
      <AnimatedBorder isHovered={isHovered} />
      <ArrowRightPixel
        color="currentColor"
        width={38}
        height={24}
        className="relative z-10 h-6 w-10 shrink-0"
      />
      <span className="relative z-10 font-funnel text-100 font-bold leading-[1.2]">
        {cta?.buttonText ?? "Learn More"}
      </span>
    </>
  );

  const interactiveClassName = `${className ?? ""} relative inline-flex items-center gap-3 px-2 py-1 transition-colors duration-200 ${
    isHovered ? "text-brand" : "text-black dark:text-[#efefef]"
  }`;

  if (cta?.link) {
    return (
      <ResolvedLink
        link={cta.link}
        className={interactiveClassName}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        {content}
      </ResolvedLink>
    );
  }

  return (
    <div
      className={interactiveClassName}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {content}
    </div>
  );
}

export function AIServices({ data }: { data?: AIServicesData }) {
  const cleanData = data ? cleanStega(data) : data;
  const services = cleanData?.services?.filter((item) => item?.service?.name) ?? [];

  if (services.length === 0) {
    return null;
  }

  return (
    <SectionsWrapper
      id="ai-services"
      eyebrow={cleanData?.eyebrow ?? "AI TRANSFORMATION SERVICES"}
      overrideEyebrowSize="md:text-[16px] lg:text-[18px] xl:text-[25px] font-bold"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {services.map((item, index) => {
          const service = item.service;

          if (!service) {
            return null;
          }

          return (
            <article
              key={item._key ?? `${service.name}-${index}`}
              className="group flex flex-col justify-between gap-12 border border-black/15 bg-black/4 p-8 transition-colors duration-300 hover:border-brand dark:border-white/20 dark:bg-[#0f0f0f] dark:hover:border-brand md:p-12"
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  {service.tag ? <Badge text={service.tag} groupHover isActive={false} /> : null}

                  <h3 className="font-funnel text-4xl leading-[1.2] tracking-[-1px] text-black dark:text-[#efefef]">
                    {service.name}
                  </h3>

                  {(service.price || service.duration) && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 font-funnel text-[18px] leading-normal">
                      {service.price ? <p className="text-brand">{service.price}</p> : null}
                      {service.duration ? (
                        <p className="text-black/60 dark:text-[#efefef]/60">{service.duration}</p>
                      ) : null}
                    </div>
                  )}
                </div>

                {service.description ? (
                  <p className="font-funnel text-[18px] leading-[1.55] text-black/70 dark:text-[#efefef]/70">
                    {service.description}
                  </p>
                ) : null}
              </div>

              <CardLink cta={item.cta} className="self-start" />
            </article>
          );
        })}
      </div>
    </SectionsWrapper>
  );
}
