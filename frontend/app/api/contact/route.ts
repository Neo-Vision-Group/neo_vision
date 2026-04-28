import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sanityWriteClient } from "@/sanity/lib/write-client";
import { contactSchema } from "@/lib/contact-schema";
import { ContactNotification } from "@/components/emails/ContactNotification";

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
        error: "Couldn't save your message. Please email hello@Neo Vision.ai directly.",
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
