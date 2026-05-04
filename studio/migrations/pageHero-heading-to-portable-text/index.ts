import {defineMigration, at, patch, set, unset} from 'sanity/migrate'

function stringToPortableText(text: string) {
  return [
    {
      _type: 'block',
      _key: Math.random().toString(36).slice(2, 10),
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: Math.random().toString(36).slice(2, 10),
          text,
          marks: [],
        },
      ],
    },
  ]
}

export default defineMigration({
  title: 'Convert pageHero.heading from string to portable text',
  documentTypes: ['page', 'service', 'project'],
  migrate: {
    document(doc) {
      const pageBuilder = (doc as any).pageBuilder
      if (!Array.isArray(pageBuilder)) return undefined

      const patches: ReturnType<typeof at>[] = []

      for (const block of pageBuilder) {
        if (block._type !== 'pageHero' || !block._key) continue

        const base = `pageBuilder[_key=="${block._key}"]`

        if (typeof block.heading === 'string' && block.heading.trim()) {
          patches.push(at(`${base}.heading`, set(stringToPortableText(block.heading))))
        }

        if ('headingType' in block) {
          patches.push(at(`${base}.headingType`, unset()))
        }

        if ('headingMultipart' in block) {
          patches.push(at(`${base}.headingMultipart`, unset()))
        }
      }

      if (patches.length === 0) return undefined
      return patch(doc._id, patches)
    },
  },
})
