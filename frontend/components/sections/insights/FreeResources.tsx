'use client'

import {SectionsWrapper} from '@/components/SectionsWrapper'
import ArrowRightPixel from '@/components/icons/ArrowRightPixel'
import {HeadingShape} from '@/components/sections/PageHero'
import {AnimatedBorder} from '@/components/AnimatedBorder'
import {cleanStega} from '@/sanity/lib/utils'
import { useTheme } from 'next-themes'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ResourceRequestPopUp } from '@/components/partials/ResourceRequestPopUp'

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
    _key?: string
    title?: string
    slug?: string
    description?: string
    badge?: string
    cta?: string
    file?: {
      type?: 'pdf' | 'image' | 'html'
    }
    fileUrl?: string
    externalLink?: string
    askForEmail?: boolean
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

  // Derive the hosting page slug from the current path so the server can
  // re-resolve the resource (SEC-1). "/" → "" (home); "/insights" → "insights".
  const pathname = usePathname()
  const pageSlug = pathname === '/' ? '' : (pathname ?? '').replace(/^\/+/, '')

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<NonNullable<FreeResourcesData['items']>[number] | null>(null)

  const handleDownloadClick = (item: NonNullable<FreeResourcesData['items']>[number], e: React.MouseEvent) => {
    if (item.askForEmail) {
      e.preventDefault()
      setSelectedResource(item)
      setIsPopupOpen(true)
    }
    // If askForEmail is false, let the default link behavior handle the download
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false)
    setSelectedResource(null)
  }

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

        <div className="border-y border-black/15 dark:border-white/20">
        <RevealOnScroll
          as="div"
          stagger={0.06}
          className="grid grid-cols-1 lg:grid-cols-2"
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              className="h-full border-black/15 last:border-b-0 dark:border-white/20 not-last:border-b md:last:border-b md:odd:border-r md:nth-last-[-n+2]:border-b-0"
            >
              <ResourceCard item={item} onDownloadClick={handleDownloadClick} />
            </div>
          ))}
        </RevealOnScroll>
        </div>

        {cleanData?.footnote ? (
          <div className="border-b border-black/15 px-6 py-10 dark:border-white/20 md:px-6 md:py-12 lg:px-8 xl:px-12 2xl:px-12">
            <p className="text-[28px] leading-[1.1] tracking-[-0.8px] text-black/70 dark:text-[#efefef]/70 md:text-4xl md:leading-[1.2] md:tracking-[-1px]">
              {cleanData.footnote}
            </p>
          </div>
        ) : null}
      </div>

      <ResourceRequestPopUp 
        isOpen={isPopupOpen} 
        resourceName={selectedResource?.title ?? 'resource'}
        pageSlug={pageSlug}
        itemKey={selectedResource?._key}
        onClose={handleClosePopup}
      />
    </SectionsWrapper>
  )
}

function useDownload(url: string, filename?: string) {
  const [downloading, setDownloading] = useState(false)

  const trigger = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (downloading) return
    setDownloading(true)
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = filename ?? url.split('/').pop() ?? 'download'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      window.open(url, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  return {trigger, downloading}
}

function ResourceCard({item, onDownloadClick}: {item: NonNullable<FreeResourcesData['items']>[number], onDownloadClick?: (item: NonNullable<FreeResourcesData['items']>[number], e: React.MouseEvent) => void}) {
  const downloadUrl = item?.fileUrl ?? item?.externalLink ?? ''
  const isExternal = !!item?.externalLink && !item?.fileUrl
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

  const {trigger, downloading} = useDownload(downloadUrl, item?.title ?? undefined)

  return (
    <article className="h-full p-6">
      <div className="group flex h-full min-h-70 flex-col gap-12 border border-black/15 bg-[#efefef] p-6 transition-transform duration-300 ease-out hover:-translate-y-1 hover:border-brand/40 dark:border-white/20 dark:bg-[#0f0f0f] md:min-h-57 md:p-8">
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
                <h3 className="text-[30px] leading-[1.08] tracking-[-0.8px] text-black dark:text-[#efefef] md:text-[32px] md:leading-[1.2] md:tracking-[-1px]">
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
              className="relative inline-flex items-center gap-3 self-start px-2 py-1 text-black transition-colors duration-200 group-hover:text-brand dark:text-[#efefef]"
              onClick={(e) => {
                if (item.askForEmail && onDownloadClick) {
                  onDownloadClick(item, e)
                } else if (!isExternal) {
                  trigger(e)
                }
              }}
              aria-disabled={downloading}
            >
              <AnimatedBorder groupHover />
              <ArrowRightPixel color="currentColor" width={39} height={24} className="relative z-10 shrink-0" />
              <span className="relative z-10 font-funnel text-[22px] font-bold leading-[1.2]">
                {downloading ? 'Downloading…' : 'Download'}
              </span>
            </a>
          ) : (
            <span className="inline-flex items-center gap-3 self-start text-black/40 dark:text-[#efefef]/40">
              <ArrowRightPixel color={buttonColor} width={39} height={24} className="shrink-0" />
              <span className="font-funnel dark:text-white text-dark text-[22px] font-bold leading-[1.2]">
                {item.cta ?? 'Download'}
              </span>
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
