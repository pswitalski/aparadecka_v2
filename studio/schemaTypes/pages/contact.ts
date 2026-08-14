import {defineField, defineType} from 'sanity'
import {EnvelopeIcon} from '@sanity/icons/Envelope'

export const contact = defineType({
  name: 'contact',
  title: 'Kontakt',
  type: 'document',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'email',
      type: 'object',
      title: 'E-mail',
      fields: [
        defineField({
          name: 'label',
          type: 'string',
          title: 'Tekst',
        }),
        defineField({
          name: 'url',
          type: 'url',
          title: 'URL',
          validation: (rule) => rule.uri({scheme: ['http', 'https', 'mailto']}),
        }),
      ],
    }),
    defineField({
      name: 'instagram',
      type: 'object',
      title: 'Instagram',
      fields: [
        defineField({
          name: 'label',
          type: 'string',
          title: 'Tekst',
        }),
        defineField({
          name: 'url',
          type: 'url',
          title: 'URL',
          validation: (rule) => rule.uri({scheme: ['http', 'https', 'mailto']}),
        }),
      ],
    }),
    defineField({
      name: 'facebook',
      type: 'object',
      title: 'Facebook',
      fields: [
        defineField({
          name: 'label',
          type: 'string',
          title: 'Tekst',
        }),
        defineField({
          name: 'url',
          type: 'url',
          title: 'URL',
          validation: (rule) => rule.uri({scheme: ['http', 'https', 'mailto']}),
        }),
      ],
    }),
  ],
})
