import { defineType, defineField } from 'sanity'

export const story = defineType({
    name: 'story',
    title: 'Story',
    description: 'This is a story section that can be used in a page.',
    type: 'object',
    fields: [
        { name: "eyebrow", type: "string", initialValue: "OUR STORY" },
        {
          name: "heading",
          title: "Heading",
          type: "string",
        },
        {
          name: "milestones",
          title: "Milestones",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                { name: "year", type: "string" },
                { name: "body", type: "text" },
              ],
            },
          ],
        },
      ],
})