/**
 * Next.js instrumentation — runs once when the server process boots.
 * SEC-3: enforce the production environment guard (Upstash required, no
 * localhost site URL, real Sanity tokens) at startup. The guard itself is a
 * no-op outside production.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { throwIfProductionEnvInvalid } = await import("@/lib/validate-env");
    throwIfProductionEnvInvalid();
  }
}
