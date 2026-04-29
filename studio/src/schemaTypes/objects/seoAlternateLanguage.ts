import {defineField, defineType} from 'sanity'

export const seoAlternateLanguage = defineType({
  name: 'seoAlternateLanguage',
  title: 'Alternate Language',
  type: 'object',
  fields: [
    defineField({
      name: 'languageCode',
      title: 'Language Code',
      type: 'string',
      description:
        'BCP 47 language code for this alternate version, such as "en", "en-US", or "ro-RO".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Alternate URL',
      type: 'url',
      description:
        'Full absolute URL for the alternate-language version of this page.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isDefault',
      title: 'Default Locale Version',
      type: 'boolean',
      description:
        'Enable this if this alternate URL should be treated as the default locale version in hreflang output.',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'languageCode',
      subtitle: 'url',
    },
  },
})
