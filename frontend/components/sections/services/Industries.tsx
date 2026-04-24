import { SectionsWrapper } from "@/components/SectionsWrapper";
import { MetricStrip } from "@/components/partials/MetricStrip";
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
    return (
        <SectionsWrapper eyebrow={data.eyebrow}>
            <div className="flex flex-col gap-12">
            <div className="px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
                <h2 className="text-[28px] leading-[36px] tracking-[-0.3px] text-foreground md:text-[36px] md:leading-[46px] lg:text-[44px] lg:leading-[54px] 2xl:text-[48px] 2xl:leading-[58px] 2xl:tracking-[-0.4px]">
                    <span className="text-foreground/70">{data.heading} </span>
                </h2>
            </div>
            <RevealOnScroll
                as="div"
                stagger={0.06}
                className="grid grid-cols-1 gap-4 px-6 md:grid-cols-2 md:px-6 lg:px-8 xl:grid-cols-3 xl:px-12 2xl:px-16"
            >
                {data.industries.map((item, idx) => (
                <article
                    key={(item.industry ?? "ind") + idx}
                    className="flex bg-[#0F0F0F] flex-col gap-3 border border-white/10 bg-surface p-6"
                >
                    <h3 className="text-[48px] font-betatron text-brand font-medium text-foreground">{item.industry}</h3>
                    <p className="text-body-2 text-foreground/70">{item.description}</p>
                </article>
                ))}
            </RevealOnScroll>   
            </div>

            <div className="px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
                <MetricStrip items={data.metrics} />
            </div>
        </SectionsWrapper>
    )
}