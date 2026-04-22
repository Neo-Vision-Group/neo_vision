import { defineType, defineField } from 'sanity'

export const engineeringServices = defineType({
  name: 'engineeringServices',
  title: 'Engineering Services',
  description: 'Displays a list of engineering services with details and CTAs.',
  type: 'object',
  fields: [
    defineField({ 
      name: "eyebrow", 
      type: "string", 
      initialValue: "ENGINEERING SERVICES" 
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
