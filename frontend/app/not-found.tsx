import {HeroBrandDotsBackground} from '@/components/partials/HeroBrandDotsBackground'

export default function NotFound() {
  return (
    <section className="relative isolate overflow-hidden bg-white text-black dark:bg-background dark:text-white">
      <HeroBrandDotsBackground />

      <div className="relative mx-auto flex min-h-[calc(100svh-68px)] w-full max-w-[1600px] flex-col justify-center gap-12 px-6 py-16 sm:px-10 lg:flex-row lg:items-center lg:gap-16 lg:px-12 lg:py-24">
        <div className="w-full max-w-[420px] shrink-0">
          <div className="inline-flex items-center justify-center bg-[rgba(255,65,0,0.2)] px-2.5 py-1 font-funnel text-lg leading-[1.5] text-black dark:bg-[rgba(255,65,0,0.3)] dark:text-white">
            404 error
          </div>

          <div className="mt-2 space-y-6">
            <h1 className="font-funnel text-5xl leading-[1.08] tracking-[-1px] text-black md:text-6xl lg:text-[clamp(3.5rem,4vw,5rem)] dark:text-white">
              Page not found
            </h1>
            <p className="max-w-[28rem] font-funnel text-lg leading-[1.5] text-black/80 dark:text-white/78">
              The page you are looking for doesn&apos;t exist or has been moved.
            </p>
          </div>
        </div>

        <div className="relative flex min-w-0 flex-1 items-center justify-center">
          <div
            aria-hidden="true"
            className="font-betatron select-none text-brand text-[clamp(8rem,25vw,24rem)] leading-none tracking-[0.04em] drop-shadow-[0_0_32px_rgba(255,65,0,0.12)]"
          >
            404
          </div>
        </div>
      </div>
    </section>
  )
}
