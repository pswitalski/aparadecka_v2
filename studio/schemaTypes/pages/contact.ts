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
      type: 'socialLink',
      title: 'E-mail',
    }),
    defineField({
      name: 'instagram',
      type: 'socialLink',
      title: 'Instagram',
    }),
    defineField({
      name: 'facebook',
      type: 'socialLink',
      title: 'Facebook',
    }),
  ],
})
