import { z } from "zod";

/**
 * Shared Zod schema for the /contact form. Imported by both the
 * client-side ContactForm (via react-hook-form's zodResolver) and the
 * /api/contact route handler. Ensures the same validation bar on both
 * ends — no drift.
 */
export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name.").max(120),
  email: z.string().email("Please enter a valid email."),
  company: z.string().max(120).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  projectType: z.string().max(80).optional().or(z.literal("")),
  budget: z.string().max(40).optional().or(z.literal("")),
  message: z.string().min(20, "Tell us a bit more — at least 20 characters.").max(4000),
  // Honeypot — legitimate users won't fill this, bots often will.
  website: z.string().max(0).optional().or(z.literal("")),
  source: z.string().max(200).optional().or(z.literal("")),
});

export type ContactSubmission = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  source: z.string().max(200).optional().or(z.literal("")),
});

export type NewsletterSubmission = z.infer<typeof newsletterSchema>;
