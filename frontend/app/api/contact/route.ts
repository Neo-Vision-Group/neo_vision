import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { sanityWriteClient } from "@/sanity/lib/write-client";
import { contactSchema } from "@/lib/contact-schema";
import { ContactNotification } from "@/components/emails/ContactNotification";
import { getPostHogClient } from "@/lib/posthog-server";
import { rateLimit } from "@/lib/rate-limit";
import { checkContactRateLimit } from "@/lib/rate-limit-upstash";
import { validateCsrfToken } from "@/lib/csrf";
import { logSecurityEvent } from "@/lib/security-logger";
import getIP from "@/lib/getIP";

export async function POST(req: NextRequest) {
  // Rate limiting check - use Upstash if configured, fallback to in-memory
  let rateLimitResult;
  
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const ip = getIP(req);
    rateLimitResult = await checkContactRateLimit(ip);
  } else {
    if (process.env.NODE_ENV === "development") {
      console.warn("[api/contact] Upstash Redis not configured, using in-memory rate limiter (not production-safe)");
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
    logSecurityEvent(req, "failure", "Invalid JSON payload");
    return NextResponse.json(
      { ok: false, error: "Invalid request format." },
      { status: 400 }
    );
  }

  const parsed = contactSchema.safeParse(body);
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

  // 1. Write to Sanity (fail loudly — this is our durable record)
  const correlationId = logSecurityEvent(req, "success", "Contact form submission started");
  
  // Validate Sanity write token is configured
  if (!process.env.SANITY_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN === 'your_write_token') {
    logSecurityEvent(req, "failure", "SANITY_WRITE_TOKEN not configured", { correlationId });
    if (process.env.NODE_ENV === "development") {
      console.error("[api/contact] SANITY_WRITE_TOKEN not configured");
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
    
    // SEC-8: store raw, Zod-validated values; rely on React/Sanity output
    // encoding at render time instead of double-escaping into storage.
    const writePromise = client.create({
      _type: "contactSubmission",
      name: data.name,
      email: data.email,
      company: data.company || undefined,
      phone: data.phone || undefined,
      projectType: data.projectType || undefined,
      budget: data.budget || undefined,
      hearAboutUs: data.hearAboutUs || undefined,
      message: data.message,
      receivedAt,
      status: "new",
    });
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Sanity write timeout")), 10000)
    );
    
    await Promise.race([writePromise, timeoutPromise]);
  } catch (err) {
    logSecurityEvent(req, "failure", "Sanity write failed", { correlationId });
    if (process.env.NODE_ENV === "development") {
      console.error("[api/contact] Sanity write failed", err);
    }
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to process your request. Please try again later.",
      },
      { status: 500 }
    );
  }

  // Track server-side conversion event (durable — fires only after Sanity write succeeds)
  // Generate server-side distinct ID from IP + User-Agent hash (don't trust client header)
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
               req.headers.get("x-real-ip") || 
               "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const distinctId = `${ip}-${Buffer.from(userAgent).toString("base64").substring(0, 16)}`;
    
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId,
      event: "contact_submitted",
      properties: {
        project_type: data.projectType || null,
        budget: data.budget || null,
        hear_about_us: data.hearAboutUs || null,
        has_company: !!data.company,
        has_phone: !!data.phone,
        correlation_id: correlationId,
      },
    });
    await posthog.shutdown();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[api/contact] PostHog tracking failed", err);
    }
  }

  // 2. Send notification email (optional — degrade gracefully)
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
        subject: `[Neo Vision contact] ${data.name}${data.company ? ` · ${data.company}` : ""}`,
        react: ContactNotification({
          name: data.name,
          email: data.email,
          company: data.company,
          phone: data.phone,
          projectType: data.projectType,
          budget: data.budget,
          hearAboutUs: data.hearAboutUs,
          message: data.message,
          receivedAt,
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
        react: ContactNotification({
          name: data.name,
          email: data.email,
          company: data.company,
          phone: data.phone,
          projectType: data.projectType,
          budget: data.budget,
          hearAboutUs: data.hearAboutUs,
          message: data.message,
          receivedAt,
          forClient: true,
        }),
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
