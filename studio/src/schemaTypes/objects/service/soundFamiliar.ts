import { defineType, defineField } from 'sanity'

export const soundFamiliar = defineType({
  name: 'soundFamiliar',
  title: 'Sound Familiar',
  description: 'Displays pain points that resonate with the target audience.',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'SOUND FAMILIAR?'
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string'
    }),
    defineField({
      name: 'painPoints',
      title: 'Pain Points',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required()
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 2
            })
          ],
          preview: {
            select: { title: 'title' }
          }
        }
      ]
    })
  ],
  preview: {
    select: {
      heading: 'heading'
    },
    prepare: ({ heading }) => ({
      title: 'Sound Familiar',
      subtitle: heading
    })
  }
})