import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sanityWriteClient } from "@/sanity/lib/write-client";
import { contactSchema } from "@/lib/contact-schema";
import { ContactNotification } from "@/components/emails/ContactNotification";

/**
 * POST /api/contact — validates the submission with the shared Zod
 * schema, writes a `contactSubmission` document to Sanity, and (if
 * `RESEND_API_KEY` is configured) sends a notification email to the
 * team via Resend.
 *
 * Honeypot: if the `website` field is populated, we silently return
 * ok without writing or emailing — bots don't know they failed.
 *
 * Env:
 *   RESEND_API_KEY       — from resend.com (optional; skipped if missing)
 *   RESEND_FROM          — sender email (defaults to onboarding@resend.dev)
 *   CONTACT_TO           — recipient (defaults to hello@1210.ai)
 */
export async function POST(req: Request) {
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
        error: "Couldn't save your message. Please email hello@1210.ai directly.",
      },
      { status: 500 }
    );
  }

  // 2. Send notification email (optional — degrade gracefully)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const from = process.env.RESEND_FROM || "onboarding@resend.dev";
      const to = process.env.CONTACT_TO || "hello@1210.ai";
      await resend.emails.send({
        from,
        to,
        replyTo: data.email,
        subject: `[1210 contact] ${data.name}${data.company ? ` · ${data.company}` : ""}`,
        react: ContactNotification({
          name: data.name,
          email: data.email,
          company: data.company,
          phone: data.phone,
          projectType: data.projectType,
          budget: data.budget,
          message: data.message,
          source: data.source,
          receivedAt,
        }),
      });
    } catch (err) {
      // Email failure is non-fatal — submission is already durable in Sanity.
      console.error("[api/contact] Resend email failed (submission saved)", err);
    }
  } else {
    console.warn(
      "[api/contact] RESEND_API_KEY not set — submission saved to Sanity only."
    );
  }

  return NextResponse.json({ ok: true });
}
