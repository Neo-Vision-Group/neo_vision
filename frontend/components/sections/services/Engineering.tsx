import Link from "next/link";

import ArrowRightPixel from "@/components/icons/ArrowRightPixel";
import { cleanStega } from "@/sanity/lib/utils";

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

function ServiceCardLink({
  href,
  label,
}: {
  href?: string;
  label: string;
}) {
  const content = (
    <>
      <ArrowRightPixel
        color="currentColor"
        width={38}
        height={24}
        className="h-6 w-[38px] shrink-0"
      />
      <span className="font-funnel text-[24px] font-bold leading-[1.2] text-black transition-colors duration-200 dark:text-[#efefef]">
        {label}
      </span>
    </>
  );

  const className =
    "group inline-flex items-center gap-3 self-start text-black dark:text-[#efefef]";

  if (!href) {
    return <div className={className}>{content}</div>;
  }

  const isInternal = href.startsWith("/");

  if (isInternal) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noreferrer"
    >
      {content}
    </a>
  );
}

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
    <section id="engineering-services" className="relative flex w-full flex-col lg:flex-row">
      <div className="border-y border-black/15 px-6 py-6 dark:border-white/20 lg:hidden">
        <p className="max-w-[12ch] font-betatron text-[28px] leading-[1.2] text-black dark:text-[#efefef] md:text-[32px]">
          {eyebrow}
        </p>
      </div>

      <aside className="hidden lg:sticky lg:top-0 lg:z-10 lg:flex lg:w-[372px] lg:shrink-0 lg:flex-col lg:pt-24">
        <div className="h-px w-full bg-black/15 dark:bg-white/20" />
        <div className="w-full px-12 py-6">
          <p className="max-w-[7ch] font-betatron text-[32px] leading-[1.2] text-black dark:text-[#efefef]">
            {eyebrow}
          </p>
        </div>
        <div className="h-px w-full bg-black/15 dark:bg-white/20" />
      </aside>

      <div className="hidden lg:block lg:w-px lg:self-stretch lg:bg-black/15 dark:lg:bg-white/20" />

      <div className="flex min-w-0 flex-1 flex-col gap-12 pt-12 lg:pt-24">
        <div className="hidden h-px w-full bg-black/15 dark:bg-white/20 lg:block" />
        <div className="flex flex-col gap-6 px-6 pb-24">
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
                className="flex min-h-[240px] flex-col justify-between gap-10 border border-black/15 bg-black/[0.04] p-8 dark:border-white/20 dark:bg-[#0f0f0f] md:min-h-[252px] md:gap-12 md:p-12"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                      <h3 className="font-funnel text-[32px] leading-[1.2] tracking-[-1px] text-black dark:text-[#efefef]">
                        {service.name}
                      </h3>

                      {service.tag ? (
                        <span className="self-start whitespace-nowrap bg-brand/30 px-[10px] py-1 font-funnel text-[18px] leading-[1.5] text-black dark:text-[#efefef]">
                          {service.tag}
                        </span>
                      ) : null}
                    </div>

                    {(service.price || service.duration) && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 font-funnel text-[18px] leading-[1.5]">
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
                    <p className="max-w-[58ch] font-funnel text-[18px] leading-[1.5] text-black/70 dark:text-[#efefef]/70">
                      {service.description}
                    </p>
                  ) : null}
                </div>

                <ServiceCardLink href={href} label={ctaLabel} />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
