import { SectionsWrapper } from "@/components/SectionsWrapper"
import { RevealOnScroll } from "@/components/partials/motion/RevealOnScroll"
import Link from "next/link"

function getHref(link: any): string {
  if (!link) return "#";
  if (link.linkType === "href") return link.href || "#";
  if (link.linkType === "page") return "/" + link.page;
  if (link.linkType === "post") return "/insights/" + link.post;
  return "#";
}

export function Reality({ data }: { data: any }) {
    const ctaHref = data.cta?.link ? getHref(data.cta.link) : null;
    
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
                <h3 className="font-betatron text-[22px] font-medium text-brand">{p.title}</h3>
                <p className="text-body-2 text-foreground/70">{p.body}</p>
              </article>
            ))}
          </RevealOnScroll>
          {data.cta && data.cta.buttonText && ctaHref ? (
            <div className="flex justify-center pt-4">
              <Link 
                href={ctaHref}
                target={data.cta.link?.openInNewTab ? "_blank" : undefined}
                rel={data.cta.link?.openInNewTab ? "noopener noreferrer" : undefined}
                className="inline-flex items-center justify-center whitespace-nowrap font-medium leading-none transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-brand text-white pl-6 pr-4 py-3 text-body gap-3 hover:bg-brand-hover hover:shadow-[0_0_60px_0px_rgba(255,65,0,0.5)] focus-visible:ring-brand"
              >
                <span>{data.cta.buttonText}</span>
              </Link>
            </div>
          ) : null}
        </div>
      </SectionsWrapper>
    )
}