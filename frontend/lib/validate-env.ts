/**
 * Production environment validation
 * Ensures all required environment variables are set correctly before deployment
 */

type EnvValidationError = {
  variable: string;
  issue: string;
};

export function validateProductionEnv(): EnvValidationError[] {
  const errors: EnvValidationError[] = [];

  // Only validate in production
  if (process.env.NODE_ENV !== 'production') {
    return errors;
  }

  // Required Sanity configuration
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === 'your_project_id') {
    errors.push({
      variable: 'NEXT_PUBLIC_SANITY_PROJECT_ID',
      issue: 'Must be set to your actual Sanity project ID',
    });
  }

  if (!process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_READ_TOKEN === 'your_read_token') {
    errors.push({
      variable: 'SANITY_API_READ_TOKEN',
      issue: 'Must be set to your actual Sanity read token',
    });
  }

  if (!process.env.SANITY_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN === 'your_write_token') {
    errors.push({
      variable: 'SANITY_WRITE_TOKEN',
      issue: 'Must be set to your actual Sanity write token',
    });
  }

  // Site URL must not be localhost
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    errors.push({
      variable: 'NEXT_PUBLIC_SITE_URL',
      issue: 'Must be set to your production domain',
    });
  } else if (siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1')) {
    errors.push({
      variable: 'NEXT_PUBLIC_SITE_URL',
      issue: 'Cannot be localhost in production',
    });
  }

  // Upstash Redis is required for production rate limiting
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    errors.push({
      variable: 'UPSTASH_REDIS_REST_URL',
      issue: 'Required for production rate limiting (get from https://console.upstash.com/)',
    });
  }

  if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
    errors.push({
      variable: 'UPSTASH_REDIS_REST_TOKEN',
      issue: 'Required for production rate limiting (get from https://console.upstash.com/)',
    });
  }

  // Email configuration (warn if missing)
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key') {
    errors.push({
      variable: 'RESEND_API_KEY',
      issue: 'Contact form emails will not be sent (submissions still saved to Sanity)',
    });
  }

  // Analytics (warn if missing)
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN === 'public_posthog_project_token') {
    errors.push({
      variable: 'NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN',
      issue: 'Analytics will not be tracked',
    });
  }

  if (!process.env.POSTHOG_SERVER_API_KEY || process.env.POSTHOG_SERVER_API_KEY === 'server_side_posthog_api_key') {
    errors.push({
      variable: 'POSTHOG_SERVER_API_KEY',
      issue: 'Server-side analytics events will not be tracked',
    });
  }

  return errors;
}

export function throwIfProductionEnvInvalid(): void {
  const errors = validateProductionEnv();
  
  if (errors.length === 0) {
    return;
  }

  const errorMessage = [
    '❌ Production environment validation failed:',
    '',
    ...errors.map(e => `  • ${e.variable}: ${e.issue}`),
    '',
    'Fix these issues before deploying to production.',
  ].join('\n');

  throw new Error(errorMessage);
}
