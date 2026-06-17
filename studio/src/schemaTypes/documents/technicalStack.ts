import { defineType, defineField } from 'sanity'
import {BarChartIcon} from '@sanity/icons'

export const technicalStack = defineType({
    name: "technicalStack",
    title: 'Tech Stack',
    description: "Tech Stacks used by Neo Vision",
    type: 'document',
    icon: BarChartIcon,
    fields: [
        defineField({
            name: 'name',
            title: 'Tech Stack Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Tech Stack Image',
            type: 'image',
            validation: (Rule) => Rule.required(),
        })
    ]
})