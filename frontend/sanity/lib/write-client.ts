import { createClient } from 'next-sanity';

import { apiVersion, dataset, projectId } from '@/sanity/lib/api';

let client: ReturnType<typeof createClient> | null = null;

export function sanityWriteClient() {
  if (!client) {
    client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false, // Don't use CDN for writes
      token: process.env.SANITY_WRITE_TOKEN,
    });
  }
  return client;
}
 