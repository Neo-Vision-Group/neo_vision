import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // 1. Extract the Sanity file URL from the query string
    const { searchParams } = new URL(request.url);
    const sanityFileUrl = searchParams.get('url');

    if (!sanityFileUrl) {
      return new NextResponse('<h1>Error: Missing Sanity file URL</h1>', { status: 400 });
    }

    // 2. Fetch the plain HTML document from Sanity's CDN
    const response = await fetch(sanityFileUrl, {
      next: { revalidate: 3600 } // Cache the file on the server for 1 hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch file from Sanity CDN');
    }
    
    let html = await response.text();

    // 3. Inject the client-to-parent communication script right before </body>
    const resizeScript = `
      <script>
        function sendHeight() {
          const height = document.documentElement.scrollHeight || document.body.scrollHeight;
          window.parent.postMessage({ type: 'RESIZE_IFRAME', height: height }, '*');
        }
        window.addEventListener('load', sendHeight);
        window.addEventListener('resize', sendHeight);
        
        // Watch for internal DOM changes (like dynamic content loading inside the HTML)
        const observer = new MutationObserver(sendHeight);
        observer.observe(document.body, { subtree: true, childList: true });
      </script>
    `;
    
    html = html.replace('</body>', `${resizeScript}</body>`);

    // 4. Return the complete HTML document to the Iframe
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