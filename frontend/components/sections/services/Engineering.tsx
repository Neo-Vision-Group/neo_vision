"use client";

import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cleanStega } from "@/sanity/lib/utils";
import Badge from "@/components/partials/Badge";
import ThirdButton from "@/components/partials/ThirdButton";

type EngineeringService = {
  _key?: string;
  service?: {
    name?: string;
    description?: string;
    tag?: string;
    price?: string;
    duration?: string;
    slug?: {
      current?: string;
    };
  };
  ctaLabel?: string;
  ctaHref?: string;
};

export type EngineeringServicesData = {
  eyebrow?: string;
  services?: EngineeringService[];
};

export function EngineeringServices({
  data,
}: {
  data?: EngineeringServicesData;
}) {
  const cleanData = data ? cleanStega(data) : data;
  const services =
    cleanData?.services?.filter((item) => item?.service?.name) ?? [];

  if (services.length === 0) {
    return null;
  }

  const eyebrow = cleanData?.eyebrow ?? "ENGINEERING SERVICES";

  return (
    <SectionsWrapper id="engineering-services" eyebrow={eyebrow}>
      <div className="flex flex-col gap-6">
          {services.map((item, index) => {
            const service = item.service;

            if (!service?.name) {
              return null;
            }

            const href =
              item.ctaHref ??
              (service.slug?.current ? `/services/${service.slug.current}` : undefined);
            const ctaLabel = item.ctaLabel ?? "Learn More";

            return (
              <article
                key={item._key ?? `${service.name}-${index}`}
                className="flex min-h-60 flex-col justify-between gap-10 border border-black/15 bg-black/4 p-8 transition-colors duration-300 hover:border-brand dark:border-white/20 dark:bg-[#0f0f0f] dark:hover:border-brand md:min-h-60 md:gap-12 md:p-12"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                      <h3 className="font-funnel text-4xl leading-[1.2] tracking-[-1px] text-black dark:text-[#efefef]">
                        {service.name}
                      </h3>

                      {service.tag ? <Badge text={service.tag} /> : null}
                    </div>

                    {(service.price || service.duration) && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 font-funnel text-[18px] leading-normal">
                        {service.price ? (
                          <p className="text-brand">{service.price}</p>
                        ) : null}
                        {service.duration ? (
                          <p className="text-black/60 dark:text-[#efefef]/70">
                            {service.duration}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {service.description ? (
                    <p className="max-w-[58ch] font-funnel text-[18px] leading-normal text-black/70 dark:text-[#efefef]/70">
                      {service.description}
                    </p>
                  ) : null}
                </div>

                <ThirdButton href={href} label={ctaLabel} />
              </article>
            );
          })}
      </div>
    </SectionsWrapper>
  );
}
