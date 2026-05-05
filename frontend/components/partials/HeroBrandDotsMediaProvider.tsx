'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react'

// ---------------------------------------------------------------------------
// Simplex 2D noise — Stefan Gustavson's algorithm
// ---------------------------------------------------------------------------
const F2 = 0.5 * (Math.sqrt(3) - 1)
const G2 = (3 - Math.sqrt(3)) / 6
const GRAD3 = new Float32Array([
  1, 1, -1, 1, 1, -1, -1, -1,
  1, 0, -1, 0, 1, 0, -1, 0,
  0, 1, 0, -1, 0, 1, 0, -1,
])
const _raw = new Uint8Array(256)
for (let i = 0; i < 256; i++) _raw[i] = i
let _seed = 1234
for (let i = 255; i > 0; i--) {
  _seed = (_seed * 9301 + 49297) % 233280
  const j = Math.floor((_seed / 233280) * (i + 1))
  const tmp = _raw[i]; _raw[i] = _raw[j]; _raw[j] = tmp
}
const PERM = new Uint8Array(512)
for (let i = 0; i < 512; i++) PERM[i] = _raw[i & 255]

function simplex2(xin: number, yin: number): number {
  const sn = (xin + yin) * F2
  const i = Math.floor(xin + sn)
  const j = Math.floor(yin + sn)
  const tn = (i + j) * G2
  const x0 = xin - (i - tn), y0 = yin - (j - tn)
  const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1
  const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2
  const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2
  const ii = i & 255, jj = j & 255
  const gi0 = (PERM[ii + PERM[jj]] % 12) * 2
  const gi1 = (PERM[ii + i1 + PERM[jj + j1]] % 12) * 2
  const gi2 = (PERM[ii + 1 + PERM[jj + 1]] % 12) * 2
  let n0 = 0, n1 = 0, n2 = 0
  let t0 = 0.5 - x0 * x0 - y0 * y0
  if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * (GRAD3[gi0] * x0 + GRAD3[gi0 + 1] * y0) }
  let t1 = 0.5 - x1 * x1 - y1 * y1
  if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * (GRAD3[gi1] * x1 + GRAD3[gi1 + 1] * y1) }
  let t2 = 0.5 - x2 * x2 - y2 * y2
  if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * (GRAD3[gi2] * x2 + GRAD3[gi2 + 1] * y2) }
  return 70 * (n0 + n1 + n2)
}

// ---------------------------------------------------------------------------
// Wave configs — three independently animated layers composited on each frame
// ---------------------------------------------------------------------------
type WaveConfig = {
  gridSize: number
  dotMaxRadius: number
  noiseScale: number
  contrast: number
  minRadius: number
  waveStretch: number
  waveAngle: number  // radians
  speed: number
  alpha: number
}

const WAVES: WaveConfig[] = [
  {
    // Primary layer — organic blobs drifting south-west
    gridSize: 12,
    dotMaxRadius: 5.0,
    noiseScale: 0.0009,
    contrast: 5.0,
    minRadius: 0.4,
    waveStretch: 1.2,
    waveAngle: -0.4,
    speed: 0.08,
    alpha: 1.0,
  },
  {
    // Secondary layer — different drift direction, slower
    gridSize: 12,
    dotMaxRadius: 4.5,
    noiseScale: 0.0007,
    contrast: 5.0,
    minRadius: 0.35,
    waveStretch: 1.4,
    waveAngle: 0.9,
    speed: 0.05,
    alpha: 0.45,
  },
]

// ---------------------------------------------------------------------------
// Pre-computed per-wave stepping constants — derived once at module init
// ---------------------------------------------------------------------------
type WaveConst = WaveConfig & {
  xColStep: number   // x-noise increment per grid column
  yColStep: number   // y-noise increment per grid column
  xRowMul:  number   // x-noise at col 0 = py * xRowMul
  yRowMul:  number   // y-noise at col 0 = py * yRowMul + t
}
const WAVE_CONSTS: WaveConst[] = WAVES.map((w) => {
  const freqAlong  = w.noiseScale / w.waveStretch
  const freqAcross = w.noiseScale * w.waveStretch
  const cosA = Math.cos(w.waveAngle)
  const sinA = Math.sin(w.waveAngle)
  return {
    ...w,
    xColStep:  w.gridSize *  cosA * freqAlong,
    yColStep: -w.gridSize *  sinA * freqAcross,
    xRowMul:               sinA * freqAlong,
    yRowMul:               cosA * freqAcross,
  }
})

// ---------------------------------------------------------------------------
// Canvas registry types
// ---------------------------------------------------------------------------
type HeroBrandDotsMediaContextValue = {
  registerCanvas: (canvas: HTMLCanvasElement) => () => void
}

const HeroBrandDotsMediaContext = createContext<HeroBrandDotsMediaContextValue | null>(null)

type RegisteredCanvas = {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
}

// ---------------------------------------------------------------------------
// Per-canvas drawing helpers
// ---------------------------------------------------------------------------
function syncCanvasSize(reg: RegisteredCanvas): {width: number; height: number} {
  // Dimensions are kept current by ResizeObserver in HeroBrandDotsCanvas.
  return {width: Math.max(1, reg.canvas.width), height: Math.max(1, reg.canvas.height)}
}

