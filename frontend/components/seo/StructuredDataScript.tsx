import type {StructuredDataNode} from '@/sanity/lib/seo'
import {validateStructuredData, sanitizeForJson} from '@/lib/sanitize'

type StructuredDataScriptProps = {
  nodes?: Array<StructuredDataNode | null | undefined>
}

export function StructuredDataScript({nodes = []}: StructuredDataScriptProps) {
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
            type="application/ld+json"
            dangerouslySetInnerHTML={{__html: JSON.stringify(sanitized)}}
          />
        )
      })}
    </>
  )
}
