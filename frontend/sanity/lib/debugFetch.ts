import {sanityFetch} from './live'

export async function debugSanityFetch<const Q extends string>(
  params: Parameters<typeof sanityFetch<Q>>[0],
) {
  console.log(`[SanityFetch] Fetching:`, {
    query: params.query?.slice(0, 100) + '...',
    params: params.params,
    stega: params.stega,
    perspective: params.perspective
  })

  try {
    const result = await sanityFetch(params)
    
    console.log(`[SanityFetch] Success:`, {
      query: params.query?.slice(0, 100) + '...',
      hasData: !!result.data,
      dataKeys: result.data ? Object.keys(result.data as Record<string, unknown>) : null,
      dataType: typeof result.data
    })
    
    return result
  } catch (error) {
    console.error(`[SanityFetch] Error:`, {
      query: params.query?.slice(0, 100) + '...',
      params: params.params,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  }
}
