import { defineType, defineField } from 'sanity'

export const testimonials = defineType({
    name: 'testimonials',
    title: 'Testimonials',
    description: 'This is a list of testimonials that can be used in a page.',
    type: 'object',
    fields: [
        defineField({
            name: 'eyebrow',
            title: 'Eyebrow',
            type: 'string',
            initialValue: 'Trusted By',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'testimonials',
            title: 'Testimonials',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'testimonial' }]
                }
            ],
            validation: (Rule) => Rule.required()
        })
    ]
})