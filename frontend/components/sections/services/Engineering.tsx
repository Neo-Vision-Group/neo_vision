"use client";

import { SectionsWrapper } from "@/components/SectionsWrapper";
import { Button } from "@/components/partials/Button";
import { cleanStega } from "@/sanity/lib/utils";
import { cn } from "@/lib/utils";

export type EngineeringServicesData = {
  eyebrow?: string;
  services?: Array<{
    _key?: string;
    title: string;
    badge?: string;
    priceFrom?: string;
    duration?: string;
    description: string;
    ctaLabel?: string;
    ctaHref?: string;
  }>;
};

export function EngineeringServices({ data }: { data?: EngineeringServicesData }) {
  const cleanData = data ? cleanStega(data) : data;

  const engineering = {
    eyebrow: cleanData?.eyebrow ?? "ENGINEERING SERVICES",
    services: cleanData?.services ?? [],
  };

  if (!engineering.services || engineering.services.length === 0) {
    return null;
  }

  return (
    <SectionsWrapper id="engineering-services" eyebrow={engineering.eyebrow}>
      <div className="flex flex-col gap-6">
        {engineering.services.map((service, idx) => (
          <article
            key={service._key || `service-${idx}`}
            className="flex flex-col gap-12 border border-white/10 bg-[#0f0f0f] p-12"
          >
            <div className="flex flex-col gap-6">
              {/* Title and Badge Row */}
              <div className="flex items-center justify-between">
                <h3 className="font-funnel text-[32px] leading-[1.2] tracking-[-1px] text-foreground">
                  {service.title}
                </h3>
                {service.badge && (
                  <div className="bg-brand/30 px-[10px] py-[10px] h-[27px] flex items-center justify-center">
                    <p className="text-[18px] leading-normal text-foreground whitespace-nowrap">
                      {service.badge}
                    </p>
                  </div>
                )}
              </div>

              {/* Price and Duration */}
              {(service.priceFrom || service.duration) && (
                <div className="flex gap-3 text-[18px] leading-normal">
                  {service.priceFrom && (
                    <p className="text-brand">{service.priceFrom}</p>
                  )}
                  {service.duration && (
                    <p className="text-foreground/70">{service.duration}</p>
                  )}
                </div>
              )}

              {/* Description */}
              <p className="text-[18px] leading-normal text-foreground/70">
                {service.description}
              </p>
            </div>

            {/* CTA Button */}
            {service.ctaLabel && service.ctaHref && (
              <div className="relative inline-flex items-center gap-3 self-start overflow-hidden p-[10px]">
                {/* Icon/Image placeholder - would need the actual icon */}
                <div className="h-6 w-[38.4px] shrink-0" />
                
                <a
                  href={service.ctaHref}
                  className="font-funnel text-[24px] font-bold leading-[1.2] text-foreground hover:text-brand transition-colors"
                >
                  {service.ctaLabel}
                </a>

                {/* Decorative lines matching Figma */}
                <div className="absolute -right-[273.6px] top-[5px] h-px w-[260px] bg-brand" />
                <div className="absolute -left-[261px] bottom-[5px] h-px w-[260px] bg-brand" />
                <div className="absolute left-[5px] top-[calc(50%-148.5px)] flex h-[156px] w-px -translate-y-1/2 items-center justify-center">
                  <div className="-rotate-90 flex-none">
                    <div className="h-px w-[156px] bg-brand" />
                  </div>
                </div>
                <div className="absolute right-[5.4px] top-[calc(50%+151.5px)] flex h-[156px] w-px -translate-y-1/2 items-center justify-center">
                  <div className="-rotate-90 flex-none">
                    <div className="h-px w-[156px] bg-brand" />
                  </div>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </SectionsWrapper>
  );
}
