import { z } from "zod";

const envSchema = z.object({
  // Sanity
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1, "Sanity project ID is required"),
  NEXT_PUBLIC_SANITY_DATASET: z.string().min(1, "Sanity dataset is required"),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid Sanity API version format"),
  SANITY_API_READ_TOKEN: z.string().optional(),
  SANITY_WRITE_TOKEN: z.string().optional(),
  
  // Site
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  
  // Email
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM: z.string().email().optional(),
  CONTACT_TO: z.string().email().optional(),
  
  // Analytics
  NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  POSTHOG_SERVER_API_KEY: z.string().optional(),
  PLAUSIBLE_SCRIPT_URL: z.string().url().optional(),
  
  // Rate Limiting (Upstash Redis)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      error.issues.forEach((err: z.ZodIssue) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      throw new Error("Invalid environment configuration");
    }
    throw error;
  }
}

export function getEnv(): Env {
  if (!validatedEnv) {
    return validateEnv();
  }
  return validatedEnv;
}
