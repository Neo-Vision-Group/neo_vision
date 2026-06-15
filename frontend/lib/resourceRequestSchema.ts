import { z } from "zod";

export const resourceRequestSchema = z.object({
  email: z.string().email("Valid email required").max(255, "Email must be 255 characters or less"),
  // Identifier of the page hosting the resource. "" is allowed for the home page.
  pageSlug: z.string().max(255, "Page slug must be 255 characters or less"),
  // The freeResources item `_key` — used to re-resolve the canonical resource server-side.
  itemKey: z.string().min(1, "Resource key is required").max(64, "Resource key must be 64 characters or less"),
  website: z.string().optional(), // Honeypot field
});
export type ResourceRequestFormData = z.infer<typeof resourceRequestSchema>;
