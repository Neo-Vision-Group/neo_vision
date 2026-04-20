import { defineType, defineField } from 'sanity'

export const teamMember = defineType({
    name: 'teamMember',
    title: 'Team Member',
    description: 'This is a team member.',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Team Member Name',
            type: 'string',
        })
    ]
})