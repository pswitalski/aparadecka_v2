import {defineField, defineType} from 'sanity'

export const socialLink = defineType({
  fields: [
    defineField({
      name: 'label',
      title: 'Tekst',
      type: 'string',
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https', 'mailto']}),
    }),
  ],
  name: 'socialLink',
  title: 'Link',
  type: 'object',
})
