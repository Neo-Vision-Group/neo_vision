import { defineType, defineField } from 'sanity'

export const booking = defineType({
  name: 'booking',
  title: 'Booking',
  description: 'Booking/scheduling section with calendar grid and call details.',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'PREFER TO BOOK DIRECTLY?',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'object',
      fields: [
        defineField({
          name: 'regular',
          title: 'Regular Text',
          type: 'string',
          initialValue: 'Skip the form.',
        }),
        defineField({
          name: 'bold',
          title: 'Bold Text',
          type: 'string',
          initialValue: 'Pick a time.',
        }),
      ],
    }),
    defineField({
      name: 'callTitle',
      title: 'Call Title',
      type: 'string',
      initialValue: '30-Minute Discovery Call',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'teamMember',
      title: 'Team Member',
      type: 'reference',
      to: [{ type: 'teamMember' }],
      validation: (Rule) => Rule.required(),
      description: 'Select a team member for the booking call',
    }),
    defineField({
      name: 'whatToExpectHeading',
      title: 'What to Expect Heading',
      type: 'string',
      initialValue: 'What to expect:',
    }),
    defineField({
      name: 'expectations',
      title: 'Expectations',
      type: 'array',
      of: [{ type: 'string' }],
      initialValue: [
        'Your goals and challenges',
        'Whether AI/engineering fits',
        'Honest assessment of fit',
        'Suggested next steps',
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'schedulerUrl',
      title: 'Scheduler URL',
      type: 'url',
      description: 'External scheduler URL (e.g., Calendly). Leave empty to use NEXT_PUBLIC_BOOKING_URL env var.',
    }),
  ],
  preview: {
    select: {
      eyebrow: 'eyebrow',
      callTitle: 'callTitle',
      teamMember: 'teamMember.name',
    },
    prepare({ eyebrow, callTitle, teamMember }) {
      return {
        title: 'Booking',
        subtitle: `${eyebrow} - ${callTitle} with ${teamMember || 'Team Member'}`,
      }
    },
  },
})
