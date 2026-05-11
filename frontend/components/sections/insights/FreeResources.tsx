'use client'

import {SectionsWrapper} from '@/components/SectionsWrapper'
import ArrowDownIcon from '@/components/icons/ArrowDownIcon'
import ArrowRightPixel from '@/components/icons/ArrowRightPixel'
import {HeadingShape} from '@/components/sections/PageHero'
import {cleanStega} from '@/sanity/lib/utils'
import { useTheme } from 'next-themes'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const RevealOnScroll = dynamic(
  () => import('@/components/partials/motion/RevealOnScroll').then((mod) => mod.RevealOnScroll),
  {ssr: false},
)

export type FreeResourcesData = {
  eyebrow?: string
  heading?: HeadingShape
  body?: string
  footnote?: string
  items?: Array<{
    title?: string
    badge?: string
    description?: string
    file?: {
      asset?: {
        url?: string
      }
    }
    fileUrl?: string
    externalUrl?: string
  }>
}

function Heading({value}: {value: HeadingShape}) {
  if (typeof value === 'string') {
    return <span>{value}</span>
  }

  const {faded, bold, trailing, regular} = value
  return (
    <span>
      {faded ? <span className="text-black/70 dark:text-[#efefef]/70">{faded} </span> : null}
      {regular ? <span>{regular} </span> : null}
      {bold ? <span className="font-bold">{bold}</span> : null}
      {trailing ? (
        <>
          <br />
          <span className="text-black/70 dark:text-[#efefef]/70">{trailing}</span>
        </>
      ) : null}
    </span>
  )
}

export function FreeResources({data}: {data?: FreeResourcesData}) {
  const cleanData = data ? cleanStega(data) : data
  const items = cleanData?.items ?? []

  if (items.length === 0) {
    return null
  }

  return (
    <SectionsWrapper id="resources" eyebrow={cleanData?.eyebrow ?? 'FREE RESOURCES'} classNameOverride='px-0 pb-24'>
      <div className="flex flex-col">
        <div className="px-6 pb-12 md:px-6 lg:px-8 xl:px-12 2xl:px-12">
          <h2 className="text-640 leading-[1.08] tracking-[-0.8px] text-black dark:text-[#efefef] md:text-5xl md:leading-[1.2] md:tracking-[-1px]">
            <Heading value={cleanData?.heading ?? {}} />
          </h2>
          {cleanData?.body ? (
            <p className="mt-3 text-64 leading-[1.55] text-black/70 dark:text-[#efefef]/70 md:text-[18px] md:leading-normal">
              {cleanData.body}
            </p>
          ) : null}
        </div>

        <RevealOnScroll
          as="div"
          stagger={0.06}
          className="grid grid-cols-1 border-y border-black/15 dark:border-white/20 md:grid-cols-2"
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              className="border-black/15 last:border-b-0 dark:border-white/20 not-last:border-b md:last:border-b md:odd:border-r md:nth-last-[-n+2]:border-b-0"
            >
              <ResourceCard item={item} />
            </div>
          ))}
        </RevealOnScroll>

        {cleanData?.footnote ? (
          <div className="border-b border-black/15 px-6 py-10 dark:border-white/20 md:px-6 md:py-12 lg:px-8 xl:px-12 2xl:px-12">
            <p className="text-[28px] leading-[1.1] tracking-[-0.8px] text-black/70 dark:text-[#efefef]/70 md:text-4xl md:leading-[1.2] md:tracking-[-1px]">
              {cleanData.footnote}
            </p>
          </div>
        ) : null}
      </div>
    </SectionsWrapper>
  )
}

function ResourceCard({item}: {item: NonNullable<FreeResourcesData['items']>[number]}) {
  const downloadUrl = item?.fileUrl ?? item?.file?.asset?.url ?? item?.externalUrl ?? ''
  const isExternal = !!item?.externalUrl && !item?.fileUrl && !item?.file?.asset?.url
  const hasUrl = Boolean(downloadUrl)

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkTheme = resolvedTheme === "dark";
  const buttonColor = mounted && isDarkTheme
    ? "#EFEFEF"
    : "#040404";

  return (
    <article className="p-4 md:p-6">
      <div className="group flex h-full min-h-70 flex-col gap-12 border border-black/15 bg-[#efefef] p-6 transition-transform duration-300 ease-out hover:-translate-y-1 hover:border-brand/40 dark:border-white/20 dark:bg-[#0f0f0f] md:min-h-[228px] md:p-8">
        <div className="flex h-11 w-11 items-center justify-center bg-brand md:h-12 md:w-12">
          <ArrowRightPixel color={buttonColor} className="h-5 w-5 text-black rotate-90" />
        </div>

        <div className="flex flex-1 flex-col justify-between gap-8">
          <div className="flex flex-col gap-4">
            {item?.badge ? (
              <span className="self-start bg-[rgba(255,65,0,0.3)] px-2 py-1 font-funnel text-[14px] leading-[1.2] tracking-[-0.2px] text-black dark:text-[#efefef] md:px-2.5 md:py-1.5 md:text-[18px] md:leading-normal">
                {item.badge}
              </span>
            ) : null}

            <div className="flex flex-col gap-1">
              {item?.title ? (
                <h3 className="text-[30px] leading-[1.08] tracking-[-0.8px] text-black dark:text-[#efefef] md:text-4xl md:leading-[1.2] md:tracking-[-1px]">
                  {item.title}
                </h3>
              ) : null}

              {item?.description ? (
                <p className="text-64 leading-[1.55] text-black/70 dark:text-[#efefef]/70 md:text-[18px] md:leading-normal">
                  {item.description}
                </p>
              ) : null}
            </div>
          </div>

          {hasUrl ? (
            <a
              href={downloadUrl}
              target={isExternal ? '_blank' : '_self'}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center gap-3 self-start text-black transition-transform duration-200 group-hover:translate-x-1 dark:text-[#efefef]"
              download={!isExternal}
            >
              <ArrowRightPixel color={buttonColor} width={39} height={24} className="shrink-0" />
              <span className="font-funnel text-[22px] font-bold leading-[1.2] md:text-100">
                Download
              </span>
            </a>
          ) : (
            <span className="inline-flex items-center gap-3 self-start text-black/40 dark:text-[#efefef]/40">
              <ArrowRightPixel color={buttonColor} width={39} height={24} className="shrink-0" />
              <span className="font-funnel text-[22px] font-bold leading-[1.2] md:text-100">
                Download
              </span>
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
