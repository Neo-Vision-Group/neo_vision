import { defineType, defineField } from 'sanity'

export const portfolio = defineType({
    name: 'portfolio',
    title: 'Portfolio',
    description: 'This is a portfolio section that can be used in a page.',
    type: 'object',
    fields: [
        defineField({
            name: 'eyebrow',
            title: 'Eyebrow',
            type: 'string',
            initialValue: 'Our Work',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'heading',
            title: 'Heading',
            type: 'string',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'projects',
            title: 'Projects',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'project' }]
                }
            ],
            validation: (Rule) => Rule.required()
        })
    ]
})