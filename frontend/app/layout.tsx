import './globals.css'

import {SpeedInsights} from '@vercel/speed-insights/next'
import type {Metadata} from 'next'
import {Inter, IBM_Plex_Mono, Funnel_Display} from 'next/font/google'
import localFont from 'next/font/local'
import {draftMode} from 'next/headers'
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
import * as demo from '@/sanity/lib/demo'
import {ThemeProvider} from '@/components/partials/theme/theme-provider'
import {SanityLive} from '@/sanity/lib/live'
import {buildGlobalMetadata, buildGlobalStructuredData, getGlobalSeoData} from '@/sanity/lib/seo'
import PlausibleProvider from 'next-plausible'

export async function generateMetadata(): Promise<Metadata> {
  const origin = await resolveSiteOrigin()
  const {siteSettings, seoSettings} = await getGlobalSeoData()

  return buildGlobalMetadata({
    origin,
    siteSettings,
    seoSettings,
    fallbackTitle: siteSettings?.title || demo.title,
    fallbackDescription: siteSettings?.description
      ? toPlainText(siteSettings.description)
      : toPlainText(demo.description),
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
  preload: false,
})

const openingHoursMono = localFont({
  src: './fonts/opening-hours-mono.woff2',
  variable: '--font-opening-hours-mono',
  display: 'swap',
  preload: false,
})

const betatron = localFont({
  src: './fonts/betatron.woff2',
  variable: '--font-betatron',
  display: 'swap',
  preload: false,
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
})

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const {isEnabled: isDraftMode} = await draftMode()
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
      className={`${inter.variable} ${ibmPlexMono.variable} ${funnelDisplay.variable} ${betatron.variable} ${openingHoursMono.variable} bg-white text-black`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var resolvedTheme = theme || systemTheme;
                  if (resolvedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="overflow-x-clip">
        <PlausibleProvider
          src={process.env.PLAUSIBLE_SCRIPT_URL}
          enabled={process.env.NODE_ENV === 'production'}
          init={{
            captureOnLocalhost: false,
          }}
        >
          <StructuredDataScript nodes={globalStructuredData} />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
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
                  <main className="transition-opacity min-h-screen duration-500">
                    {children}
                    <IntroVisitMarker />
                  </main>
                  <Footer />
                  <CookieBanner settings={siteSettings?.cookieSettings} />
                </section>
              </TransitionProvider>
            </LenisProvider>
          </HeroBrandDotsMediaProvider>
        </ThemeProvider>
        <SpeedInsights />
        </PlausibleProvider>
      </body>
    </html>
  )
}
