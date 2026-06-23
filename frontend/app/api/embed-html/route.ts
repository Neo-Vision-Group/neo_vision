import { NextResponse } from 'next/server';

const ALLOWED_CDN_HOSTNAME = 'cdn.sanity.io';

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
  if (typeof ResizeObserver !== 'undefined' && document.body) {
    var ro = new ResizeObserver(sendHeight);
    ro.observe(document.body);
  }
  setTimeout(sendHeight, 100);
  setTimeout(sendHeight, 500);
})();
</script>
`;

const WHEEL_SCRIPT = `
<script>
(function() {
  function forwardWheel(event) {
    event.preventDefault();
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'IFRAME_WHEEL',
        deltaY: event.deltaY,
        deltaX: event.deltaX
      }, '*');
    }
  }
  window.addEventListener('wheel', forwardWheel, { passive: false });
})();
</script>
`;

const TOUCH_SCRIPT = `
<script>
(function() {
  var lastY = null;
  var lastX = null;
  function forwardTouch(event) {
    if (event.touches.length === 1 && lastY !== null) {
      var deltaY = lastY - event.touches[0].clientY;
      var deltaX = lastX - event.touches[0].clientX;
      if (Math.abs(deltaY) > 2 || Math.abs(deltaX) > 2) {
        event.preventDefault();
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'IFRAME_WHEEL',
            deltaY: deltaY,
            deltaX: deltaX
          }, '*');
        }
      }
    }
    if (event.touches.length === 1) {
      lastY = event.touches[0].clientY;
      lastX = event.touches[0].clientX;
    }
  }
  function resetTouch() {
    lastY = null;
    lastX = null;
  }
  window.addEventListener('touchmove', forwardTouch, { passive: false });
  window.addEventListener('touchend', resetTouch);
  window.addEventListener('touchcancel', resetTouch);
})();
</script>
`;

export async function GET(request: Request) {
  try {
    // 1. Extract the Sanity file URL from the query string
    const { searchParams } = new URL(request.url);
    const sanityFileUrl = searchParams.get('url');

    if (!sanityFileUrl) {
      return new NextResponse('<h1>Error: Missing file URL</h1>', { status: 400 });
    }

    // 2. Validate the URL is strictly from cdn.sanity.io (SSRF prevention)
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(sanityFileUrl);
    } catch {
      return new NextResponse('<h1>Error: Invalid URL</h1>', { status: 400 });
    }

    if (parsedUrl.protocol !== 'https:' || parsedUrl.hostname !== ALLOWED_CDN_HOSTNAME) {
      return new NextResponse('<h1>Error: Invalid file source</h1>', { status: 400 });
    }

    // 3. Fetch the plain HTML document from Sanity's CDN
    const response = await fetch(parsedUrl.toString(), {
      next: { revalidate: 3600 } // Cache the file on the server for 1 hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch file from Sanity CDN');
    }

    let html = await response.text();

    // 3. Inject client-to-parent communication scripts right before </body>
    const lower = html.toLowerCase();
    const bodyClose = lower.lastIndexOf('</body>');
    const scripts = RESIZE_SCRIPT + WHEEL_SCRIPT + TOUCH_SCRIPT;
    if (bodyClose !== -1) {
      html = html.slice(0, bodyClose) + scripts + html.slice(bodyClose);
    } else {
      html = html + scripts;
    }

    // 4. Return the complete HTML document to the iframe
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    console.error("Error processing Sanity HTML inside API Route:", error);
    return new NextResponse('<h1>Content Temporarily Unavailable</h1>', {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}