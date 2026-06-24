import type {StructuredDataNode} from '@/sanity/lib/seo'
import {validateStructuredData, sanitizeForJson} from '@/lib/sanitize'

type StructuredDataScriptProps = {
  nodes?: Array<StructuredDataNode | null | undefined>
  nonce?: string
}

export function StructuredDataScript({nodes = [], nonce}: StructuredDataScriptProps) {
  const validNodes = nodes
    .filter(Boolean)
    .filter(validateStructuredData) as StructuredDataNode[]

  if (validNodes.length === 0) {
    return null
  }

  return (
    <>
      {validNodes.map((node, index) => {
        const sanitized = sanitizeForJson(node)
        return (
          <script
            key={index}
            nonce={nonce}
            type="application/ld+json"
            dangerouslySetInnerHTML={{__html: JSON.stringify(sanitized)}}
          />
        )
      })}
    </>
  )
}
