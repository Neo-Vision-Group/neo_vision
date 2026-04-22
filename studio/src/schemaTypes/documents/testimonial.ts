import { defineType, defineField } from 'sanity'
import { CommentIcon } from '@sanity/icons'

export const testimonial = defineType({
    name: 'testimonial',
    title: 'Testimonial',
    description: 'This is a testimonial that can be used in a page.',
    type: 'document',
    icon: CommentIcon,
    fields: [
        defineField({
            name: 'name',
            title: 'Testimonial Name',
            type: 'string',
            description: 'Internal name for this testimonial (e.g., "John Doe - Acme Corp")',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'attribution',
            title: 'Attribution',
            type: 'string',
            description: 'Author and company attribution (e.g., "— Jane Smith, CEO at Acme Corp")',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'quote',
            title: 'Quote',
            type: 'text',
            rows: 4,
            description: 'The testimonial quote text',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'profilePicture',
            title: 'Profile Picture',
            type: 'image',
            description: 'Photo of the person giving the testimonial',
            options: {
                hotspot: true,
            },
        })
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'attribution',
            media: 'profilePicture',
        },
    }
})