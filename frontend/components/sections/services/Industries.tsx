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

    // Right-border classes per item, respecting both md (2-col) and xl (3-col) grids.
    // md:border-r applies from md upward, so xl:border-r-0 overrides it where needed.
    function getRightBorderClasses(index: number) {
        const isLastColAtMd = index % 2 === 1;
        const isLastColAtXl = index % 3 === 2;

        if (!isLastColAtMd && !isLastColAtXl) {
            return "md:border-r md:border-black/20 md:dark:border-white/20";
        } else if (!isLastColAtMd && isLastColAtXl) {
            return "md:border-r md:border-black/20 md:dark:border-white/20 xl:border-r-0";
        } else if (isLastColAtMd && !isLastColAtXl) {
            return "xl:border-r xl:border-black/20 xl:dark:border-white/20";
        }
        return "";
    }

    // Filler cells to complete the last xl row (up to 2).
    // A filler is also shown at md only if it falls within the md-complete cell count.
    const xlFillers = (3 - (industries.length % 3)) % 3;
    const mdTotalCells = Math.ceil(industries.length / 2) * 2;

    return (
        <SectionsWrapper eyebrow={data.eyebrow} classNameOverride="px-0 pb-24">
            <div className="flex flex-col gap-12">
            <div className="px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
                <h2 className="text-[28px] leading-12 tracking-[-0.3px] text-foreground md:text-[36px] md:leading-12 lg:text-[44px] lg:leading-14 2xl:text-5xl 2xl:leading-14.5 2xl:tracking-[-0.4px]">
                    <span className="text-foreground/70">{data.heading} </span>
                </h2>
            </div>
            <div className="border-t border-black/20 dark:border-white/20">
                <RevealOnScroll
                    as="div"
                    stagger={0.06}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                >
                    {industries.map((item, index) => (
                        <div
                            key={(item.industry ?? "ind") + index}
                            className={cn(
                                "border-b border-black/20 dark:border-white/20 p-4 md:p-6 flex flex-col",
                                getRightBorderClasses(index),
                            )}
                        >
                            <article className="group relative isolate flex flex-1 flex-col gap-3 border border-black/10 p-6 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-brand/40 dark:border-white/10 dark:bg-[#0F0F0F]">
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
                                <h3 className="text-4xl leading-[1.05] font-clash text-brand font-medium sm:text-[40px] 2xl:text-5xl">{item.industry}</h3>
                                <p className="text-body-2 text-foreground/70">{item.description}</p>
                            </article>
                        </div>
                    ))}

                    {Array.from({ length: xlFillers }).map((_, fillerIndex) => {
                        const index = industries.length + fillerIndex;
                        const isMdVisible = index < mdTotalCells;

                        return (
                            <div
                                key={`empty-${fillerIndex}`}
                                aria-hidden="true"
                                className={cn(
                                    isMdVisible ? "hidden md:block" : "hidden xl:block",
                                    getRightBorderClasses(index),
                                )}
                            />
                        );
                    })}
                </RevealOnScroll>
            </div>
            </div>

            {metrics.length > 0 ? (
                <div className="px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-12">
                    <dl className="flex flex-col md:flex-row justify-center gap-12 lg:gap-48 px-6 py-8 text-black dark:text-[#EFEFEF]">
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
                                    className="flex flex-1 flex-col gap-6 items-center md:items-start"
                                >
                                    <dt className="whitespace-nowrap font-clash text-[64px] leading-none tracking-[-3.84px] text-brand md:text-[64px] md:tracking-[-4.8px] xl:text-[96px] xl:tracking-[-5.76px]">
                                        {displayValue}
                                    </dt>
                                    <dd className="font-funnel text-[28px] leading-[1.2] tracking-[-0.84px] text-black dark:text-[#EFEFEF] md:text-[24px] md:tracking-[-1px]">
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
