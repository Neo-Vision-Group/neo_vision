'use client'

import { useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { DrawLine } from '@/components/partials/motion/DrawLine'
import ArrowRight from '@/components/icons/ArrowRight'
import ArrowRightPixel from '@/components/icons/ArrowRightPixel'

const SplitTextReveal = dynamic(
    () => import('@/components/partials/motion/SplitTextReveal').then((mod) => mod.SplitTextReveal),
    { ssr: false }
)

type DownloadCta = {
    heading?: string
    subheading?: string
    buttonText?: string
}

interface ImageViewerProps {
    src: string
    title?: string
    alt?: string
    downloadCta?: DownloadCta
    downloadUrl?: string
    compact?: boolean
}

export default function ImageViewer({ src, title, alt, downloadCta, downloadUrl, compact = false }: ImageViewerProps) {
    const [error, setError] = useState(false)

    async function handleDownload() {
        if (!downloadUrl) return
        try {
            const res = await fetch(downloadUrl)
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            const basename = downloadUrl.split('/').pop()?.split('?')[0] || 'download'
            const extension = basename.includes('.') ? basename.slice(basename.lastIndexOf('.')) : ''
            const safeTitle = (title || 'download').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase() || 'download'
            a.download = `${safeTitle}${extension || '.jpg'}`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('[ImageViewer] Download failed:', err)
        }
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-32 text-brand font-funnel text-sm">
                Failed to load image.
            </div>
        )
    }

    if (compact) {
        return (
            <div className="relative w-full bg-white dark:bg-dark">
                <DrawLine
                    className="w-full h-px bg-black/20 dark:bg-white/20"
                    start="top 90%"
                    end="top 30%"
                    direction="horizontal"
                />
                {title && (
                    <div className="px-4 pt-4">
                        <p className="font-funnel text-sm uppercase tracking-wider text-black/50 dark:text-white/40">
                            Resource
                        </p>
                        <p className="font-funnel text-lg text-black dark:text-white leading-tight">
                            {title}
                        </p>
                    </div>
                )}
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <Image
                        src={src}
                        alt={alt || title || 'Resource preview'}
                        fill
                        className="object-contain"
                        onError={() => setError(true)}
                        sizes="(max-width: 768px) 100vw, 560px"
                        priority
                    />
                </div>
            </div>
        )
    }

    return (
        <section className="relative flex flex-col md:flex-row w-full md:items-start bg-white dark:bg-dark">
            {/* Sidebar */}
            <aside className="w-full md:sticky md:top-0 md:z-10 md:flex md:h-fit md:w-1/4 md:shrink-0 md:flex-col md:items-start pt-24">
                <div className="h-px w-full bg-black/20 dark:bg-white/20" />
                <div className="relative w-full pl-6 2xl:pl-30 lg:pl-16 md:pl-6 pr-6 py-6 flex flex-col gap-4">
                    <p className="font-clash text-center md:text-left text-[24px] lg:text-3xl text-black dark:text-white font-bold">
                        Resource
                    </p>
                </div>
                <DrawLine
                    className="hidden md:block h-px w-full bg-black/20 dark:bg-white/20"
                    start="top 80%"
                    end="top 40%"
                    direction="horizontal"
                />
            </aside>

            {/* Vertical separator */}
            <DrawLine
                className="hidden md:block w-px self-stretch bg-black/20 dark:bg-white/20"
                start="top 85%"
                end="bottom 85%"
                direction="vertical"
            />

            {/* Main content */}
            <div className="flex min-w-0 flex-1 flex-col gap-12 md:pt-24">
                <DrawLine
                    className="w-full h-px bg-black/20 dark:bg-white/20"
                    start="top 90%"
                    end="top 30%"
                    direction="horizontal"
                />

                {/* Section title */}
                {title && (
                    <div className="px-6 lg:px-8 xl:px-16">
                        <SplitTextReveal
                            as="h1"
                            type="words"
                            stagger={0.04}
                            colorReveal
                            className="font-funnel text-4xl leading-[1.2] tracking-[-1px] text-black dark:text-white md:text-[40px] lg:text-5xl"
                        >
                            {title}
                        </SplitTextReveal>
                    </div>
                )}

                {/* Image */}
                <div className="w-full px-6 lg:px-8 xl:px-16">
                    <div className="relative w-full aspect-[4/3] overflow-hidden shadow-lg">
                        <Image
                            src={src}
                            alt={alt || title || 'Resource'}
                            fill
                            className="object-contain"
                            onError={() => setError(true)}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 900px"
                            priority
                        />
                    </div>
                </div>

                {/* Download CTA */}
                {(downloadCta?.heading || downloadCta?.subheading || downloadCta?.buttonText) && downloadUrl && (
                    <>
                        <DrawLine
                            className="w-full h-px bg-black/20 dark:bg-white/20"
                            start="top 90%"
                            end="top 30%"
                            direction="horizontal"
                        />
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-6 lg:px-8 xl:px-16 py-12 pb-16">
                            <div className="flex flex-col gap-2">
                                {downloadCta.heading && (
                                    <p className="max-w-190 font-funnel text-[24px] text-black dark:text-[#efefef] leading-tight tracking-[-0.15px]">
                                        {downloadCta.heading}
                                    </p>
                                )}
                                {downloadCta.subheading && (
                                    <p className="text-[18px] text-black/70 dark:text-[#efefef]/70">
                                        {downloadCta.subheading}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={handleDownload}
                                className="group inline-flex max-w-full text-xl items-center justify-center font-medium leading-none transition-all duration-200 ease-out bg-brand text-white hover:bg-brand-dark hover:shadow-[0_0_60px_0px_rgba(255,65,0,0.5)] font-funnel pl-6 pr-4 py-3 gap-3 h-full self-start px-8 md:px-10 lg:self-center cursor-pointer"
                            >
                                <span className="min-w-0 whitespace-normal text-center leading-[1.2]">
                                    {downloadCta.buttonText || 'Download'}
                                </span>
                                <span className="relative shrink-0 block" style={{ width: 38, height: 24 }}>
                                    <ArrowRight
                                        className="absolute inset-0 transition-all duration-200 ease-out group-hover:opacity-0 group-hover:translate-x-1"
                                        width={38}
                                        height={24}
                                        color="white"
                                    />
                                    <ArrowRightPixel
                                        className="absolute inset-0 opacity-0 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-1"
                                        width={38}
                                        height={24}
                                        color="white"
                                    />
                                </span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}
