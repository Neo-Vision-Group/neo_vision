import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import { ComparisonTable } from '@/components/partials/ComparisonTable'
import { CalloutCard } from '@/components/partials/CalloutCard'

// Type for the GROQ query response (includes _key from Sanity)
export type InsightBlockQueryResponse = {
  _key: string
  _type: 'insightBlock'
  title?: string
  text?: Array<{
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
  }>
  sectionType?: 'none' | 'quote' | 'table' | 'card'
  quote?: {
    quote?: string
    attribution?: string
  }
  table?: {
    headers?: string[]
    rows?: Array<{ cells?: string[]; _key: string }>
  }
  card?: {
    label?: string
    body?: string
  }
}

// Type for component props (cleaner, no _key)
export interface InsightBlockData {
  title?: string
  text?: Array<{
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
  }>
  sectionType?: 'none' | 'quote' | 'table' | 'card'
  quote?: {
    quote?: string
    attribution?: string
  }
  table?: {
    headers?: string[]
    rows?: Array<{ cells?: string[]; _key: string }>
  }
  card?: {
    label?: string
    body?: string
  }
}

const portableTextComponents = {
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="my-5 text-[18px] text-foreground/80 leading-normal">{children}</p>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="mt-10 mb-3 text-[32px] font-normal leading-[1.2] tracking-[-1px] text-foreground">{children}</h3>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-bold text-foreground">{children}</strong>,
    em: ({ children }: { children?: React.ReactNode }) => <em>{children}</em>,
    link: (props: { value?: { href?: string }; children?: React.ReactNode }) => {
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

interface InsightBlockProps {
  data: InsightBlockData
}

export function InsightBlock({ data }: InsightBlockProps) {
  const { title, text, sectionType, quote, table, card } = data

  return (
    <section className="px-6 py-16 md:py-20">
      <article className="mx-auto max-w-[72ch]">
        {/* Header */}
        <h2 className="text-[36px] font-medium leading-[42px] tracking-[-0.4px] text-foreground md:text-[56px] md:leading-[64px] xl:text-[72px] xl:leading-[80px] mb-8">
          {title}
        </h2>

        {/* Text */}
        {text && text.length > 0 && (
          <div className="text-body text-foreground/80 mb-12 space-y-6">
            <PortableText value={text} components={portableTextComponents} />
          </div>
        )}

        {/* Quote Section */}
        {sectionType === 'quote' && quote && (
          <div className="mb-12">
            <div className="bg-surface border border-white/10 p-12 gap-12 flex items-start dark:border-white/20">
              <div className="flex-shrink-0 text-6xl text-brand font-serif">"</div>
              <div className="flex-1">
                <p className="text-[32px] leading-[1.2] tracking-[-1px] text-foreground mb-4">
                  {quote.quote}
                </p>
                {quote.attribution && (
                  <p className="text-caption text-muted uppercase tracking-wider">
                    — {quote.attribution}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        {sectionType === 'table' && table && table.headers && table.rows && (
          <div className="mb-12">
            <ComparisonTable
              beforeLabel={table.headers[1] || 'Before'}
              afterLabel={table.headers[2] || 'After'}
              rows={table.rows.map((row) => ({
                label: row.cells?.[0] || '',
                before: row.cells?.[1] || '',
                after: row.cells?.[2] || '',
              }))}
            />
          </div>
        )}

        {/* Card Section */}
        {sectionType === 'card' && card && (
          <div className="mb-12">
            <CalloutCard label={card.label}>{card.body}</CalloutCard>
          </div>
        )}
      </article>
    </section>
  )
}
