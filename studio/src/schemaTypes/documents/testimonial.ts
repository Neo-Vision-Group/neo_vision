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
        })
    ]
})