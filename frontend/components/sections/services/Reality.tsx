import {SectionsWrapper} from "@/components/SectionsWrapper"
import {Button} from "@/components/partials/Button"
import {cleanStega} from "@/sanity/lib/utils"
import dynamic from "next/dynamic"

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  {ssr: false},
)

type RealityPoint = {
  _key?: string
  title?: string
  body?: string
}

type RealityHeading = {
  faded?: string
  bold?: string
}

type RealityCta = {
  buttonText?: string
  link?: {
    linkType?: 'href' | 'page' | 'post' | 'service' | 'project'
    href?: string
    page?: string
    post?: string
    service?: string
    project?: string
    openInNewTab?: boolean
  }
}

export type RealityData = {
  eyebrow?: string
  heading?: RealityHeading
  body?: string
  points?: RealityPoint[]
  cta?: RealityCta
}

function getHref(link?: RealityCta["link"]): string {
  if (!link) return "#"
  if (link.linkType === "href") return link.href || "#"
  if (link.linkType === "page") return "/" + link.page
  if (link.linkType === "post") return "/insights/" + link.post
  if (link.linkType === "service") return "/services/" + link.service
  if (link.linkType === "project") return "/portfolio/" + link.project
  return "#"
}

export function Reality({data}: {data?: RealityData}) {
  const cleanData = data ? cleanStega(data) : data
  const eyebrow = cleanData?.eyebrow ?? "THE REALITY"
  const points =
    cleanData?.points?.filter((point) => point.title?.trim() || point.body?.trim()) ?? []
  const ctaHref = cleanData?.cta?.link ? getHref(cleanData.cta.link) : null

  if (!cleanData?.heading?.faded && !cleanData?.heading?.bold && points.length === 0 && !cleanData?.body) {
    return null
  }

  return (
    <SectionsWrapper eyebrow={eyebrow}>
      <div className="flex flex-col gap-12 lg:gap-16">
        <div className="px-0 lg:px-12">
          <h2 className="max-w-5xl font-funnel text-[40px] leading-[1.15] tracking-[-0.04em] text-foreground md:text-[44px] lg:text-[48px] lg:leading-[1.2] lg:tracking-[-1px]">
            {cleanData?.heading?.faded ? (
              <span className="text-foreground/70">{cleanData.heading.faded} </span>
            ) : null}
            {cleanData?.heading?.bold ? (
              <span className="font-bold text-foreground">{cleanData.heading.bold}</span>
            ) : null}
          </h2>
        </div>

        {cleanData?.body ? (
          <div className="px-0 lg:px-12">
            <p className="max-w-[70ch] text-[18px] leading-[1.5] text-foreground/70">
              {cleanData.body}
            </p>
          </div>
        ) : null}

        {points.length > 0 ? (
          <RevealOnScroll
            as="div"
            stagger={0.08}
            className="border-y border-black/20 dark:border-white/20"
          >
            <div className="grid grid-cols-1 divide-y divide-black/20 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-3 dark:divide-white/20">
              {points.map((point, index) => (
                <div key={point._key ?? `${point.title ?? "point"}-${index}`} className="p-6">
                  <article className="flex h-full min-h-[280px] flex-col gap-12 border border-black/10 bg-surface p-6 dark:border-white/20 dark:bg-[#111111] md:p-8">
                    {point.title ? (
                      <h3 className="font-betatron text-[30px] leading-[1.2] text-brand md:text-[32px]">
                        {point.title}
                      </h3>
                    ) : null}

                    {point.body ? (
                      <p className="max-w-[18ch] font-funnel text-[18px] leading-[1.5] text-foreground dark:text-[#efefef]">
                        {point.body}
                      </p>
                    ) : null}
                  </article>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        ) : null}

        {cleanData?.cta?.buttonText && ctaHref ? (
          <div className="px-0 lg:px-12">
            <Button
              href={ctaHref}
              variant="primary"
              size="md"
              target={cleanData.cta.link?.openInNewTab ? "_blank" : undefined}
              rel={cleanData.cta.link?.openInNewTab ? "noopener noreferrer" : undefined}
              className="flex w-full max-w-full whitespace-normal break-normal text-left md:w-auto md:min-w-[612px]"
            >
              {cleanData.cta.buttonText}
            </Button>
          </div>
        ) : null}
      </div>
    </SectionsWrapper>
  )
}
