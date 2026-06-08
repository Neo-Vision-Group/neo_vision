import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

export function getPostHogClient() {
  if (!posthogClient) {
    const serverToken = process.env.POSTHOG_SERVER_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
    
    if (!serverToken) {
      throw new Error("PostHog server token not configured");
    }
    
    posthogClient = new PostHog(serverToken, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return posthogClient;
}
