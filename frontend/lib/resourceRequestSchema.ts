import { z } from "zod";

export const resourceRequestSchema = z.object({
  email: z.string().email("Valid email required").max(255, "Email must be 255 characters or less"),
  resourceRequested: z.string().max(1000, "Resource request must be 1000 characters or less"),
  resourceObject: z.object({
    file: z.object({
      asset: z.object({
        url: z.string().url("File URL must be a valid URL").max(2000, "File URL must be 2000 characters or less").optional()
      }).optional()
    }).optional(),
    fileUrl: z.string().url("File URL must be a valid URL").max(2000, "File URL must be 2000 characters or less").optional(),
    externalUrl: z.string().url("External URL must be a valid URL").max(2000, "External URL must be 2000 characters or less").optional()
  }).strict(),
  website: z.string().optional(), // Honeypot field
});
export type ResourceRequestFormData = z.infer<typeof resourceRequestSchema>;
