import {defineArrayMember, defineField, defineType} from 'sanity'

export const cookieSettings = defineType({
  name: 'cookieSettings',
  title: 'Cookie Settings',
  type: 'object',
  options: {
    collapsible: true,
    collapsed: false,
  },
  fields: [
    defineField({
      name: 'enabled',
      title: 'Enable Cookie Banner',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'bannerTitle',
      title: 'Initial Banner Title',
      type: 'string',
      initialValue: 'Cookies on Neovision',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bannerDescription',
      title: 'Initial Banner Description',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [],
          lists: [],
          marks: {
            decorators: [],
            annotations: [{type: 'link'}],
          },
        }),
      ],
      initialValue: [
        {
          _type: 'block',
          _key: 'cookie-banner-description-1',
          children: [
            {
              _type: 'span',
              _key: 'cookie-banner-description-1-span-1',
              text: 'We use cookies to make the site work, understand how it’s used, and measure performance of our marketing. You can accept all, reject non-essential, or choose what you’re comfortable with.',
              marks: [],
            },
          ],
          markDefs: [],
        },
        {
          _type: 'block',
          _key: 'cookie-banner-description-2',
          children: [
            {
              _type: 'span',
              _key: 'cookie-banner-description-2-span-1',
              text: 'Read our ',
              marks: [],
            },
            {
              _type: 'span',
              _key: 'cookie-banner-description-2-span-2',
              text: 'Cookie policy',
              marks: ['cookie-policy-link'],
            },
            {
              _type: 'span',
              _key: 'cookie-banner-description-2-span-3',
              text: ' and ',
              marks: [],
            },
            {
              _type: 'span',
              _key: 'cookie-banner-description-2-span-4',
              text: 'Privacy Policy',
              marks: ['privacy-policy-link'],
            },
            {
              _type: 'span',
              _key: 'cookie-banner-description-2-span-5',
              text: '.',
              marks: [],
            },
          ],
          markDefs: [
            {
              _key: 'cookie-policy-link',
              _type: 'link',
              linkType: 'href',
              href: 'https://example.com/cookie-policy',
              openInNewTab: false,
            },
            {
              _key: 'privacy-policy-link',
              _type: 'link',
              linkType: 'href',
              href: 'https://example.com/privacy-policy',
              openInNewTab: false,
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'preferencesTitle',
      title: 'Preferences Title',
      type: 'string',
      initialValue: 'Your cookie preferences',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'preferencesDescription',
      title: 'Preferences Description',
      type: 'text',
      rows: 3,
      initialValue:
        'Choose which cookies we can use. You can change these any time from the footer.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'acceptAllLabel',
      title: 'Accept All Label',
      type: 'string',
      initialValue: 'Accept All',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'initialSaveLabel',
      title: 'Initial Save Label',
      type: 'string',
      initialValue: 'Save',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'customizeLabel',
      title: 'Customize Label',
      type: 'string',
      initialValue: 'Customize',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rejectAllLabel',
      title: 'Reject All Label',
      type: 'string',
      initialValue: 'Reject All',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'savePreferencesLabel',
      title: 'Save Preferences Label',
      type: 'string',
      initialValue: 'Save my preferences',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'backLabel',
      title: 'Back Label',
      type: 'string',
      initialValue: 'Back',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'footerButtonLabel',
      title: 'Footer Button Label',
      type: 'string',
      initialValue: 'Cookie preferences',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Cookie Categories',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'required',
              title: 'Always Enabled',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'defaultEnabled',
              title: 'Enabled By Default',
              type: 'boolean',
              initialValue: false,
              hidden: ({parent}) => Boolean(parent?.required),
            }),
            defineField({
              name: 'lockedLabel',
              title: 'Locked Label',
              type: 'string',
              initialValue: 'Always on',
              hidden: ({parent}) => !parent?.required,
            }),
          ],
          preview: {
            select: {
              title: 'title',
              required: 'required',
              defaultEnabled: 'defaultEnabled',
            },
            prepare({title, required, defaultEnabled}) {
              return {
                title,
                subtitle: required
                  ? 'Always enabled'
                  : defaultEnabled
                    ? 'Enabled by default'
                    : 'Disabled by default',
              }
            },
          },
        }),
      ],
      initialValue: [
        {
          _type: 'object',
          _key: 'cookie-category-necessary',
          title: 'Strictly Necessary',
          description:
            'Required for the site to work. Session state, security, form submissions, and CSRF protection cannot be turned off.',
          required: true,
          defaultEnabled: true,
          lockedLabel: 'Always on',
        },
        {
          _type: 'object',
          _key: 'cookie-category-analytics',
          title: 'Analytics',
          description:
            'Helps us understand what visitors use, where journeys stall, and which content is performing best.',
          required: false,
          defaultEnabled: false,
          lockedLabel: 'Always on',
        },
        {
          _type: 'object',
          _key: 'cookie-category-marketing',
          title: 'Marketing',
          description:
            'Measures campaign performance and helps us understand which outreach and referral channels are working.',
          required: false,
          defaultEnabled: false,
          lockedLabel: 'Always on',
        },
      ],
      validation: (rule) => rule.min(1),
    }),
  ],
})
