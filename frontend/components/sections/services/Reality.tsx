import {SectionsWrapper} from "@/components/SectionsWrapper"
import {Button} from "@/components/partials/Button"
import {cleanStega} from "@/sanity/lib/utils"
import {cn} from "@/lib/utils"
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
    <SectionsWrapper eyebrow={eyebrow} classNameOverride="px-0">
      <div className="flex flex-col gap-12 lg:gap-16">
        <div className="px-0 lg:px-12">
          <h2 className="max-w-5xl px-6 font-funnel text-[40px] leading-[1.15] tracking-[-0.04em] text-foreground md:text-[44px] lg:text-5xl lg:leading-[1.2] lg:tracking-[-1px]">
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
            <p className="max-w-[70ch] text-[18px] leading-normal text-foreground/70">
              {cleanData.body}
            </p>
          </div>
        ) : null}

        {points.length > 0 ? (
          <div className="border-t border-black/20 dark:border-white/20">
            <RevealOnScroll
              as="div"
              stagger={0.08}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {points.map((point, index) => (
                  <div
                    key={point._key ?? `${point.title ?? "point"}-${index}`}
                    className={cn(
                      "p-6 border-b border-black/20 dark:border-white/20",
                      // Tablet: 2 columns
                      (index + 1) % 2 !== 0 && "md:border-r md:border-black/20 md:dark:border-white/20",
                      (index + 1) % 2 === 0 && "md:border-r-0",
                      // Desktop: 3 columns
                      (index + 1) % 3 !== 0 && "xl:border-r xl:border-black/20 xl:dark:border-white/20",
                      (index + 1) % 3 === 0 && "xl:border-r-0"
                    )}
                  >
                    <article className="group relative isolate flex h-full min-h-70 flex-col gap-12 border border-black/10 bg-black/4 p-6 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-brand/40 dark:border-white/20 dark:bg-[#111111] md:p-8">
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 ease-out dark:group-hover:opacity-100"
                      >
                        <div
                          className="absolute inset-0"
                          style={{background: "#4a0e00"}}
                        />
                        <div
                          className="absolute inset-0 mix-blend-multiply"
                          style={{background: "#7a1a00"}}
                        />
                      </div>
                      {point.title ? (
                        <h3 className="font-clash text-[30px] leading-[1.2] text-brand md:text-4xl">
                          {point.title}
                        </h3>
                      ) : null}

                      {point.body ? (
                        <p className="font-funnel text-[18px] leading-normal text-foreground dark:text-[#efefef]">
                          {point.body}
                        </p>
                      ) : null}
                    </article>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        ) : null}

        {cleanData?.cta?.buttonText && ctaHref ? (
          <div className="px-6 pb-16 lg:px-12">
            <Button
              href={ctaHref}
              variant="primary"
              size="md"
              target={cleanData.cta.link?.openInNewTab ? "_blank" : undefined}
              rel={cleanData.cta.link?.openInNewTab ? "noopener noreferrer" : undefined}
              className="flex w-full max-w-full whitespace-normal break-normal text-left"
            >
              {cleanData.cta.buttonText}
            </Button>
          </div>
        ) : null}
      </div>
    </SectionsWrapper>
  )
}
