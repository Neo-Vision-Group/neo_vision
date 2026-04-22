import { defineType, defineField } from 'sanity'

export const industries = defineType({
  name: 'industries',
  title: 'Industries',
  description: 'Displays a list of industries with details and metrics.',
  type: 'object',
  fields: [
    defineField({ 
      name: "eyebrow", 
      type: "string", 
      initialValue: "INDUSTRIES" 
    }),
    defineField({
        name: 'heading',
        type: 'string',
        title: 'Heading'
    }),
    defineField({
      name: 'industries',
      type: "array",
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'industry',
              type: 'string',
              title: 'Industry'
            }),
            defineField({
                name: 'description',
                type: 'string',
                title: 'Description'
            })
          ]
        }
      ]
    }),
    defineField({
        name: 'metrics',
        type: 'array',
        of: [
            {
                type: 'object',
                fields: [
                    defineField({
                        name: 'label',
                        type: 'string',
                        title: 'Label'
                    }),
                    defineField({
                        name: 'value',
                        type: 'string',
                        title: 'Value'
                    }),
                    defineField({
                        name: 'prefix',
                        type: 'string',
                        title: 'Prefix'
                    })
                ]
            }
        ]
    })
  ]
})
