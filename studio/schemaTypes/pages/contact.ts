import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {defineField, defineType} from 'sanity'

export const contact = defineType({
  fields: [
    defineField({
      hidden: true,
      initialValue: 'Kontakt',
      name: 'title',
      readOnly: true,
      title: 'Tytuł',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'E-mail',
      type: 'socialLink',
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram',
      type: 'socialLink',
    }),
    defineField({
      name: 'facebook',
      title: 'Facebook',
      type: 'socialLink',
    }),
  ],
  icon: EnvelopeIcon,
  name: 'contact',
  title: 'Kontakt',
  type: 'document',
})
