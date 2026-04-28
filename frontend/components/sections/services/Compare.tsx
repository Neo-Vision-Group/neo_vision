import {SectionsWrapper} from '@/components/SectionsWrapper'
import {cleanStega} from '@/sanity/lib/utils'
import dynamic from 'next/dynamic'

const RevealOnScroll = dynamic(
  () =>
    import('@/components/partials/motion/RevealOnScroll').then(
      (mod) => mod.RevealOnScroll,
    ),
  {ssr: false},
)

type CompareRow = {
  _key?: string
  label?: string
}

type CompareColumnValue = {
  _key?: string
  available?: boolean
}

type CompareColumn = {
  _key?: string
  name?: string
  highlightColumn?: boolean
  values?: CompareColumnValue[]
}

type CompareClosing = {
  lead?: string
  highlight?: string
  followup?: string
}

type CompareHeading = {
  highlighted?: string
  regular?: string
}

export type CompareData = {
  eyebrow?: string
  heading?: CompareHeading
  rows?: CompareRow[]
  columns?: CompareColumn[]
  closing?: CompareClosing
}

function StatusMark({available, highlighted}: {available: boolean; highlighted: boolean}) {
  return (
    <span
      aria-label={available ? 'Included' : 'Not included'}
      className={available ? 'text-brand' : 'text-foreground/55'}
    >
      {available ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`mx-auto h-5 w-5 ${highlighted ? 'text-brand' : 'text-brand'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="mx-auto h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M7 7L17 17" />
          <path d="M17 7L7 17" />
        </svg>
      )}
    </span>
  )
}

export function Compare({data}: {data?: CompareData}) {
  const cleanData = data ? cleanStega(data) : undefined
  const eyebrow = cleanData?.eyebrow ?? 'HOW WE COMPARE'
  const heading = cleanData?.heading
  const rows = cleanData?.rows?.filter((row) => row?.label) ?? []
  const columns = cleanData?.columns?.filter((column) => column?.name) ?? []
  const closing = cleanData?.closing

  if (!heading || rows.length === 0 || columns.length === 0) {
    return null
  }

  return (
    <SectionsWrapper eyebrow={eyebrow}>
      <div className="flex flex-col gap-16">
        <RevealOnScroll as="div" className="flex flex-col gap-16" stagger={0.08}>
          <div className="max-w-4xl">
            <h2 className="text-4xl leading-[1.2] tracking-[-0.03em] text-foreground md:text-[40px] lg:text-5xl">
              <span className="font-bold text-foreground">{heading.highlighted} </span>
              <span className="text-foreground/70">{heading.regular}</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-215">
              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/20">
                    <th className="w-[26%] px-2 py-0 text-left" />
                    {columns.map((column, columnIndex) => {
                      const highlighted = Boolean(column.highlightColumn)

                      return (
                        <th
                          key={column._key ?? `${column.name}-${columnIndex}`}
                          className={`px-3 py-5 text-center text-[14px] font-normal leading-[1.2] tracking-[-0.5px] ${
                            highlighted
                              ? 'bg-brand text-white'
                              : 'text-black dark:text-white'
                          }`}
                        >
                          {column.name}
                        </th>
                      )
                    })}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr
                      key={row._key ?? `${row.label}-${rowIndex}`}
                      className="border-b border-black/10 dark:border-white/20"
                    >
                      <th className="px-2 py-5 text-left text-[14px] font-normal leading-[1.2] tracking-[-0.5px] text-black dark:text-white">
                        {row.label}
                      </th>

                      {columns.map((column, columnIndex) => {
                        const highlighted = Boolean(column.highlightColumn)
                        const available = Boolean(column.values?.[rowIndex]?.available)

                        return (
                          <td
                            key={`${column._key ?? column.name}-${rowIndex}-${columnIndex}`}
                            className={`px-3 py-5 text-center text-[20px] font-bold leading-none ${
                              highlighted
                                ? 'bg-brand/20'
                                : 'text-black dark:text-white'
                            }`}
                          >
                            <StatusMark available={available} highlighted={highlighted} />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {closing?.lead || closing?.followup ? (
            <div className="max-w-4xl text-[28px] leading-[1.2] tracking-[-0.03em] text-foreground md:text-4xl">
              {closing?.lead ? (
                <p>
                  <span>{closing.lead} </span>
                  {closing.highlight ? (
                    <span className="font-bold text-brand">{closing.highlight}</span>
                  ) : null}
                </p>
              ) : null}
              {closing?.followup ? <p>{closing.followup}</p> : null}
            </div>
          ) : null}
        </RevealOnScroll>
      </div>
    </SectionsWrapper>
  )
}