function drawWave(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  wave: WaveConst,
  t: number,
) {
  const {gridSize, dotMaxRadius, minRadius, alpha, xColStep, yColStep, xRowMul, yRowMul} = wave
  const cols = Math.ceil(width / gridSize) + 1
  const rows = Math.ceil(height / gridSize) + 1

  ctx.globalAlpha = alpha
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()

  for (let row = 0; row < rows; row++) {
    const py = row * gridSize
    let xFreq = py * xRowMul
    let yFreq = py * yRowMul + t
    for (let col = 0; col < cols; col++) {
      const n = simplex2(xFreq, yFreq)
      const v = Math.max(0, (n + 1) * 0.5)
      const v2 = v * v
      const r = dotMaxRadius * (v2 * v2 * v)  // contrast = 5 → v^5, avoids Math.pow
      if (r >= minRadius) {
        const px = col * gridSize
        ctx.moveTo(px + r, py)
        ctx.arc(px, py, r, 0, Math.PI * 2)
      }
      xFreq += xColStep
      yFreq += yColStep
    }
  }

  ctx.fill()
  ctx.globalAlpha = 1
}

function drawAllWaves(registrations: Set<RegisteredCanvas>, waveTimes: number[]) {
  for (const reg of registrations) {
    const {width, height} = syncCanvasSize(reg)
    const ctx = reg.context
    ctx.clearRect(0, 0, width, height)
    for (let i = 0; i < WAVE_CONSTS.length; i++) {
      drawWave(ctx, width, height, WAVE_CONSTS[i], waveTimes[i])
    }
  }
}

// ---------------------------------------------------------------------------
// Provider — owns the animation loop and canvas registry
// ---------------------------------------------------------------------------
export function HeroBrandDotsMediaProvider({children}: {children: ReactNode}) {
  const registrationsRef = useRef<Set<RegisteredCanvas>>(new Set())
  const frameHandleRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const lastDrawRef = useRef<number>(0)
  const waveTimesRef = useRef<number[]>(WAVE_CONSTS.map(() => 0))

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const DRAW_INTERVAL = 1000 / 30  // cap redraws at 30 fps

    function tick(now: number) {
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000)
      lastTimeRef.current = now
      for (let i = 0; i < WAVE_CONSTS.length; i++) {
        waveTimesRef.current[i] += WAVE_CONSTS[i].speed * dt
      }
      if (registrationsRef.current.size > 0 && now - lastDrawRef.current >= DRAW_INTERVAL) {
        lastDrawRef.current = now
        drawAllWaves(registrationsRef.current, waveTimesRef.current)
      }
      frameHandleRef.current = requestAnimationFrame(tick)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        lastTimeRef.current = performance.now()
        if (frameHandleRef.current === null && !reducedMotion) {
          frameHandleRef.current = requestAnimationFrame(tick)
        }
      } else {
        if (frameHandleRef.current !== null) {
          cancelAnimationFrame(frameHandleRef.current)
          frameHandleRef.current = null
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    lastTimeRef.current = performance.now()

    if (reducedMotion) {
      drawAllWaves(registrationsRef.current, waveTimesRef.current)
    } else {
      frameHandleRef.current = requestAnimationFrame(tick)
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (frameHandleRef.current !== null) {
        cancelAnimationFrame(frameHandleRef.current)
        frameHandleRef.current = null
      }
    }
  }, [])

  const contextValue: HeroBrandDotsMediaContextValue = {
    registerCanvas(canvas) {
      const context = canvas.getContext('2d', {alpha: true})
      if (!context) return () => undefined

      // Set initial buffer size (ResizeObserver handles subsequent resizes)
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width  = Math.max(1, Math.round(rect.width  * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      const registration: RegisteredCanvas = {canvas, context}
      registrationsRef.current.add(registration)
      drawAllWaves(registrationsRef.current, waveTimesRef.current)

      return () => {
        registrationsRef.current.delete(registration)
      }
    },
  }

  return (
    <HeroBrandDotsMediaContext.Provider value={contextValue}>
      {children}
    </HeroBrandDotsMediaContext.Provider>
  )
}

export function HeroBrandDotsCanvas({className, style}: {className?: string; style?: CSSProperties}) {
  const context = useContext(HeroBrandDotsMediaContext)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!context || !canvas) return

    let unregister: (() => void) | undefined

    // Keep canvas buffer dimensions current without touching the draw hot-path
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width  = Math.max(1, Math.round(entry.contentRect.width  * dpr))
      canvas.height = Math.max(1, Math.round(entry.contentRect.height * dpr))
    })
    resizeObserver.observe(canvas)

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!unregister) unregister = context.registerCanvas(canvas)
          } else {
            unregister?.()
            unregister = undefined
          }
        }
      },
      {threshold: 0},
    )
    intersectionObserver.observe(canvas)

    return () => {
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      unregister?.()
    }
  }, [context])

  return <canvas ref={canvasRef} aria-hidden="true" className={className} style={style} />
}
