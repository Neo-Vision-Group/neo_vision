import { SectionsWrapper } from "@/components/SectionsWrapper"
import { RevealOnScroll } from "@/components/partials/motion/RevealOnScroll"

export function Reality({ data }: { data: any }) {
    return (
      <SectionsWrapper eyebrow={data.eyebrow}>
        <div className="flex flex-col gap-12 px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <h2 className="text-[28px] leading-[36px] tracking-[-0.3px] text-foreground md:text-[36px] md:leading-[46px] lg:text-[44px] lg:leading-[54px] 2xl:text-[48px] 2xl:leading-[58px] 2xl:tracking-[-0.4px]">
            <span className="text-foreground/70">{data.heading?.faded} </span>
            <span className="font-bold">{data.heading?.bold}</span>
          </h2>
          {data.body ? (
            <p className="max-w-[70ch] text-body text-foreground/70 md:text-[20px] md:leading-[28px]">
              {data.body}
            </p>
          ) : null}
          <RevealOnScroll
            as="div"
            stagger={0.08}
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            {data.points.map((p: any, idx: number) => (
              <article
                key={(p.title ?? "pt") + idx}
                className="flex flex-col gap-3 border border-white/10 bg-surface p-6"
              >
                <h3 className="text-h4 font-medium text-foreground">{p.title}</h3>
                <p className="text-body-2 text-foreground/70">{p.body}</p>
              </article>
            ))}
          </RevealOnScroll>
        </div>
      </SectionsWrapper>
    )
}