import { defineType, defineField } from 'sanity'

export const aiServices = defineType({
  name: 'aiServices',
  title: 'AI Transformation Services',
  description: 'Displays AI service cards with service references and per-card CTAs.',
  type: 'object',
  fields: [
    defineField({ 
      name: "eyebrow",
      title: "Sidebar Label",
      type: "string", 
      initialValue: "AI TRANSFORMATION SERVICES",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'services',
      title: 'Services',
      type: "array",
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineField({
          type: 'object',
          name: 'aiServiceCard',
          title: 'AI Service Card',
          fields: [
            defineField({
              name: 'service',
              title: 'Service',
              type: 'reference',
              to: [{ type: 'service' }],
              options: {
                filter: 'category == $category',
                filterParams: { category: 'ai' },
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'cta',
              title: 'CTA',
              type: 'button',
              validation: (Rule) => Rule.required()
            })
          ],
          preview: {
            select: {
              title: 'service.name',
              subtitle: 'cta.buttonText',
            },
            prepare({ title, subtitle }) {
              return {
                title: title || 'Untitled AI service',
                subtitle: subtitle ? `CTA: ${subtitle}` : 'Missing CTA',
              }
            },
          },
        })
      ],
    })
  ],
})
