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
        defineField({
            name: 'pageBuilder',
            title: 'Page Builder',
            type: 'array',
            of: [
                { type: 'studyHero' },
                { type: 'studyChallenge' },
                { type: 'studyApproach' },
                { type: 'studyKeyWins' },
                { type: 'studyNumbers' },
                { type: 'studyTestimonial' },
                { type: 'studyTechStack' },
                { type: 'steps' },
                { type: 'whyRomania' },
                { type: 'compare' },
                { type: 'awards' },
                { type: 'techStack' },
                { type: 'pricing' },
                { type: 'portfolioGrid' },
                { type: 'cta' }
            ]
        }),
        defineField({
            name: 'publishedAt',
            title: 'Published At',
            type: 'datetime'
        })
    ]
})

