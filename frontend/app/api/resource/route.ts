import { validateCsrfToken } from "@/lib/csrf";
import { NextRequest, NextResponse } from "next/server";
import getIP from "@/lib/getIP";
import { rateLimit } from "@/lib/rate-limit";
import { checkResourceRequestRateLimit } from "@/lib/rate-limit-upstash";
import { logSecurityEvent } from "@/lib/security-logger";
import { resourceRequestSchema } from "@/lib/resourceRequestSchema";
import { sanityWriteClient } from "@/sanity/lib/write-client";
import { client } from "@/sanity/lib/client";
import { resourceByKeyQuery } from "@/sanity/lib/queries";
import { getPostHogClient } from "@/lib/posthog-server";
import { Resend } from "resend";
import { ResourceRequestNotification } from "@/components/emails/ResourceRequestNotification";

type ResolvedResource = {
  title?: string | null;
  externalLink?: string | null;
  askForEmail?: boolean | null;
  fileUrl?: string | null;
} | null;

function toHostname(value?: string | null): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed).hostname;
  } catch {
    try {
      return new URL(`https://${trimmed}`).hostname;
    } catch {
      return null;
    }
  }
}

export async function POST(req: NextRequest) {
    let rateLimitResult;

    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const ip = getIP(req);
      rateLimitResult = await checkResourceRequestRateLimit(ip);
    } else {
      if (process.env.NODE_ENV === "development") {
        console.warn("[api/resource] Upstash Redis not configured, using in-memory rate limiter (not production-safe)");
      }
      rateLimitResult = await rateLimit(req, {
        interval: 15 * 60 * 1000,
        uniqueTokenPerInterval: 5,
      });
    }

    if (!rateLimitResult.success) {
    logSecurityEvent(req, "blocked", "Rate limit exceeded");
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { 
        status: 429,
        headers: {
          "Retry-After": rateLimitResult.reset.toString(),
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.reset.toString(),
        },
      }
    );
    }

    // CSRF protection
    const csrfValid = await validateCsrfToken(req);
    if (!csrfValid) {
    logSecurityEvent(req, "blocked", "CSRF token validation failed");
    return NextResponse.json(
      { ok: false, error: "Invalid request. Please refresh the page and try again." },
      { status: 403 }
    );
    }
    // Origin validation (both Origin AND Referer must match)
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');

    let allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    ...(process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || []),
    ].filter(Boolean);

    // SEC-7: in production, do not merely log a configured localhost origin —
    // drop it so it can never satisfy origin/referer validation.
    if (process.env.NODE_ENV === 'production') {
    const beforeCount = allowedOrigins.length;
    allowedOrigins = allowedOrigins.filter(o => !o.includes('localhost') && !o.includes('127.0.0.1'));
    if (allowedOrigins.length !== beforeCount) {
      logSecurityEvent(req, "blocked", "Localhost origin configured in production (ignored)");
    }
    }

    // Require both Origin AND Referer in production
    if (!origin || !referer) {
    logSecurityEvent(req, "blocked", "Missing origin or referer header");
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 403 }
    );
    }

    // SEC-5: malformed Origin/Referer (or a malformed ALLOWED_ORIGINS entry) must
    // yield a clean 403, never an unhandled exception (500).
    const safeHostname = (value: string): string | null => {
    try {
      return new URL(value).hostname;
    } catch {
      return null;
    }
    };

    const originHostname = safeHostname(origin);
    const refererHostname = safeHostname(referer);
    const allowedHostnames = allowedOrigins
    .map(safeHostname)
    .filter((h): h is string => h !== null);

    const originAllowed = originHostname !== null && allowedHostnames.includes(originHostname);
    const refererAllowed = refererHostname !== null && allowedHostnames.includes(refererHostname);

    if (!originAllowed || !refererAllowed) {
    logSecurityEvent(req, "blocked", "Origin/Referer validation failed", {
      origin,
      referer,
    });
    return NextResponse.json(
      { ok: false, error: "Invalid request origin." },
      { status: 403 }
    );
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      logSecurityEvent(req, "blocked", "Invalid JSON body");
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const parsed = resourceRequestSchema.safeParse(body);

    if (!parsed.success) {
      logSecurityEvent(req, "failure", "Validation failed", {
        fieldCount: Object.keys(parsed.error.flatten().fieldErrors).length,
      });
      return NextResponse.json(
        {
          ok: false,
          error: "Validation failed.",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Honeypot — silently accept + drop
    if (data.website && data.website.length > 0) {
      logSecurityEvent(req, "blocked", "Honeypot triggered");
      return NextResponse.json({ ok: true });
    }

    const receivedAt = new Date().toISOString();

    const correlationId = logSecurityEvent(req, "success", "Resource request submitted");

    // SEC-1: re-resolve the requested resource server-side from the CMS using the
    // hosting page slug + item key. We never trust any client-supplied URL.
    let resolvedResource: ResolvedResource = null;
    try {
      resolvedResource = await client.fetch<ResolvedResource>(
        resourceByKeyQuery,
        { pageSlug: data.pageSlug, itemKey: data.itemKey },
        { stega: false }
      );
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("[api/resource] Resource lookup failed", err);
      }
    }

    if (!resolvedResource || resolvedResource.askForEmail !== true) {
      logSecurityEvent(req, "blocked", "Unknown or non-emailable resource requested", { correlationId });
      return NextResponse.json(
        { ok: false, error: "Requested resource is not available." },
        { status: 400 }
      );
    }

    const resourceTitle = resolvedResource.title?.trim() || "resource";
    const isFileDownload = !!resolvedResource.fileUrl;

    // Host-allowlist the resolved URL (defense-in-depth). File attachments must be
    // fetched from the Sanity CDN; external links must be valid http(s) URLs.
    const parseHttpUrl = (value?: string | null): URL | null => {
    if (!value) return null;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:" ? url : null;
    } catch {
      return null;
    }
    };

    let resolvedUrl: string | undefined;
    if (isFileDownload) {
    const parsed = parseHttpUrl(resolvedResource.fileUrl);
    if (!parsed || parsed.hostname !== "cdn.sanity.io") {
      logSecurityEvent(req, "blocked", "Resolved file URL failed host allowlist", { correlationId });
      return NextResponse.json(
        { ok: false, error: "Requested resource is not available." },
        { status: 400 }
      );
    }
    resolvedUrl = parsed.toString();
    } else {
    const parsed = parseHttpUrl(resolvedResource.externalLink);
    const allowedExternalHosts = new Set(
      [
        process.env.NEXT_PUBLIC_SITE_URL,
        process.env.SITE_URL,
        ...(process.env.ALLOWED_ORIGINS?.split(",") ?? []),
        ...(process.env.ALLOWED_RESOURCE_HOSTS?.split(",") ?? []),
      ]
        .map(toHostname)
        .filter((hostname): hostname is string => hostname !== null)
    );

    if (!parsed) {
      logSecurityEvent(req, "blocked", "Resolved external URL invalid", { correlationId });
      return NextResponse.json(
        { ok: false, error: "Requested resource is not available." },
        { status: 400 }
      );
    }
    if (!allowedExternalHosts.has(parsed.hostname)) {
      logSecurityEvent(req, "blocked", "Resolved external URL failed host allowlist", {
        correlationId,
      });
      return NextResponse.json(
        { ok: false, error: "Requested resource is not available." },
        { status: 400 }
      );
    }
    resolvedUrl = parsed.toString();
    }

    // Validate Sanity write token is configured
    if (!process.env.SANITY_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN === 'your_write_token') {
    logSecurityEvent(req, "failure", "SANITY_WRITE_TOKEN not configured", { correlationId });
    if (process.env.NODE_ENV === "development") {
      console.error("[api/resource] SANITY_WRITE_TOKEN not configured");
    }
    return NextResponse.json(
      {
        ok: false,
        error: "Service configuration error. Please contact support.",
      },
      { status: 500 }
    );
    }

    try {
      const writeClient = sanityWriteClient();

      // SEC-8: store raw, Zod-validated values; rely on React/Sanity output
      // encoding at render time instead of double-escaping into storage.
      const writePromise = writeClient.create({
          _type: "resourceRequest",
          email: data.email,
          resourceRequested: resourceTitle,
          receivedAt,
      });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Sanity write timeout")), 10000)
      );

      await Promise.race([writePromise, timeoutPromise]);
    } catch (err) {
      logSecurityEvent(req, "failure", "Sanity write failed", { correlationId });
      if (process.env.NODE_ENV === "development") {
        console.error("[api/resource] Sanity write failed", err);
      }
      return NextResponse.json(
        {
          ok: false,
          error: "Unable to process your request. Please try again later.",
        },
        { status: 500 }
      );
    }

    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                    req.headers.get("x-real-ip") || 
                    "unknown";
        const userAgent = req.headers.get("user-agent") || "unknown";
        const distinctId = `${ip}-${Buffer.from(userAgent).toString("base64").substring(0, 16)}`;
        
        const posthog = getPostHogClient();
        posthog.capture({
        distinctId,
        event: "resource_requested",
        // SEC-6: do not send PII (email) or free-text to analytics.
        properties: {
            resource_key: data.itemKey,
            receivedAt,
            correlation_id: correlationId,
        },
        });
        await posthog.shutdown();
    } catch (err) {
        if (process.env.NODE_ENV === "development") {
        console.error("[api/resource] PostHog tracking failed", err);
        }
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
        try {
        const resend = new Resend(resendKey);
        const from = process.env.RESEND_FROM || "onboarding@resend.dev";
        const to = process.env.CONTACT_TO || "nvt.dev@neovision.dev";
        
        if (process.env.NODE_ENV === "development") {
            console.log("[api/resource] Sending notification email from:", from, "to:", to);
        }
        
        const notificationResult = await resend.emails.send({
                from,
                to,
                replyTo: data.email,
                subject: `Your requested material is provided below!`,
                react: ResourceRequestNotification({
                    email: data.email,
                    resourceRequested: resourceTitle,
                    receivedAt,
                    asFile: isFileDownload,
                    url: resolvedUrl,
            }),
        });

        if (process.env.NODE_ENV === "development") {
            console.log("[api/resource] Notification email sent:", notificationResult);
            console.log("[api/resource] Sending confirmation email to:", data.email);
        }

        const confirmationResult = await resend.emails.send({
            from,
            to: data.email,
            subject: `Thanks for reaching out to Neo Vision!`,
            react: ResourceRequestNotification({
                    email: data.email,
                    resourceRequested: resourceTitle,
                    receivedAt,
                    asFile: isFileDownload,
                    url: resolvedUrl,
                    forClient: true,
                }),
            ...(isFileDownload && resolvedUrl
                ? {
                      attachments: [
                          {
                              path: resolvedUrl,
                              filename: resolvedUrl.split("/").pop()?.split("?")[0] ?? "resource",
                          },
                      ],
                  }
                : {}),
        });

        if (process.env.NODE_ENV === "development") {
            console.log("[api/resource] Confirmation email sent:", confirmationResult);
        }

        } catch (err) {
        if (process.env.NODE_ENV === "development") {
            console.error("[api/resource] Resend email failed (submission saved)", err);
        }
        logSecurityEvent(req, "failure", "Email sending failed", { correlationId });
        }
    } else if (process.env.NODE_ENV === "development") {
        console.warn(
        "[api/resource] RESEND_API_KEY not set — submission saved to Sanity only."
        );
    }

    return NextResponse.json({ ok: true });
}
