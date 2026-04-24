"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error] Route render failed.", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand">Something broke</p>
      <h1 className="max-w-[16ch] text-4xl font-medium text-foreground">This page failed to render.</h1>
      <p className="max-w-[56ch] text-body text-foreground/70">
        We hit an unexpected rendering error. You can retry this route without leaving the app.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center justify-center border border-foreground px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
      >
        Try again
      </button>
    </main>
  );
}
