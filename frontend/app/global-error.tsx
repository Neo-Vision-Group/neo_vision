"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your error reporting service here
    console.error("[app/global-error] Catastrophic application error", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-6 py-16 text-center">
          <div className="max-w-2xl space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-500">
              Critical Error
            </p>
            <h1 className="text-4xl font-bold text-white md:text-6xl">
              Something went wrong
            </h1>
            <p className="text-lg text-white/70">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            {error.digest && (
              <p className="font-mono text-xs text-white/50">
                Error ID: {error.digest}
              </p>
            )}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center border border-white bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-white/90"
              >
                Try again
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center border border-white px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black"
              >
                Go to homepage
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
