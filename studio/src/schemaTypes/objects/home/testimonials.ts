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
            name: 'logos',
            title: 'Client Logos',
            type: 'array',
            description: 'Client logos to display in the logo grid',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'name', type: 'string', title: 'Company Name', validation: (Rule) => Rule.required() },
                        { name: 'logo', type: 'image', title: 'Logo Image', validation: (Rule) => Rule.required() }
                    ],
                    preview: {
                        select: { title: 'name', media: 'logo' }
                    }
                }
            ],
            validation: (Rule) => Rule.required().min(3)
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
            validation: (Rule) => Rule.required().min(2)
        })
    ]
})