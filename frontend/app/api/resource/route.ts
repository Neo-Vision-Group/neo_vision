import { validateCsrfToken } from "@/lib/csrf";
import { NextRequest, NextResponse } from "next/server";
import getIP from "@/lib/getIP";
import { rateLimit } from "@/lib/rate-limit";
import { checkResourceRequestRateLimit } from "@/lib/rate-limit-upstash";
import { logSecurityEvent } from "@/lib/security-logger";
import { resourceRequestSchema } from "@/lib/resourceRequestSchema";
import { sanityWriteClient } from "@/sanity/lib/write-client";
import { sanitizeHtml } from "@/lib/sanitize";
import { getPostHogClient } from "@/lib/posthog-server";
import { Resend } from "resend";
import { ResourceRequestNotification } from "@/components/emails/ResourceRequestNotification";

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
  
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    ...(process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || []),
  ].filter(Boolean);

  // Validate localhost is not allowed in production
  if (process.env.NODE_ENV === 'production') {
    const hasLocalhost = allowedOrigins.some(o => o.includes('localhost'));
    if (hasLocalhost) {
      logSecurityEvent(req, "blocked", "Localhost origin configured in production");
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
  
  const originUrl = new URL(origin);
  const refererUrl = new URL(referer);
  
  const originAllowed = allowedOrigins.some(allowed => {
    const allowedUrl = new URL(allowed);
    return originUrl.hostname === allowedUrl.hostname;
  });
  
  const refererAllowed = allowedOrigins.some(allowed => {
    const allowedUrl = new URL(allowed);
    return refererUrl.hostname === allowedUrl.hostname;
  });
  
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
    const client = sanityWriteClient();

    const writePromise = client.create({
        _type: "resourceRequest",
        email: sanitizeHtml(data.email),
        resourceRequested: sanitizeHtml(data.resourceRequested),
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
        properties: {
            email: data.email,
            resourceRequested: data.resourceRequested,
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

    const resource = data.resourceObject;
    const resolvedUrl =
        resource.fileUrl ??
        resource.file?.asset?.url ??
        resource.externalUrl ??
        undefined;
    const isFileDownload = !!(resource.fileUrl ?? resource.file?.asset?.url);

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
        try {
        const resend = new Resend(resendKey);
        const from = process.env.RESEND_FROM || "onboarding@resend.dev";
        const to = process.env.CONTACT_TO || "nvt.dev@neovision.dev";
        
        if (process.env.NODE_ENV === "development") {
            console.log("[api/contact] Sending notification email from:", from, "to:", to);
        }
        
        const notificationResult = await resend.emails.send({
                from,
                to,
                replyTo: data.email,
                subject: `Your requested material is provided below!`,
                react: ResourceRequestNotification({
                    email: data.email,
                    resourceRequested: data.resourceRequested,
                    receivedAt,
                    asFile: isFileDownload,
                    url: resolvedUrl,
            }),
        });

        if (process.env.NODE_ENV === "development") {
            console.log("[api/contact] Notification email sent:", notificationResult);
            console.log("[api/contact] Sending confirmation email to:", data.email);
        }

        const confirmationResult = await resend.emails.send({
            from,
            to: data.email,
            subject: `Thanks for reaching out to Neo Vision!`,
            react: ResourceRequestNotification({
                    email: data.email,
                    resourceRequested: data.resourceRequested,
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
            console.log("[api/contact] Confirmation email sent:", confirmationResult);
        }

        } catch (err) {
        if (process.env.NODE_ENV === "development") {
            console.error("[api/contact] Resend email failed (submission saved)", err);
        }
        logSecurityEvent(req, "failure", "Email sending failed", { correlationId });
        }
    } else if (process.env.NODE_ENV === "development") {
        console.warn(
        "[api/contact] RESEND_API_KEY not set — submission saved to Sanity only."
        );
    }

    return NextResponse.json({ ok: true });
}