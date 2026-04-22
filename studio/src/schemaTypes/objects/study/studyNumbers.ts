import { defineType, defineField } from 'sanity'

export const studyNumbers = defineType({
  name: 'studyNumbers',
  title: 'Study Numbers',
  description: 'Numbers/metrics section for case study detail page',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'THE NUMBERS'
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string'
    }),
    defineField({
      name: 'footnote',
      title: 'Footnote',
      type: 'text'
    }),
    defineField({
      name: 'stats',
      title: 'Stats',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string',
              validation: (Rule) => Rule.required()
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required()
            })
          ]
        }
      ],
      validation: (Rule) => Rule.required()
    })
  ],
  preview: {
    select: {
      heading: 'heading',
      stats: 'stats'
    },
    prepare: ({ heading, stats }) => ({
      title: 'Study Numbers',
      subtitle: heading ?? `${stats?.length || 0} metrics`
    })
  }
})
