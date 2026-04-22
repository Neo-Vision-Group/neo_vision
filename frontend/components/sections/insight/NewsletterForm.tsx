"use client";

import { useState } from "react";
import { Button } from "@/components/partials/Button";

/**
 * Newsletter subscribe form — posts to /api/newsletter. Used on the
 * Insight post page in the "Liked this? Get the newsletter." block.
 */
export function NewsletterForm({ source }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "submitting") return;
    setState("submitting");
    setMessage(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source: source ?? "/insights" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setState("ok");
      setMessage("You're on the list. Thanks.");
      setEmail("");
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row md:items-center">
      <label className="flex-1">
        <span className="sr-only">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@work.com"
          className="w-full border border-border bg-background px-4 py-3 text-body text-foreground placeholder:text-foreground/40 focus:border-brand focus:outline-none"
        />
      </label>
      <Button
        type="submit"
        variant="primary"
        disabled={state === "submitting"}
      >
        {state === "submitting" ? "Subscribing…" : "Subscribe"}
      </Button>
      {message ? (
        <p
          role="status"
          aria-live="polite"
          className={`text-body-2 ${state === "error" ? "text-brand" : "text-foreground/70"}`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
