'use client'

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Document, Page, pdfjs } from 'react-pdf';
import { DrawLine } from '@/components/partials/motion/DrawLine';
import ArrowRight from '@/components/icons/ArrowRight';
import ArrowRightPixel from '@/components/icons/ArrowRightPixel';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const SplitTextReveal = dynamic(
    () => import('@/components/partials/motion/SplitTextReveal').then((mod) => mod.SplitTextReveal),
    { ssr: false }
);

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;

type DownloadCta = {
    heading?: string
    subheading?: string
    buttonText?: string
}

export default function PDFViewer({ fileUrl, title, downloadCta, downloadUrl }: { fileUrl: string; title?: string; downloadCta?: DownloadCta; downloadUrl?: string }) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [inputValue, setInputValue] = useState('1');
    const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);

    const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

    async function handleDownload() {
        if (!downloadUrl) return;
        try {
            const res = await fetch(downloadUrl);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const basename = downloadUrl.split('/').pop()?.split('?')[0] || 'download';
            const extension = basename.includes('.') ? basename.slice(basename.lastIndexOf('.')) : '';
            const safeTitle = (title || 'download').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase() || 'download';
            a.download = `${safeTitle}${extension || '.pdf'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('[PDFViewer] Download failed:', err);
        }
    }

    const containerRef = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;
        const observer = new ResizeObserver(([entry]) => {
            setContainerWidth(entry.contentRect.width);
        });
        observer.observe(node);
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        pageRefs.current = new Array(numPages).fill(null);
    }

    function scrollToPage(n: number) {
        if (!numPages) return;
        const target = Math.max(1, Math.min(n, numPages));
        const el = pageRefs.current[target - 1];
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        // Scroll so there's ~120px of context above the page (shows title on page 1)
        window.scrollTo({ top: Math.max(0, top - 120), behavior: 'smooth' });
        setCurrentPage(target);
        setInputValue(String(target));
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!numPages) return;
        const raw = e.target.value;
        // Allow empty string while typing
        if (raw === '') {
            setInputValue('');
            return;
        }
        const parsed = parseInt(raw, 10);
        if (isNaN(parsed)) return;
        // Clamp and scroll immediately
        const clamped = Math.max(1, Math.min(parsed, numPages));
        setInputValue(String(clamped));
        scrollToPage(clamped);
    }

    function handleInputBlur() {
        // Reset to current page if left empty
        if (inputValue === '') setInputValue(String(currentPage));
    }

    function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        // Block e, E, +, -, .
        if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
        if (e.key === 'Escape') setInputValue(String(currentPage));
    }

    // IntersectionObserver: track which page is most visible
    useEffect(() => {
        if (!numPages) return;
        const observers: IntersectionObserver[] = [];
        const visibilityMap = new Map<number, number>();

        pageRefs.current.forEach((el, i) => {
            if (!el) return;
            const obs = new IntersectionObserver(
                ([entry]) => {
                    visibilityMap.set(i + 1, entry.intersectionRatio);
                    let maxPage = 1;
                    let maxRatio = 0;
                    visibilityMap.forEach((ratio, page) => {
                        if (ratio > maxRatio) { maxRatio = ratio; maxPage = page; }
                    });
                    setCurrentPage(maxPage);
                    setInputValue(String(maxPage));
                },
                { threshold: Array.from({ length: 11 }, (_, k) => k / 10) }
            );
            obs.observe(el);
            observers.push(obs);
        });

        return () => observers.forEach(o => o.disconnect());
    }, [numPages]);

    return (
        <section className="relative flex flex-col md:flex-row w-full md:items-start bg-white dark:bg-dark">
            {/* Sidebar */}
            <aside className="w-full md:sticky md:top-0 md:z-10 md:flex md:h-fit md:w-1/4 md:shrink-0 md:flex-col md:items-start pt-24">
                <div className="h-px w-full bg-black/20 dark:bg-white/20" />
                <div className="relative w-full pl-6 2xl:pl-30 lg:pl-16 md:pl-6 pr-6 py-6 flex flex-col gap-4">
                    <p className="font-clash text-center md:text-left text-[24px] lg:text-3xl text-black dark:text-white font-bold">
                        Resource
                    </p>

                    {numPages && (
                        <div className="flex flex-col gap-1">
                            <label htmlFor="pdf-page-input" className="font-funnel text-xs text-black/50 dark:text-white/40 uppercase tracking-wider">
                                Page
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    id="pdf-page-input"
                                    type="number"
                                    min={1}
                                    max={numPages}
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onBlur={handleInputBlur}
                                    onKeyDown={handleInputKeyDown}
                                    className="w-16 border border-black/20 dark:border-white/20 bg-transparent px-2 py-1.5 font-funnel text-base text-black dark:text-[#efefef] focus:outline-none focus:border-brand transition-colors duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="font-funnel text-sm text-black/40 dark:text-white/30">
                                    / {numPages}
                                </span>
                            </div>
                        </div>
                    )}
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

                {/* All pages */}
                <div ref={containerRef} className="w-full px-6 lg:px-8 xl:px-16">
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={(error) => console.error('[PDFViewer] Load error:', error)}
                        loading={
                            <div className="flex items-center justify-center py-32 text-black/40 dark:text-white/30 font-funnel text-sm">
                                Loading document…
                            </div>
                        }
                        error={
                            <div className="flex items-center justify-center py-32 text-brand font-funnel text-sm">
                                Failed to load PDF. Please try again.
                            </div>
                        }
                        className="w-full flex flex-col gap-4"
                    >
                        {numPages && Array.from({ length: numPages }, (_, i) => (
                            <div
                                key={i}
                                ref={el => { pageRefs.current[i] = el; }}
                            >
                                <Page
                                    pageNumber={i + 1}
                                    width={containerWidth}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className="w-full shadow-lg"
                                />
                            </div>
                        ))}
                    </Document>
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
                                <span className="relative shrink-0 block" style={{width: 38, height: 24}}>
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
    );
}