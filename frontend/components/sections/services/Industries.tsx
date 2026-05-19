import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cn } from "@/lib/utils";
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
    const industryRows: typeof industries[] = [];

    for (let index = 0; index < industries.length; index += 3) {
        industryRows.push(industries.slice(index, index + 3));
    }

    return (
        <SectionsWrapper eyebrow={data.eyebrow} classNameOverride="px-0 pb-24">
            <div className="flex flex-col gap-12">
            <div className="px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
                <h2 className="text-[28px] leading-9 tracking-[-0.3px] text-foreground md:text-[36px] md:leading-12 lg:text-[44px] lg:leading-14 2xl:text-5xl 2xl:leading-14.5 2xl:tracking-[-0.4px]">
                    <span className="text-foreground/70">{data.heading} </span>
                </h2>
            </div>
            <div className="border-t border-black/20 dark:border-white/20">
                <RevealOnScroll
                    as="div"
                    stagger={0.06}
                    className="flex flex-col"
                >
                    {industryRows.map((row, rowIndex) => (
                        <div
                            key={`row-${rowIndex}`}
                            className="grid grid-cols-1 border-b border-black/20 dark:border-white/20 md:grid-cols-2 xl:grid-cols-3"
                        >
                            {row.map((item, columnIndex) => (
                                <div
                                    key={(item.industry ?? "ind") + `${rowIndex}-${columnIndex}`}
                                    className={cn(
                                        "p-4 dark:border-white/20 md:p-6",
                                        columnIndex === 0 && "md:border-r md:border-black/20 md:dark:border-white/20",
                                        columnIndex === 1 && "xl:border-r xl:border-black/20 xl:dark:border-white/20",
                                    )}
                                >
                                    <article className="group relative isolate flex flex-col gap-3 border border-black/10 bg-black/4 p-6 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-brand/40 dark:border-white/10 dark:bg-[#0F0F0F]">
                                        <div
                                            aria-hidden="true"
                                            className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 ease-out dark:group-hover:opacity-100"
                                        >
                                            <div
                                                className="absolute inset-0"
                                                style={{ background: "#4a0e00" }}
                                            />
                                            <div
                                                className="absolute inset-0 mix-blend-multiply"
                                                style={{ background: "#7a1a00" }}
                                            />
                                        </div>
                                        <h3 className="text-4xl leading-[1.05] font-betatron text-brand font-medium sm:text-[40px] lg:text-5xl">{item.industry}</h3>
                                        <p className="text-body-2 text-foreground/70">{item.description}</p>
                                    </article>
                                </div>
                            ))}

                            {Array.from({ length: Math.max(0, 3 - row.length) }).map((_, emptyIndex) => {
                                const columnIndex = row.length + emptyIndex;

                                return (
                                    <div
                                        key={`empty-${rowIndex}-${columnIndex}`}
                                        aria-hidden="true"
                                        className={cn(
                                            "hidden dark:border-white/20 md:block",
                                            columnIndex === 0 && "md:border-r md:border-black/20 md:dark:border-white/20",
                                            columnIndex === 1 && "xl:border-r xl:border-black/20 xl:dark:border-white/20",
                                            columnIndex === 2 && "xl:block",
                                            columnIndex === 1 && row.length < 2 ? "xl:block" : "",
                                        )}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </RevealOnScroll>
            </div>
            </div>

            {metrics.length > 0 ? (
                <div className="px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-12">
                    <dl className="flex flex-col md:flex-row justify-start gap-48 bg-white px-6 py-8 text-black dark:bg-black dark:text-[#EFEFEF]">
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
                                    <dd className="font-funnel text-[28px] leading-[1.2] tracking-[-0.84px] text-black dark:text-[#EFEFEF] md:text-4xl md:tracking-[-1px]">
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
