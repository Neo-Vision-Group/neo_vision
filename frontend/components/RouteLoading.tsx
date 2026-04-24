export function RouteLoading({label = 'Loading page'}: {label?: string}) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand">{label}</p>
      <div className="flex items-center gap-2" aria-hidden="true">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand [animation-delay:0ms]" />
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand/70 [animation-delay:150ms]" />
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand/40 [animation-delay:300ms]" />
      </div>
      <p className="max-w-[48ch] text-body text-foreground/65">
        We&apos;re fetching content and preparing the next section.
      </p>
    </main>
  )
}
