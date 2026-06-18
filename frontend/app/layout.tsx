import './globals.css'
import { Analytics } from "@vercel/analytics/next"
import { GoogleAnalytics } from '@next/third-parties/google';
import {SpeedInsights} from '@vercel/speed-insights/next'
import type {Metadata, Viewport} from 'next'
import {Inter, IBM_Plex_Mono, Funnel_Display} from 'next/font/google'
import localFont from 'next/font/local'
import {draftMode, headers} from 'next/headers'
import {toPlainText} from 'next-sanity'
import {VisualEditing} from 'next-sanity/visual-editing'
import {Toaster} from 'sonner'
import {resolveSiteOrigin} from '@/app/site-origin'
import {handleError} from '@/app/client-utils'
import Footer from '@/components/layout/Footer'
import {IntroVisitMarker} from '@/components/IntroVisitMarker'
import {FirstLoadIntroGate} from '@/components/partials/FirstLoadIntro'
import CookieBanner from '@/components/partials/CookieBanner'
import DraftModeToast from '@/components/partials/DraftModeToast'
import {HeroBrandDotsMediaProvider} from '@/components/partials/HeroBrandDotsMediaProvider'
import {HeroBrandDotsBackground} from '@/components/partials/HeroBrandDotsBackground'
import LenisProvider from '@/components/partials/motion/lenis-provider'
import Nav from '@/components/layout/Nav'
import {StructuredDataScript} from '@/components/seo/StructuredDataScript'
import {ScrollToTopOnNavigate} from '@/components/ScrollToTopOnNavigate'
import {TransitionProvider} from '@/components/transition/TransitionProvider'
import {ThemeProvider} from '@/components/partials/theme/theme-provider'
import {SanityLive} from '@/sanity/lib/live'
import {buildGlobalMetadata, buildGlobalStructuredData, getGlobalSeoData} from '@/sanity/lib/seo'
import {ConsentAwarePlausible} from '@/components/partials/ConsentAwarePlausible'

export async function generateMetadata(): Promise<Metadata> {
  const origin = await resolveSiteOrigin()
  const {siteSettings, seoSettings} = await getGlobalSeoData()

  return buildGlobalMetadata({
    origin,
    siteSettings,
    seoSettings,
    fallbackTitle: siteSettings?.title || 'Neo Vision',
    fallbackDescription: siteSettings?.description
      ? toPlainText(siteSettings.description) : 'AI-native engineering and transformation for companies that need working systems, not slide decks. We embed in your business, prove ROI, then scale it.'
  })
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
})

const funnelDisplay = Funnel_Display({
  variable: '--font-funnel-display',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

const betatron = localFont({
  src: './fonts/betatron.woff2',
  variable: '--font-betatron',
  display: 'swap',
  preload: true,
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
})

const clashDisplay = localFont({
  src: './fonts/ClashDisplay-Variable.woff2',
  variable: '--font-clash-display',
  display: 'swap',
  preload: true,
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const {isEnabled: isDraftMode} = await draftMode()
  const nonce = (await headers()).get('x-nonce') ?? undefined
  const origin = await resolveSiteOrigin()
  const {siteSettings, seoSettings} = await getGlobalSeoData()
  const globalStructuredData = buildGlobalStructuredData({
    origin,
    siteSettings,
    seoSettings,
  })

  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexMono.variable} ${funnelDisplay.variable} ${betatron.variable} ${clashDisplay.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  // Default to dark mode unless user explicitly chose light
                  var resolvedTheme = theme || 'dark';
                  if (resolvedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // Fallback to dark mode on error
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="overflow-x-clip">
        <Analytics />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
        <SpeedInsights />
        <ConsentAwarePlausible>
          <StructuredDataScript nodes={globalStructuredData} />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
            enableColorScheme={false}
          >
          <HeroBrandDotsMediaProvider>
            {/* Global hero background - visible behind any transparent hero section */}
            <div className="fixed inset-0 -z-10">
              <HeroBrandDotsBackground />
            </div>
            <FirstLoadIntroGate />
            <LenisProvider>
              <TransitionProvider>
                <ScrollToTopOnNavigate />
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                >
                  Skip to main content
                </a>
                <section className="min-h-screen overflow-x-clip bg-transparent">
                  {/* The <Toaster> component is responsible for rendering toast notifications used in /app/client-utils.ts and /app/components/DraftModeToast.tsx */}
                  <Toaster />
                  {isDraftMode && (
                    <>
                      <DraftModeToast />
                      {/*  Enable Visual Editing, only to be rendered when Draft Mode is enabled */}
                      <VisualEditing />
                    </>
                  )}
                  {/* The <SanityLive> component is responsible for making all sanityFetch calls in your application live, so should always be rendered. */}
                  <SanityLive onError={handleError} />
                  <Nav />
                  <div id="page-content" className="transition-opacity duration-500">
                    <main id="main-content" className="min-h-screen pt-16 lg:pt-20">
                      {children}
                      <IntroVisitMarker />
                    </main>
                    <Footer />
                  </div>
                  <CookieBanner settings={siteSettings?.cookieSettings} />
                </section>
              </TransitionProvider>
            </LenisProvider>
          </HeroBrandDotsMediaProvider>
        </ThemeProvider>
        <SpeedInsights />
        </ConsentAwarePlausible>
      </body>
    </html>
  )
}
