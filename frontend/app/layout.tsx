import './globals.css'

import {SpeedInsights} from '@vercel/speed-insights/next'
import type {Metadata} from 'next'
import {Inter, IBM_Plex_Mono, Funnel_Display} from 'next/font/google'
import localFont from 'next/font/local'
import {draftMode} from 'next/headers'
import {toPlainText} from 'next-sanity'
import {VisualEditing} from 'next-sanity/visual-editing'
import {Toaster} from 'sonner'
import {handleError} from '@/app/client-utils'
import Footer from '@/components/layout/Footer'
import {IntroVisitMarker} from '@/components/IntroVisitMarker'
import CookieBanner from '@/components/partials/CookieBanner'
import DraftModeToast from '@/components/partials/DraftModeToast'
import LenisProvider from '@/components/partials/motion/lenis-provider'
import Nav from '@/components/layout/Nav'
import {ScrollToTopOnNavigate} from '@/components/ScrollToTopOnNavigate'
import {TransitionProvider} from '@/components/transition/TransitionProvider'
import * as demo from '@/sanity/lib/demo'
import {ThemeProvider} from '@/components/partials/theme/theme-provider'
import {sanityFetch, SanityLive} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import PlausibleProvider from 'next-plausible'

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(): Promise<Metadata> {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
    // Metadata should never contain stega
    stega: false,
  })
  const title = settings?.title || demo.title
  const description = settings?.description || demo.description

  // const ogImage = resolveOpenGraphImage(settings?.ogImage)
  let metadataBase: URL | undefined = undefined
  try {
    metadataBase = settings?.ogImage?.metadataBase
      ? new URL(settings.ogImage.metadataBase)
      : undefined
  } catch {
    // ignore
  }
  return {
    metadataBase,
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description: toPlainText(description),
    // openGraph: {
    //   images: ogImage ? [ogImage] : [],
    // },
  }
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
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexMono.variable} ${funnelDisplay.variable} ${betatron.variable} bg-white text-black`}
    >
      <head>
        <PlausibleProvider
          src={process.env.PLAUSIBLE_DOMAIN || 'localhost'}
          enabled={process.env.NODE_ENV === 'production'}
        />
      </head>
      <body className="overflow-x-clip">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LenisProvider>
            <TransitionProvider>
              <ScrollToTopOnNavigate />
              <section className="min-h-screen overflow-x-clip bg-white dark:bg-black">
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
                <main className="">
                  {children}
                  <IntroVisitMarker />
                </main>
                <Footer />
                <CookieBanner settings={settings?.cookieSettings} />
              </section>
            </TransitionProvider>
          </LenisProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
