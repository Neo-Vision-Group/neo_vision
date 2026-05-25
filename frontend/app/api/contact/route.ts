import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sanityWriteClient } from "@/sanity/lib/write-client";
import { contactSchema } from "@/lib/contact-schema";
import { ContactNotification } from "@/components/emails/ContactNotification";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(req: Request) {
    const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  
  // Allow same-origin requests only
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'https://neovision.dev', // Add your production domain
  ];
  
  // Check Origin header (preferred for POST)
  if (origin) {
    const originUrl = new URL(origin);
    const isAllowed = allowedOrigins.some(allowed => {
      const allowedUrl = new URL(allowed);
      return originUrl.hostname === allowedUrl.hostname;
    });
    
    if (!isAllowed) {
      return NextResponse.json(
        { ok: false, error: "Invalid origin." },
        { status: 403 }
      );
    }
  }
  
  // Fallback: check Referer if Origin is missing
  else if (referer) {
    const refererUrl = new URL(referer);
    const isAllowed = allowedOrigins.some(allowed => {
      const allowedUrl = new URL(allowed);
      return refererUrl.hostname === allowedUrl.hostname;
    });
    
    if (!isAllowed) {
      return NextResponse.json(
        { ok: false, error: "Invalid referer." },
        { status: 403 }
      );
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON." },
      { status: 400 }
    );
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
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
    return NextResponse.json({ ok: true });
  }

  const receivedAt = new Date().toISOString();

  // 1. Write to Sanity (fail loudly — this is our durable record)
  try {
    const client = sanityWriteClient();
    await client.create({
      _type: "contactSubmission",
      name: data.name,
      email: data.email,
      company: data.company || undefined,
      phone: data.phone || undefined,
      projectType: data.projectType || undefined,
      budget: data.budget || undefined,
      hearAboutUs: data.hearAboutUs || undefined,
      message: data.message,
      source: data.source || "/contact",
      receivedAt,
      status: "new",
    });
  } catch (err) {
    console.error("[api/contact] Sanity write failed", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Couldn't save your message. Please email office@neovision.dev directly.",
      },
      { status: 500 }
    );
  }

  // Track server-side conversion event (durable — fires only after Sanity write succeeds)
  const distinctId = req.headers.get("x-posthog-distinct-id") ?? data.email;
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId,
    event: "contact_submitted",
    properties: {
      project_type: data.projectType || null,
      budget: data.budget || null,
      hear_about_us: data.hearAboutUs || null,
      source: data.source || "/contact",
      has_company: !!data.company,
      has_phone: !!data.phone,
    },
  });

  // 2. Send notification email (optional — degrade gracefully)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const from = process.env.RESEND_FROM || "onboarding@resend.dev";
      const to = process.env.CONTACT_TO || "nvt.dev@neovision.dev";
      await resend.emails.send({
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
          source: data.source,
          receivedAt,
        }),
      });

      await resend.emails.send({
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
          source: data.source,
          receivedAt,
          forClient: true,
        }),
      });

    } catch (err) {
      console.error("[api/contact] Resend email failed (submission saved)", err);
    }
  } else {
    console.warn(
      "[api/contact] RESEND_API_KEY not set — submission saved to Sanity only."
    );
  }

  return NextResponse.json({ ok: true });
}
