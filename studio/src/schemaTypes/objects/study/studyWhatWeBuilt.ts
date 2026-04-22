import { defineType, defineField } from 'sanity'

export const studyWhatWeBuilt = defineType({
  name: 'studyWhatWeBuilt',
  title: 'Study What We Built',
  description: 'What we built section for case study detail page',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'WHAT WE BUILT'
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string'
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'number',
              title: 'Number',
              type: 'string',
              validation: (Rule) => Rule.required()
            }),
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
              validation: (Rule) => Rule.required()
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true }
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
      features: 'features'
    },
    prepare: ({ heading, features }) => ({
      title: 'Study What We Built',
      subtitle: heading ?? `${features?.length || 0} features`
    })
  }
})
