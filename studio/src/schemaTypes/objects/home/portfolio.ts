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
            description: 'Select the projects to show in this Work block and optionally upload a per-card graphic override.',
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
                        }),
                        defineField({
                            name: 'graphic',
                            title: 'Card Graphic',
                            type: 'image',
                            description:
                                'Optional black-and-white line graphic for this Work card. White lines render red on the frontend.'
                        })
                    ],
                    preview: {
                        select: {
                            title: 'project.client',
                            subtitle: 'project.tagline',
                            graphic: 'graphic',
                            thumb: 'project.thumb'
                        },
                        prepare({ title, subtitle, graphic, thumb }) {
                            return {
                                title: title || 'Untitled project',
                                subtitle: subtitle || 'Work card',
                                media: graphic || thumb
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
