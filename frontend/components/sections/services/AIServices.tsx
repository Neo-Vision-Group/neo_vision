import ArrowRightPixel from "@/components/icons/ArrowRightPixel";
import ResolvedLink from "@/components/ResolvedLink";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { DereferencedLink } from "@/sanity/lib/types";
import { cleanStega } from "@/sanity/lib/utils";

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
  const content = (
    <>
      <ArrowRightPixel
        color="currentColor"
        width={38}
        height={24}
        className="h-6 w-10 shrink-0"
      />
      <span className="font-funnel text-6 font-bold leading-[1.2] text-black transition-colors duration-200 dark:text-[#efefef]">
        {cta?.buttonText ?? "Learn More"}
      </span>
    </>
  );

  if (cta?.link) {
    return (
      <ResolvedLink
        link={cta.link}
        className={`${className ?? ""} group inline-flex items-center gap-3`}
      >
        {content}
      </ResolvedLink>
    );
  }

  return <div className={`${className ?? ""} inline-flex items-center gap-3`}>{content}</div>;
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
              className="flex min-h-[340px] flex-col justify-between gap-10 border border-black/15 bg-black/4 p-8 dark:border-white/20 dark:bg-[#0f0f0f] md:min-h-[380px] md:p-12"
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  {service.tag ? (
                    <span className="self-start bg-brand/30 px-2 py-1 font-funnel text-[14px] leading-[1.2] text-black dark:text-[#efefef] md:px-2.5 md:py-1.5 md:text-[18px] md:leading-normal">
                      {service.tag}
                    </span>
                  ) : null}

                  <h3 className="max-w-[16ch] font-funnel text-deco-h4 leading-[1.2] tracking-[-1px] text-black dark:text-[#efefef]">
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
                  <p className="max-w-[34ch] font-funnel text-[18px] leading-[1.55] text-black/70 dark:text-[#efefef]/70">
                    {service.description}
                  </p>
                ) : null}
              </div>

              <CardLink cta={item.cta} className="self-start text-black dark:text-[#efefef]" />
            </article>
          );
        })}
      </div>
    </SectionsWrapper>
  );
}
