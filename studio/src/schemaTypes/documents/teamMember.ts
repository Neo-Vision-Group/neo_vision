import { defineType, defineField } from 'sanity'
import { UsersIcon } from '@sanity/icons'

export const teamMember = defineType({
    name: 'teamMember',
    title: 'Team Member',
    description: 'This is a team member.',
    type: 'document',
    icon: UsersIcon,
    fields: [
        defineField({
            name: 'name',
            title: 'Team Member Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'order',
            title: 'Display Order',
            type: 'number',
            description: 'Order in which the member appears in the carousel (lower numbers first)',
            validation: (Rule) => Rule.required().integer().min(0),
        }),
        defineField({
            name: 'role',
            title: 'Role',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'bio',
            title: 'Bio',
            type: 'text',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'portrait',
            title: 'Portrait Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'role',
            media: 'portrait',
        },
    },
})