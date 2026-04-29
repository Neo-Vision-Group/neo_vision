import { defineType, defineField } from 'sanity'

export const portfolio = defineType({
    name: 'portfolio',
    title: 'Portfolio',
    description: 'This is a portfolio section that can be used in a page.',
    type: 'object',
    fields: [
        defineField({
            name: 'eyebrow',
            title: 'Eyebrow',
            type: 'string',
            initialValue: 'Our Work',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'heading',
            title: 'Heading',
            type: 'string',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'cards',
            title: 'Projects',
            type: 'array',
            description: 'Select the projects to show in this Work block.',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({
                            name: 'project',
                            title: 'Project',
                            type: 'reference',
                            to: [{ type: 'project' }],
                            validation: (Rule) => Rule.required()
                        })
                    ],
                    preview: {
                        select: {
                            title: 'project.client',
                            subtitle: 'project.tagline',
                            thumb: 'project.thumb'
                        },
                        prepare({ title, subtitle, thumb }) {
                            return {
                                title: title || 'Untitled project',
                                subtitle: subtitle || 'Work card',
                                media: thumb
                            }
                        }
                    }
                }
            ],
            validation: (Rule) => Rule.required().min(1)
        }),
        defineField({
            name: 'cta',
            title: 'CTA Button',
            type: 'button'
        })
    ],
    preview: {
        select: {
            title: 'eyebrow',
            subtitle: 'heading'
        }
    }
})
