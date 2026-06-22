'use client'

import { useState, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { DrawLine } from '@/components/partials/motion/DrawLine';
import { cn } from '@/lib/utils';
import ArrowRightPixel from '@/components/icons/ArrowRightPixel';
import { AnimatedBorder } from '@/components/AnimatedBorder';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;

export default function PDFViewer({ fileUrl }: { fileUrl: string }) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);

    const touchStartX = useRef<number | null>(null);
    const SWIPE_THRESHOLD = 50;

    const containerRef = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;
        const observer = new ResizeObserver(([entry]) => {
            setContainerWidth(entry.contentRect.width);
        });
        observer.observe(node);
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    function goToPrev() {
        setPageNumber(prev => Math.max(prev - 1, 1));
    }

    function goToNext() {
        setPageNumber(prev => (numPages ? Math.min(prev + 1, numPages) : prev + 1));
    }

    function onTouchStart(e: React.TouchEvent) {
        touchStartX.current = e.touches[0].clientX;
    }

    function onTouchEnd(e: React.TouchEvent) {
        if (touchStartX.current === null) return;
        const delta = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(delta) < SWIPE_THRESHOLD) return;
        if (delta > 0) goToNext();
        else goToPrev();
        touchStartX.current = null;
    }

    const isFirst = pageNumber <= 1;
    const isLast = numPages !== null && pageNumber >= numPages;

    return (
        <section className="relative flex flex-col md:flex-row w-full md:items-start bg-white dark:bg-dark">
            {/* Eyebrow sidebar — mirrors SectionsWrapper */}
            <aside className="w-full md:sticky md:top-0 md:z-10 md:flex md:h-fit md:w-1/4 md:shrink-0 md:flex-col md:items-start pt-24">
                <div className="h-px w-full bg-black/20 dark:bg-white/20" />
                <div className="relative w-full pl-6 2xl:pl-30 lg:pl-16 md:pl-6 pr-6 py-6">
                    <p className="font-clash text-center md:text-left text-3xl text-[24px] lg:text-3xl text-black dark:text-[#efefef] font-bold">
                        Resource
                    </p>
                    {numPages && (
                        <p className="mt-2 font-funnel text-sm text-black/50 dark:text-white/40 text-center md:text-left">
                            Page {pageNumber} of {numPages}
                        </p>
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
            <div className="flex min-w-0 flex-1 flex-col gap-0 md:pt-24">
                <DrawLine
                    className="w-full h-px bg-black/20 dark:bg-white/20"
                    start="top 90%"
                    end="top 30%"
                    direction="horizontal"
                />

                {/* PDF Canvas */}
                <div
                    ref={containerRef}
                    className="w-full px-6 lg:px-8 xl:px-16 select-none touch-pan-y"
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                >
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
                        className="w-full"
                    >
                        <Page
                            pageNumber={pageNumber}
                            width={containerWidth}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="w-full shadow-lg"
                        />
                    </Document>
                </div>

                {/* Controls — below the PDF */}
                <div className="flex items-center justify-between gap-4 px-6 lg:px-8 xl:px-16 py-8 border-t border-black/10 dark:border-white/10 mt-4">
                    <button
                        onClick={goToPrev}
                        disabled={isFirst}
                        aria-label="Previous page"
                        className={cn(
                            'group relative inline-flex items-center gap-3 self-start px-2 py-1 transition-colors duration-200 text-black dark:text-[#efefef]',
                            isFirst ? 'opacity-30 pointer-events-none' : 'hover:text-brand'
                        )}
                    >
                        <AnimatedBorder groupHover={!isFirst} />
                        <ArrowRightPixel
                            color="currentColor"
                            width={38}
                            height={24}
                            className="relative z-10 h-6 w-10 shrink-0 transition-transform duration-200 -scale-x-100 group-hover:-translate-x-1"
                        />
                        <span className="relative z-10 font-funnel text-base font-bold leading-[1.2]">
                            Previous
                        </span>
                    </button>

                    {/* Page indicator dots */}
                    {numPages && numPages <= 20 && (
                        <div className="hidden sm:flex items-center gap-1.5">
                            {Array.from({ length: numPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPageNumber(i + 1)}
                                    aria-label={`Go to page ${i + 1}`}
                                    className={cn(
                                        'transition-all duration-200',
                                        i + 1 === pageNumber
                                            ? 'w-4 h-1.5 bg-brand'
                                            : 'w-1.5 h-1.5 bg-black/20 dark:bg-white/20 hover:bg-brand/60'
                                    )}
                                />
                            ))}
                        </div>
                    )}

                    {/* Numeric fallback for long documents */}
                    {numPages && numPages > 20 && (
                        <span className="font-funnel text-sm text-black/40 dark:text-white/30">
                            {pageNumber} / {numPages}
                        </span>
                    )}

                    <button
                        onClick={goToNext}
                        disabled={isLast}
                        aria-label="Next page"
                        className={cn(
                            'group relative inline-flex items-center gap-3 self-start px-2 py-1 transition-colors duration-200 text-black dark:text-[#efefef]',
                            isLast ? 'opacity-30 pointer-events-none' : 'hover:text-brand'
                        )}
                    >
                        <AnimatedBorder groupHover={!isLast} />
                        <span className="relative z-10 font-funnel text-base font-bold leading-[1.2]">
                            Next
                        </span>
                        <ArrowRightPixel
                            color="currentColor"
                            width={38}
                            height={24}
                            className="relative z-10 h-6 w-10 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                        />
                    </button>
                </div>

                {/* Mobile swipe hint */}
                <p className="sm:hidden text-center font-funnel text-xs text-black/30 dark:text-white/25 pb-8 -mt-4">
                    Swipe left or right to navigate
                </p>
            </div>
        </section>
    );
}