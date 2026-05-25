import {
  Space_Grotesk,
  VT323,
  IBM_Plex_Mono,
  Share_Tech_Mono,
  Press_Start_2P,
} from 'next/font/google'
import type { ReactNode } from 'react'

const adaDisplay = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--ada-display',
  display: 'swap',
})

const adaPlex = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--ada-plex',
  display: 'swap',
})

const adaShare = Share_Tech_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--ada-share',
  display: 'swap',
})

const adaPixel = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--ada-pixel',
  display: 'swap',
})

const adaVt = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--ada-vt',
  display: 'swap',
})

export default function TerminalLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${adaDisplay.variable} ${adaPlex.variable} ${adaShare.variable} ${adaPixel.variable} ${adaVt.variable}`}
    >
      {children}
    </div>
  )
}
