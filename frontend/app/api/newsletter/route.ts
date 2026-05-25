import { NextResponse } from "next/server";
import { sanityWriteClient } from "@/sanity/client";
import { newsletterSchema } from "@/lib/contact-schema";

/**
 * POST /api/newsletter — validates the email + source with the shared
 * Zod schema and writes a `newsletterSubscriber` document to Sanity.
 * Idempotent: if a subscriber with this email already exists, we
 * mark it `active: true` rather than creating a duplicate.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid email.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { email, source } = parsed.data;

  try {
    const client = sanityWriteClient();

    // Idempotent upsert by email
    const existing = await client.fetch<{ _id: string } | null>(
      `*[_type == "newsletterSubscriber" && email == $email][0]{ _id }`,
      { email }
    );

    if (existing) {
      await client.patch(existing._id).set({ active: true }).commit();
    } else {
      await client.create({
        _type: "newsletterSubscriber",
        email,
        source: source || "/insights",
        subscribedAt: new Date().toISOString(),
        active: true,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/newsletter] Sanity write failed", err);
    return NextResponse.json(
      { ok: false, error: "Couldn't subscribe you. Please try again later." },
      { status: 500 }
    );
  }
}
