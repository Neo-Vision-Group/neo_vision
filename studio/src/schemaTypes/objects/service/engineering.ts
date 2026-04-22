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
      name: "services",
      title: "Services",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { 
              name: "title", 
              type: "string",
              title: "Service Title",
              validation: (Rule) => Rule.required(),
              description: 'e.g., "Websites & E-Commerce"'
            },
            { 
              name: "badge", 
              type: "string",
              title: "Badge Text",
              description: 'e.g., "50+ shipped"'
            },
            { 
              name: "priceFrom", 
              type: "string",
              title: "Price From",
              description: 'e.g., "From €5K"'
            },
            { 
              name: "duration", 
              type: "string",
              title: "Duration",
              description: 'e.g., "6-14 weeks"'
            },
            { 
              name: "description", 
              type: "text",
              rows: 3,
              title: "Description",
              validation: (Rule) => Rule.required()
            },
            { 
              name: "ctaLabel", 
              type: "string",
              title: "CTA Label",
              initialValue: "Learn More"
            },
            { 
              name: "ctaHref", 
              type: "string",
              title: "CTA Link",
              description: 'URL or path, e.g., "/services/websites"'
            },
          ],
          preview: {
            select: {
              title: "title",
              subtitle: "badge"
            }
          }
        }
      ],
      validation: (Rule) => Rule.required().min(1)
    }),
  ]
})
