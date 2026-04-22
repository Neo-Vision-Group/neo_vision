import { defineType, defineField } from 'sanity'

export const studyTechStack = defineType({
  name: 'studyTechStack',
  title: 'Study Tech Stack',
  description: 'Tech stack section for case study detail page',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'TECH STACK'
    }),
    defineField({
      name: 'tools',
      title: 'Tools/Technologies',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.required()
    })
  ],
  preview: {
    select: {
      tools: 'tools'
    },
    prepare: ({ tools }) => ({
      title: 'Study Tech Stack',
      subtitle: `${tools?.length || 0} tools`
    })
  }
})
