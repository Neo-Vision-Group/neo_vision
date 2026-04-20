import { defineType, defineField } from 'sanity'

export const homeHero = defineType({
    name: 'homeHero',
    title: 'Home Page Hero',
    description: 'This is the hero section used on the Home Page.',
    type: 'object',
    fields: [
        defineField({ name: "label", type: "string", initialValue: "TwelveTen" }),
        defineField({ name: "heading", type: "string", initialValue: "We take you from 1 to 10." }),
        defineField({ name: "body", type: "text", rows: 3 }),
        defineField({ name: "primaryCta", type: "button" }),
        defineField({ name: "stats", type: "text", rows: 2 }),
        defineField({ name: "dimensionLine", type: "string", initialValue: "A NEW DIMENSION." }),
        defineField({ name: 'ctaText', type: 'text', rows: 2, validation: (Rule) => Rule.required() }),
        defineField({ name: "secondaryCta", type: "button" }),
    ]
})