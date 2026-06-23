'use client';

import { useState, useEffect } from 'react';

interface HTMLViewerProps {
  src: string;
  title: string;
}

const RESIZE_SCRIPT = `
<script>
(function() {
  function sendHeight() {
    var height = Math.max(
      document.documentElement ? document.documentElement.scrollHeight : 0,
      document.body ? document.body.scrollHeight : 0
    );
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'RESIZE_IFRAME', height: height }, '*');
    }
  }
  if (document.readyState === 'complete') {
    sendHeight();
  } else {
    window.addEventListener('load', sendHeight);
  }
  window.addEventListener('resize', sendHeight);
  setTimeout(sendHeight, 100);
  setTimeout(sendHeight, 500);
})();
</script>
`;

function injectResizeScript(html: string): string {
  const lower = html.toLowerCase();
  const bodyClose = lower.lastIndexOf('</body>');
  if (bodyClose !== -1) {
    return html.slice(0, bodyClose) + RESIZE_SCRIPT + html.slice(bodyClose);
  }
  return html + RESIZE_SCRIPT;
}

export default function HTMLViewer({ src, title }: HTMLViewerProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [height, setHeight] = useState('500px');

  useEffect(() => {
    let cancelled = false;

    const fetchHtml = async () => {
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (!cancelled) setHtml(injectResizeScript(text));
      } catch (err) {
        console.error('[HTMLViewer] Failed to fetch HTML:', err);
        if (!cancelled) setError(true);
      }
    };

    fetchHtml();
    return () => { cancelled = true; };
  }, [src]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'RESIZE_IFRAME') {
        setHeight(`${event.data.height}px`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center py-32 text-brand font-funnel text-sm">
        Failed to load HTML resource.
      </div>
    );
  }

  if (!html) {
    return (
      <div className="flex items-center justify-center py-32 text-black/40 dark:text-white/30 font-funnel text-sm">
        Loading HTML resource…
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      title={title}
      loading="lazy"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox"
      style={{
        width: '100%',
        height: height,
        backgroundColor: '#ffffff',
        border: 'none',
        transition: 'height 0.15s ease-out',
      }}
    />
  );
}