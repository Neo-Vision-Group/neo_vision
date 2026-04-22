import { defineType, defineField } from 'sanity'
import { CaseIcon } from '@sanity/icons'

export const project = defineType({
    name: 'project',
    title: 'Project',
    description: 'Case study project with full detail sections',
    type: 'document',
    icon: CaseIcon,
    fields: [
        defineField({
            name: 'client',
            title: 'Client',
            type: 'string',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'year',
            title: 'Year',
            type: 'string',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'string',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'industry',
            title: 'Industry',
            type: 'string',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'tagline',
            title: 'Tagline',
            type: 'string',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'metric',
            title: 'Metric Value',
            type: 'string'
        }),
        defineField({
            name: 'metricLabel',
            title: 'Metric Label',
            type: 'string'
        }),
        defineField({
            name: 'thumb',
            title: 'Thumbnail',
            type: 'image',
            options: { hotspot: true }
        }),
        // Challenge section
        defineField({
            name: 'challenge',
            title: 'Challenge Section',
            type: 'object',
            fields: [
                defineField({ name: 'eyebrow', type: 'string', initialValue: 'THE CHALLENGE' }),
                defineField({ name: 'heading', type: 'string' }),
                defineField({ name: 'body', type: 'text' }),
                defineField({
                    name: 'issues',
                    type: 'array',
                    of: [
                        {
                            type: 'object',
                            fields: [
                                defineField({ name: 'tag', type: 'string' }),
                                defineField({ name: 'body', type: 'text' })
                            ]
                        }
                    ]
                })
            ]
        }),
        // Approach section
        defineField({
            name: 'approach',
            title: 'Approach Section',
            type: 'object',
            fields: [
                defineField({ name: 'eyebrow', type: 'string', initialValue: 'OUR APPROACH' }),
                defineField({
                    name: 'heading',
                    type: 'object',
                    fields: [
                        defineField({ name: 'faded', type: 'string' }),
                        defineField({ name: 'bold', type: 'string' })
                    ]
                }),
                defineField({ name: 'body', type: 'text' }),
                defineField({
                    name: 'callout',
                    type: 'object',
                    fields: [
                        defineField({ name: 'label', type: 'string', initialValue: 'Approach' }),
                        defineField({ name: 'body', type: 'text' })
                    ]
                })
            ]
        }),
        // Key Wins section
        defineField({
            name: 'keyWins',
            title: 'Key Wins Section',
            type: 'object',
            fields: [
                defineField({ name: 'eyebrow', type: 'string', initialValue: 'THE KEY WINS' }),
                defineField({ name: 'heading', type: 'string' }),
                defineField({
                    name: 'comparison',
                    type: 'object',
                    fields: [
                        defineField({ name: 'beforeLabel', type: 'string', initialValue: 'Before' }),
                        defineField({ name: 'afterLabel', type: 'string', initialValue: 'After' }),
                        defineField({
                            name: 'rows',
                            type: 'array',
                            of: [
                                {
                                    type: 'object',
                                    fields: [
                                        defineField({ name: 'label', type: 'string' }),
                                        defineField({ name: 'before', type: 'string' }),
                                        defineField({ name: 'after', type: 'string' })
                                    ]
                                }
                            ]
                        })
                    ]
                })
            ]
        }),
        // What We Built section
        defineField({
            name: 'whatWeBuilt',
            title: 'What We Built Section',
            type: 'object',
            fields: [
                defineField({ name: 'eyebrow', type: 'string', initialValue: 'WHAT WE BUILT' }),
                defineField({ name: 'heading', type: 'string' }),
                defineField({
                    name: 'features',
                    type: 'array',
                    of: [
                        {
                            type: 'object',
                            fields: [
                                defineField({ name: 'number', type: 'string' }),
                                defineField({ name: 'title', type: 'string' }),
                                defineField({ name: 'body', type: 'text' }),
                                defineField({ name: 'image', type: 'image', options: { hotspot: true } })
                            ]
                        }
                    ]
                })
            ]
        }),
        // Numbers section
        defineField({
            name: 'numbers',
            title: 'Numbers Section',
            type: 'object',
            fields: [
                defineField({ name: 'eyebrow', type: 'string', initialValue: 'THE NUMBERS' }),
                defineField({ name: 'heading', type: 'string' }),
                defineField({ name: 'footnote', type: 'text' }),
                defineField({
                    name: 'stats',
                    type: 'array',
                    of: [
                        {
                            type: 'object',
                            fields: [
                                defineField({ name: 'value', type: 'string' }),
                                defineField({ name: 'label', type: 'string' })
                            ]
                        }
                    ]
                })
            ]
        }),
        // Testimonial section
        defineField({
            name: 'testimonial',
            title: 'Testimonial',
            type: 'object',
            fields: [
                defineField({ name: 'quote', type: 'text' }),
                defineField({ name: 'attribution', type: 'string' }),
                defineField({ name: 'source', type: 'string' })
            ]
        }),
        defineField({
            name: 'detailTestimonial',
            title: 'Detail Testimonial Section',
            type: 'object',
            fields: [
                defineField({ name: 'eyebrow', type: 'string', initialValue: 'TESTIMONIAL' }),
                defineField({
                    name: 'quote',
                    type: 'object',
                    fields: [
                        defineField({ name: 'quote', type: 'text' }),
                        defineField({ name: 'attribution', type: 'string' }),
                        defineField({ name: 'source', type: 'string' }),
                        defineField({ name: 'accent', type: 'boolean', initialValue: false })
                    ]
                })
            ]
        }),
        // Tech Stack section
        defineField({
            name: 'techStack',
            title: 'Tech Stack Section',
            type: 'object',
            fields: [
                defineField({ name: 'eyebrow', type: 'string', initialValue: 'TECH STACK' }),
                defineField({
                    name: 'tools',
                    type: 'array',
                    of: [{ type: 'string' }]
                })
            ]
        }),
        // Closing CTA section
        defineField({
            name: 'closingCta',
            title: 'Closing CTA Section',
            type: 'object',
            fields: [
                defineField({
                    name: 'heading',
                    type: 'object',
                    fields: [
                        defineField({ name: 'regular', type: 'string' }),
                        defineField({ name: 'bold', type: 'string' })
                    ]
                }),
                defineField({ name: 'body', type: 'text' }),
                defineField({
                    name: 'cta',
                    title: 'CTA Button',
                    type: 'button'
                })
            ]
        }),
        defineField({
            name: 'publishedAt',
            title: 'Published At',
            type: 'datetime'
        })
    ]
})