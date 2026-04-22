import { defineType, defineField } from 'sanity'

export const studyChallenge = defineType({
  name: 'studyChallenge',
  title: 'Study Challenge',
  description: 'Challenge section for case study detail page',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'THE CHALLENGE'
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text'
    }),
    defineField({
      name: 'issues',
      title: 'Issues',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'tag',
              title: 'Tag',
              type: 'string',
              validation: (Rule) => Rule.required()
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              validation: (Rule) => Rule.required()
            })
          ]
        }
      ]
    })
  ],
  preview: {
    select: {
      heading: 'heading'
    },
    prepare: ({ heading }) => ({
      title: 'Study Challenge',
      subtitle: heading
    })
  }
})
