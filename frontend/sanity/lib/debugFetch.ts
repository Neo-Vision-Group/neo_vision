import {sanityFetch} from './live'

type FetchParams = {
  query: string
  params?: Record<string, any>
  stega?: boolean
  perspective?: 'published' | 'previewDrafts'
}

// Use the same return type as sanityFetch
export async function debugSanityFetch(params: FetchParams) {
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
