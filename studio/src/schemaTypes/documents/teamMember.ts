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
        })
    ]
})