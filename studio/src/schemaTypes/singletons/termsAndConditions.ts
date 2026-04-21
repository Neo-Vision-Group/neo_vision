import { defineType, defineField } from 'sanity'
import { ComponentIcon } from '@sanity/icons'

export const termsAndConditions = defineType({
    name: 'termsAndConditions',
    title: 'Terms & Conditions',
    description: 'This is the Terms and Conditions page.',
    type: 'document',
    icon: ComponentIcon,
    fields: [
        defineField({
            name: 'title',
            title: 'Terms & Conditions Title',
            type: 'string',
        })
    ]
})