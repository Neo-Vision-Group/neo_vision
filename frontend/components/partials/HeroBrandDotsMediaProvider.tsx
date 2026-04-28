'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type MutableRefObject,
  type CSSProperties,
  type ReactNode,
} from 'react'

type HeroBrandDotsMediaContextValue = {
  registerCanvas: (canvas: HTMLCanvasElement) => () => void
}

const HeroBrandDotsMediaContext = createContext<HeroBrandDotsMediaContextValue | null>(null)

type RegisteredCanvas = {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
}

function syncCanvasSize(registration: RegisteredCanvas) {
  const {canvas} = registration
  const rect = canvas.getBoundingClientRect()
  const nextWidth = Math.max(1, Math.round(rect.width * window.devicePixelRatio))
  const nextHeight = Math.max(1, Math.round(rect.height * window.devicePixelRatio))

  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth
    canvas.height = nextHeight
  }
}

function drawFrame(
  registrationsRef: MutableRefObject<Set<RegisteredCanvas>>,
  video: HTMLVideoElement,
) {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth < 1 || video.videoHeight < 1) {
    return
  }

  for (const registration of registrationsRef.current) {
    syncCanvasSize(registration)
    registration.context.clearRect(0, 0, registration.canvas.width, registration.canvas.height)
    registration.context.drawImage(video, 0, 0, registration.canvas.width, registration.canvas.height)
  }
}

function scheduleFrameLoop(
  video: HTMLVideoElement,
  registrationsRef: MutableRefObject<Set<RegisteredCanvas>>,
  frameHandleRef: MutableRefObject<number | null>,
) {
  if (!registrationsRef.current.size) {
    frameHandleRef.current = null
    return
  }

  drawFrame(registrationsRef, video)

  if ('requestVideoFrameCallback' in video) {
    frameHandleRef.current = (
      video as HTMLVideoElement & {
        requestVideoFrameCallback: (callback: () => void) => number
      }
    ).requestVideoFrameCallback(() => {
      scheduleFrameLoop(video, registrationsRef, frameHandleRef)
    })
    return
  }

  frameHandleRef.current = window.requestAnimationFrame(() => {
    scheduleFrameLoop(video, registrationsRef, frameHandleRef)
  })
}

function cancelFrameLoop(
  video: HTMLVideoElement,
  frameHandleRef: MutableRefObject<number | null>,
) {
  if (frameHandleRef.current === null) {
    return
  }

  if ('cancelVideoFrameCallback' in video && 'requestVideoFrameCallback' in video) {
    ;(
      video as HTMLVideoElement & {
        cancelVideoFrameCallback: (handle: number) => void
      }
    ).cancelVideoFrameCallback(frameHandleRef.current)
  } else {
    window.cancelAnimationFrame(frameHandleRef.current)
  }

  frameHandleRef.current = null
}

export function HeroBrandDotsMediaProvider({children}: {children: ReactNode}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const registrationsRef = useRef<Set<RegisteredCanvas>>(new Set())
  const frameHandleRef = useRef<number | null>(null)
  useEffect(() => {
    const video = videoRef.current

    if (!video) {
      return
    }

    const restartLoop = () => {
      cancelFrameLoop(video, frameHandleRef)
      scheduleFrameLoop(video, registrationsRef, frameHandleRef)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void video.play().catch(() => undefined)
        restartLoop()
        return
      }

      cancelFrameLoop(video, frameHandleRef)
    }

    void video.play().catch(() => undefined)
    video.addEventListener('loadeddata', restartLoop)
    video.addEventListener('play', restartLoop)
    window.addEventListener('resize', restartLoop)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelFrameLoop(video, frameHandleRef)
      video.removeEventListener('loadeddata', restartLoop)
      video.removeEventListener('play', restartLoop)
      window.removeEventListener('resize', restartLoop)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const contextValue: HeroBrandDotsMediaContextValue = {
    registerCanvas(canvas) {
      const context = canvas.getContext('2d', {alpha: true})

      if (!context) {
        return () => undefined
      }

      const registration = {canvas, context}
      registrationsRef.current.add(registration)

      const video = videoRef.current
      if (video) {
        drawFrame(registrationsRef, video)
        if (frameHandleRef.current === null) {
          scheduleFrameLoop(video, registrationsRef, frameHandleRef)
        }
      }

      return () => {
        registrationsRef.current.delete(registration)

        if (!registrationsRef.current.size && videoRef.current) {
          cancelFrameLoop(videoRef.current, frameHandleRef)
        }
      }
    },
  }

  return (
    <HeroBrandDotsMediaContext.Provider value={contextValue}>
      {children}
      <video
        ref={videoRef}
        aria-hidden="true"
        autoPlay
        className="pointer-events-none fixed -left-2 -top-2 h-px w-px opacity-0"
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
    </HeroBrandDotsMediaContext.Provider>
  )
}

export function HeroBrandDotsCanvas({className, style}: {className?: string; style?: CSSProperties}) {
  const context = useContext(HeroBrandDotsMediaContext)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!context || !canvasRef.current) {
      return
    }

    return context.registerCanvas(canvasRef.current)
  }, [context])

  return <canvas ref={canvasRef} aria-hidden="true" className={className} style={style} />
}
