import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  email: z.string().email("Valid email required").max(255, "Email must be 255 characters or less"),
  company: z.string().max(100, "Company name must be 100 characters or less").optional(),
  phone: z.string().max(20, "Phone number must be 20 characters or less").optional(),
  projectType: z.string().max(50, "Project type must be 50 characters or less").optional(),
  budget: z.string().max(50, "Budget must be 50 characters or less").optional(),
  hearAboutUs: z.string().max(100, "This field must be 100 characters or less").optional(),
  message: z.string().min(10, "Please tell us more about your project").max(2000, "Message must be 2000 characters or less"),
  website: z.string().optional(), // Honeypot field
});
export type ContactFormData = z.infer<typeof contactSchema>;
