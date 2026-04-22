import { defineType, defineField } from 'sanity'

export const aiServices = defineType({
  name: 'aiServices',
  title: 'AI Services',
  description: 'Displays a list of AI services with details and CTAs.',
  type: 'object',
  fields: [
    defineField({ 
      name: "eyebrow", 
      type: "string", 
      initialValue: "AI SERVICES" 
    }),
    defineField({
      name: 'services',
      type: "array",
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'service',
              type: 'reference',
              to: [{ type: 'service' }]
            }),
            defineField({
                name: 'cta',
                title: 'CTA',
                type: 'button',
                validation: (Rule) => Rule.required()
            })
          ]
        }
      ]
    })
  ]
})
