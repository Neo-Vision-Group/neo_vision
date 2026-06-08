import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const alt = 'Neo Vision Technologies'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255, 0, 0, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 0, 0, 0.1) 0%, transparent 50%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="184" height="112" viewBox="0 0 46 28" fill="none">
            <path d="M0 4.15624C0 3.88434 0.11653 3.61244 0.310747 3.37938L3.34053 0.388434C3.57359 0.155374 3.92318 0 4.27277 0C4.62237 0 4.97196 0.155374 5.20502 0.388434L17.0134 12.158L14.5663 14.5663L3.53475 3.53475V27.1904H0V4.15624ZM18.2952 27.1904V0H21.83V27.1904H18.2952Z" fill="#efefef"/>
            <path d="M28.6998 27.5788C28.3114 27.5788 28.0006 27.4234 27.7287 27.1904L24.7378 24.1994C24.5436 23.9664 24.427 23.6945 24.427 23.4226V0.388434H27.9618V24.0052L41.7512 10.177V0.388434H45.2859V9.4001C45.2859 10.7596 44.781 12.0415 43.8099 12.9737L29.6321 27.1904C29.3601 27.4234 29.0494 27.5788 28.6998 27.5788Z" fill="#FF4100"/>
          </svg>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.02em',
              textAlign: 'center',
              maxWidth: '900px',
              padding: '0 40px',
            }}
          >
            Neo Vision Technologies
          </div>
          <div
            style={{
              fontSize: 26,
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              maxWidth: '800px',
              padding: '0 40px',
              lineHeight: 1.4,
            }}
          >
            AI-native engineering and transformation for companies that need working systems, not slide decks
          </div>
          <div
            style={{
              marginTop: '12px',
              fontSize: 18,
              color: '#FF4100',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            We embed · We prove ROI · We scale
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
