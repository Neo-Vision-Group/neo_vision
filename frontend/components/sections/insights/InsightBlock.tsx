import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ComparisonTable } from '@/components/partials/ComparisonTable'
import { CalloutCard } from '@/components/partials/CalloutCard'

type PortableTextBlock = {
  children?: Array<{
    marks?: Array<string>
    text?: string
    _type: 'span'
    _key: string
  }>
  style?: 'normal' | 'h3'
  listItem?: 'bullet' | 'number'
  markDefs?: Array<{
    href?: string
    _type: 'link'
    _key: string
  }>
  level?: number
  _type: 'block'
  _key: string
}

export type InsightBlockQueryResponse = {
  _key: string
  _type: 'insightBlock'
  title?: string
  text?: PortableTextBlock[]
  sectionType?: 'none' | 'quote' | 'table' | 'card'
  quote?: {
    quote?: PortableTextBlock[]
    attribution?: string
  }
  table?: {
    headers?: string[]
    rows?: Array<{ cells?: string[]; _key: string }>
  }
  card?: {
    label?: string
    body?: PortableTextBlock[]
  }
}

export interface InsightBlockData {
  title?: string
  text?: PortableTextBlock[]
  sectionType?: 'none' | 'quote' | 'table' | 'card'
  quote?: {
    quote?: PortableTextBlock[]
    attribution?: string
  }
  table?: {
    headers?: string[]
    rows?: Array<{ cells?: string[]; _key: string }>
  }
  card?: {
    label?: string
    body?: PortableTextBlock[]
  }
}

const portableTextComponents = {
  block: {
    normal: ({ children }: { children?: ReactNode }) => (
      <p className="my-5 text-[18px] leading-normal text-foreground/80">{children}</p>
    ),
    h3: ({ children }: { children?: ReactNode }) => (
      <h3 className="mt-10 mb-3 text-4xl font-normal leading-[1.2] tracking-[-1px] text-foreground">{children}</h3>
    ),
    default: ({ children }: { children?: ReactNode }) => (
      <p className="my-5 text-[18px] leading-normal text-foreground/80">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }: { children?: ReactNode }) => (
      <ul className="my-5 ml-5 list-disc space-y-3 text-[18px] leading-normal text-foreground/80">{children}</ul>
    ),
    number: ({ children }: { children?: ReactNode }) => (
      <ol className="my-5 ml-5 list-decimal space-y-3 text-[18px] leading-normal text-foreground/80">{children}</ol>
    ),
  },
  listItem: ({ children }: { children?: ReactNode }) => <li>{children}</li>,
  marks: {
    strong: ({ children }: { children?: ReactNode }) => <strong className="font-bold text-foreground">{children}</strong>,
    em: ({ children }: { children?: ReactNode }) => <em>{children}</em>,
    link: (props: { value?: { href?: string }; children?: ReactNode }) => {
      const { value, children } = props
      const href = value?.href ? String(value.href) : '#'
      const external = /^https?:/i.test(href)
      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand underline underline-offset-2 hover:text-brand-hover"
          >
            {children}
          </a>
        )
      }
      return (
        <Link href={href} className="text-brand underline underline-offset-2 hover:text-brand-hover">
          {children}
        </Link>
      )
    },
  },
}

const quotePortableTextComponents = {
  ...portableTextComponents,
  block: {
    normal: ({ children }: { children?: ReactNode }) => (
      <p className="text-100 leading-[1.3] tracking-[-0.03em] text-foreground md:text-[30px]">{children}</p>
    ),
    h3: ({ children }: { children?: ReactNode }) => (
      <h3 className="text-[28px] leading-[1.2] tracking-[-0.04em] text-foreground md:text-[36px]">{children}</h3>
    ),
    default: ({ children }: { children?: ReactNode }) => (
      <p className="text-100 leading-[1.3] tracking-[-0.03em] text-foreground md:text-[30px]">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }: { children?: ReactNode }) => (
      <ul className="ml-5 list-disc space-y-3 text-[22px] leading-[1.35] tracking-[-0.03em] text-foreground md:text-[26px]">
        {children}
      </ul>
    ),
    number: ({ children }: { children?: ReactNode }) => (
      <ol className="ml-5 list-decimal space-y-3 text-[22px] leading-[1.35] tracking-[-0.03em] text-foreground md:text-[26px]">
        {children}
      </ol>
    ),
  },
}

interface InsightBlockProps {
  data: InsightBlockData
}

export function InsightBlock({ data }: InsightBlockProps) {
  const { title, text, sectionType, quote, table, card } = data

  return (
    <section className="pb-5">
      <article className="mx-auto min-w-0">
        <div className="px-6 pt-5 md:px-6 lg:px-12">
          <h2 className="mb-8 text-[36px] font-medium leading-10 tracking-[-0.4px] text-foreground md:text-[56px] md:leading-16 xl:text-[72px] xl:leading-20">
            {title}
          </h2>

          {text && text.length > 0 && (
            <div className="mb-12 min-w-0 text-body text-foreground/80">
              <PortableText value={text} components={portableTextComponents} />
            </div>
          )}

          {sectionType === 'quote' && quote?.quote && quote.quote.length > 0 && (
            <div className="mb-12 max-w-245">
              <div className="bg-black/4 px-6 py-8 dark:bg-white/4 md:px-8 md:py-10">
                <div className="flex items-start gap-4 md:gap-6">
                  <div aria-hidden className="mt-1 shrink-0 text-brand">
                    <svg width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M11.816 0.992188L4.64801 11.1922C3.81601 12.3762 3.40001 13.6402 3.40001 14.9842C3.40001 16.4562 3.89601 17.6882 4.88801 18.6802C5.91201 19.6402 7.16001 20.1202 8.63201 20.1202C10.104 20.1202 11.336 19.6402 12.328 18.6802C13.32 17.6882 13.816 16.4562 13.816 14.9842C13.816 13.7362 13.464 12.6482 12.76 11.7202C12.056 10.7602 11.128 10.1042 9.97601 9.75219L16.952 0.992188H11.816ZM26.216 0.992188L19.048 11.1922C18.216 12.3762 17.8 13.6402 17.8 14.9842C17.8 16.4562 18.296 17.6882 19.288 18.6802C20.312 19.6402 21.56 20.1202 23.032 20.1202C24.504 20.1202 25.736 19.6402 26.728 18.6802C27.72 17.6882 28.216 16.4562 28.216 14.9842C28.216 13.7362 27.864 12.6482 27.16 11.7202C26.456 10.7602 25.528 10.1042 24.376 9.75219L31.352 0.992188H26.216Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1 space-y-5">
                    <PortableText value={quote.quote} components={quotePortableTextComponents} />
                  </div>
                </div>
                {quote.attribution && (
                  <p className="mt-5 pl-12 text-[14px] uppercase tracking-[0.18em] text-foreground/55 md:pl-14">
                    {quote.attribution}
                  </p>
                )}
              </div>
            </div>
          )}

          {sectionType === 'table' && table && table.headers && table.rows && (
            <div className="mb-12 max-w-275">
              <ComparisonTable
                headers={table.headers}
                rows={table.rows}
              />
            </div>
          )}

          {sectionType === 'card' && card && (
            <div className="mb-12 max-w-225">
              <CalloutCard label={card.label}>
                {card.body && card.body.length > 0 ? (
                  <div className="[&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
                    <PortableText value={card.body} components={portableTextComponents} />
                  </div>
                ) : null}
              </CalloutCard>
            </div>
          )}
        </div>
      </article>
    </section>
  )
}
