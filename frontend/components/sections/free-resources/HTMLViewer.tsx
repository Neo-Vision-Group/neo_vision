'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { DrawLine } from '@/components/partials/motion/DrawLine';

const SplitTextReveal = dynamic(
  () => import('@/components/partials/motion/SplitTextReveal').then((mod) => mod.SplitTextReveal),
  { ssr: false }
);

interface HTMLViewerProps {
  src: string;
  title: string;
}

function embedHtmlUrl(sanityUrl: string): string {
  return `/api/embed-html?url=${encodeURIComponent(sanityUrl)}`;
}

export default function HTMLViewer({ src, title }: HTMLViewerProps) {
  const [height, setHeight] = useState('500px');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Sandboxed iframes without allow-same-origin report origin as the
      // string "null" (opaque origin). Accept that alongside the real origin.
      if (event.origin !== window.location.origin && event.origin !== 'null') return;
      if (event.data?.type === 'RESIZE_IFRAME') {
        setHeight(`${event.data.height}px`);
      }
      if (event.data?.type === 'IFRAME_WHEEL') {
        const deltaY = typeof event.data.deltaY === 'number' ? event.data.deltaY : 0;
        const deltaX = typeof event.data.deltaX === 'number' ? event.data.deltaX : 0;
        const wheelEvent = new WheelEvent('wheel', {
          deltaY,
          deltaX,
          bubbles: true,
          cancelable: true,
        });
        window.dispatchEvent(wheelEvent);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <section className="relative flex flex-col md:flex-row w-full md:items-start bg-white dark:bg-dark">
      {/* Sidebar */}
      <aside className="w-full md:sticky md:top-0 md:z-10 md:flex md:h-fit md:w-1/4 md:shrink-0 md:flex-col md:items-start pt-24">
        <div className="h-px w-full bg-black/20 dark:bg-white/20" />
        <div className="relative w-full pl-6 2xl:pl-30 lg:pl-16 md:pl-6 pr-6 py-6 flex flex-col gap-4">
          <p className="font-clash text-center md:text-left text-[24px] lg:text-3xl text-black dark:text-white font-bold">
            {title}
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
      <div className="flex min-w-0 flex-1 flex-col gap-12 md:pt-24 pb-24">
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

        {/* HTML iframe */}
        <div className="w-full px-6 lg:px-8 xl:px-16">
          <iframe
            src={embedHtmlUrl(src)}
            title={title}
            loading="lazy"
            sandbox="allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox"
            style={{
              width: '100%',
              height: height,
              border: 'none',
              transition: 'height 0.15s ease-out',
            }}
          />
        </div>
      </div>
    </section>
  );
}