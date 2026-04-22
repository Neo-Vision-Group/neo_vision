import { defineType, defineField } from 'sanity'

export const team = defineType({
    name: 'team',
    title: 'Team',
    description: 'This is the team section used on the Home Page.',
    type: 'object',
    fields: [
        defineField({ name: "eyebrow", title: 'Eyebrow', type: "string", initialValue: "THE TEAM" }),
        defineField({ name: "heading", title: 'Heading', type: "string", validation: (Rule) => Rule.required() }),
        defineField({
          name: "members",
          title: 'Members',
          type: "array",
          of: [{ type: "reference", to: [{ type: "teamMember" }] }],
          validation: (Rule) => Rule.required().min(3),
        }),
        defineField({
          name: "closingStatement",
          title: 'Closing Statement',
          type: "text",
          description:
            "Inline rich text — use Text parts for regular copy, Bold parts for emphasized phrases.",
          validation: (Rule) => Rule.required(),
        }),
      ],
})