import { useId } from "react";

const HERO_VIDEO_POSTER_LIGHT =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <rect width="1600" height="900" fill="#fff8f4" />
    </svg>
  `);

const HERO_VIDEO_POSTER_DARK =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f4efe9" />
          <stop offset="100%" stop-color="#ece3db" />
        </linearGradient>
        <radialGradient id="glowA" cx="78%" cy="24%" r="28%">
          <stop offset="0%" stop-color="#9d2b03" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#9d2b03" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="glowB" cx="24%" cy="82%" r="32%">
          <stop offset="0%" stop-color="#9d2b03" stop-opacity="0.16" />
          <stop offset="100%" stop-color="#9d2b03" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#bg)" />
      <rect width="1600" height="900" fill="url(#glowA)" />
      <rect width="1600" height="900" fill="url(#glowB)" />
    </svg>
  `);

export function HeroBrandDotsBackground() {
  const filterId = `${useId().replace(/:/g, "")}-brand-dots-filter`;

  return (
    <>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        focusable="false"
      >
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="
                0.2126 0.7152 0.0722 0 0
                0.0542 0.1823 0.0184 0 0
                0      0      0      0 0
                0.2126 0.7152 0.0722 0 0
              "
            />
          </filter>
        </defs>
      </svg>

      <div aria-hidden className="pointer-events-none absolute inset-0 dark:hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 24% 78%, rgba(255,65,0,0.08) 0%, rgba(255,65,0,0.03) 28%, rgba(255,65,0,0) 54%),
              radial-gradient(circle at 82% 22%, rgba(255,65,0,0.04) 0%, rgba(255,65,0,0.015) 22%, rgba(255,65,0,0) 40%),
              linear-gradient(180deg, #fff8f4 0%, #fff8f4 100%)
            `,
          }}
        />
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={HERO_VIDEO_POSTER_LIGHT}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: `url(#${filterId})`, opacity: 0.22 }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-0 hidden dark:block">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 24% 78%, rgba(255,65,0,0.14) 0%, rgba(255,65,0,0.05) 26%, rgba(255,65,0,0) 54%),
              radial-gradient(circle at 82% 24%, rgba(255,65,0,0.08) 0%, rgba(255,65,0,0.02) 24%, rgba(255,65,0,0) 40%),
              linear-gradient(180deg, #040404 0%, #040404 100%)
            `,
          }}
        />

        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={HERO_VIDEO_POSTER_DARK}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: `url(#${filterId})`, opacity: 0.5 }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      </div>
    </>
  );
}
