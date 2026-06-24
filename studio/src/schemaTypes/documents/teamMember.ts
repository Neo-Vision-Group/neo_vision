import { defineType, defineField, defineArrayMember } from 'sanity'
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
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {source: 'name', maxLength: 96},
            validation: (r) => r.required(),
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
            name: 'isAuthor',
            title: 'Author',
            description: "Is this user an author on this website?",
            type: "boolean"
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
        defineField({
            name: 'linkedin',
            title: 'LinkedIn URL',
            type: 'url',
            validation: (Rule) => Rule.uri({ allowRelative: false, scheme: ['https'] }),
        }),
        defineField({
            name: 'instagram',
            title: 'Instagram',
            type: 'url',
            description: 'Instagram profile URL',
        }),
        defineField({
            name: 'facebook',
            title: 'Facebook',
            type: 'url',
            description: 'Facebook profile URL',
        }),
        defineField({
            name: 'github',
            title: 'GitHub',
            type: 'url',
            description: 'GitHub profile URL',
        }),
        defineField({
            name: 'x',
            title: 'X (Twitter)',
            type: 'url',
            description: 'X (formerly Twitter) profile URL',
        }),
        defineField({
            name: 'tiktok',
            title: 'TikTok',
            type: 'url',
            description: 'TikTok profile URL',
        }),
        defineField({
            name: "badges",
            title: "Badges",
            type: "array",
            of: [
                defineArrayMember({
                    type: "string"
                })
            ]
        }),
        defineField({
            name: 'seo',
            title: 'SEO Override',
            type: 'seo',
            description:
            'Page-level SEO overrides. Leave any field blank to inherit the default value from SEO Settings.',
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