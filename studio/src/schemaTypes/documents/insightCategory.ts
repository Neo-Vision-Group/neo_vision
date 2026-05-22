import {defineField, defineType} from 'sanity'

export const insightCategory = defineType({
  name: 'insightCategory',
  title: 'Insight Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description: 'Optional description for the category.',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'slug.current'},
  },
})
