import { createClient } from 'next-sanity';

import { apiVersion, dataset, projectId } from '@/sanity/lib/api';

export function sanityWriteClient() {
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false, // Don't use CDN for writes
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
  });
}
