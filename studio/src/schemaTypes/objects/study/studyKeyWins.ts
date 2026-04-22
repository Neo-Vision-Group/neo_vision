import { defineType, defineField } from 'sanity'

export const studyKeyWins = defineType({
  name: 'studyKeyWins',
  title: 'Study Key Wins',
  description: 'Key wins section with comparison table for case study detail page',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'THE KEY WINS'
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string'
    }),
    defineField({
      name: 'comparison',
      title: 'Comparison Table',
      type: 'object',
      fields: [
        defineField({
          name: 'beforeLabel',
          title: 'Before Label',
          type: 'string',
          initialValue: 'Before'
        }),
        defineField({
          name: 'afterLabel',
          title: 'After Label',
          type: 'string',
          initialValue: 'After'
        }),
        defineField({
          name: 'rows',
          title: 'Comparison Rows',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Metric Label',
                  type: 'string',
                  validation: (Rule) => Rule.required()
                }),
                defineField({
                  name: 'before',
                  title: 'Before Value',
                  type: 'string',
                  validation: (Rule) => Rule.required()
                }),
                defineField({
                  name: 'after',
                  title: 'After Value',
                  type: 'string',
                  validation: (Rule) => Rule.required()
                })
              ]
            }
          ],
          validation: (Rule) => Rule.required()
        })
      ]
    })
  ],
  preview: {
    select: {
      heading: 'heading'
    },
    prepare: ({ heading }) => ({
      title: 'Study Key Wins',
      subtitle: heading
    })
  }
})
