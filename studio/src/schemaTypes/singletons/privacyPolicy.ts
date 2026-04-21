import { defineType, defineField } from 'sanity'
import { ComponentIcon } from '@sanity/icons'

export const privacyPolicy = defineType({
    name: 'privacyPolicy',
    title: 'Privacy Policy',
    description: 'This is the Privacy Policy Page',
    type: 'document',
    icon: ComponentIcon,
    fields: [
        defineField({
            name: 'title',
            title: 'Privacy Policy Title',
            type: 'string',
        })
    ]
})