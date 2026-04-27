import { SectionsWrapper } from "@/components/SectionsWrapper";
import dynamic from "next/dynamic";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  { ssr: false }
);

export type IndustryData = {
    eyebrow: string;
    heading: string;
    industries: {
        industry: string,
        description: string,
    }[]
    metrics: {
        label: string,
        value: string,
        prefix?: string | null,
    }[]
}

export function Industries({ data }: { data: IndustryData }) {
    const industries = data.industries ?? [];
    const metrics = data.metrics ?? [];

    return (
        <SectionsWrapper eyebrow={data.eyebrow}>
            <div className="flex flex-col gap-12">
            <div className="px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
                <h2 className="text-[28px] leading-[36px] tracking-[-0.3px] text-foreground md:text-[36px] md:leading-[46px] lg:text-[44px] lg:leading-[54px] 2xl:text-[48px] 2xl:leading-14.5 2xl:tracking-[-0.4px]">
                    <span className="text-foreground/70">{data.heading} </span>
                </h2>
            </div>
            <RevealOnScroll
                as="div"
                stagger={0.06}
                className="grid grid-cols-1 gap-4 px-6 md:grid-cols-2 md:px-6 lg:px-8 xl:grid-cols-3 xl:px-12 2xl:px-16"
            >
                {industries.map((item, idx) => (
                <article
                    key={(item.industry ?? "ind") + idx}
                    className="flex dark:bg-[#0F0F0F] bg-white flex-col gap-3 border dark:border-white/10 border-black/10 p-6"
                >
                    <h3 className="text-[32px] leading-[1.05] font-betatron text-brand font-medium sm:text-[40px] lg:text-[48px]">{item.industry}</h3>
                    <p className="text-body-2 text-foreground/70">{item.description}</p>
                </article>
                ))}
            </RevealOnScroll>   
            </div>

            {metrics.length > 0 ? (
                <div className="px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-10 bg-white px-6 py-8 text-black dark:bg-[#040404] dark:text-[#EFEFEF] sm:grid-cols-2 md:px-8 md:py-10 lg:grid-cols-3 lg:gap-x-10 lg:px-12 lg:py-12">
                        {metrics.map((item, idx) => {
                            const value = item.value ?? "";
                            const suffix = item.prefix ?? "";
                            const displayValue =
                                suffix && !value.endsWith(suffix)
                                    ? `${value}${suffix}`
                                    : value;

                            return (
                                <div
                                    key={(item.label ?? "metric") + idx}
                                    className="flex flex-col gap-6"
                                >
                                    <dt className="whitespace-nowrap font-betatron text-[64px] leading-none tracking-[-3.84px] text-brand md:text-[80px] md:tracking-[-4.8px] xl:text-[96px] xl:tracking-[-5.76px]">
                                        {displayValue}
                                    </dt>
                                    <dd className="max-w-[8ch] whitespace-pre-line font-funnel text-[28px] leading-[1.2] tracking-[-0.84px] text-black dark:text-[#EFEFEF] md:text-[32px] md:tracking-[-1px]">
                                        {item.label}
                                    </dd>
                                </div>
                            );
                        })}
                    </dl>
                </div>
            ) : null}
        </SectionsWrapper>
    )
}
