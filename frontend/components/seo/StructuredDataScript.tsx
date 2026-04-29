import type {StructuredDataNode} from '@/sanity/lib/seo'

type StructuredDataScriptProps = {
  nodes?: Array<StructuredDataNode | null | undefined>
}

export function StructuredDataScript({nodes = []}: StructuredDataScriptProps) {
  const validNodes = nodes.filter(Boolean) as StructuredDataNode[]

  if (validNodes.length === 0) {
    return null
  }

  return (
    <>
      {validNodes.map((node, index) => (
        <script
          key={index}
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{__html: JSON.stringify(node)}}
        />
      ))}
    </>
  )
}
