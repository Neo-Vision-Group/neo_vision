import { defineType, defineField } from 'sanity'

export const portfolioFeatured = defineType({
  name: 'portfolioFeatured',
  title: 'Portfolio Featured',
  description: 'Featured case study section for the portfolio page',
  type: 'object',
  fields: [
    defineField({
      name: 'caseStudy',
      title: 'Featured Case Study',
      type: 'reference',
      to: [{ type: 'project' }],
      validation: (Rule) => Rule.required()
    })
  ],
  preview: {
    select: {
      title: 'caseStudy.client',
      subtitle: 'caseStudy.category'
    }
  }
})
