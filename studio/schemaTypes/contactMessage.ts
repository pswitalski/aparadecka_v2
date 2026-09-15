import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {defineField, defineType} from 'sanity'

export const contactMessage = defineType({
  fields: [
    defineField({
      name: 'name',
      title: 'Imię',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'surname',
      title: 'Nazwisko',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'E-mail',
      type: 'email',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'message',
      rows: 5,
      title: 'Wiadomość',
      type: 'text',
      validation: (rule) => rule.required().max(2000),
    }),
    defineField({
      initialValue: () => new Date().toISOString(),
      name: 'createdAt',
      readOnly: true,
      title: 'Data utworzenia',
      type: 'datetime',
    }),
    defineField({
      initialValue: false,
      name: 'read',
      title: 'Przeczytane',
      type: 'boolean',
    }),
  ],
  icon: EnvelopeIcon,
  name: 'contactMessage',
  preview: {
    prepare({email, name, surname}) {
      return {
        subtitle: email,
        title: `${name ?? ''} ${surname ?? ''}`.trim() || email || 'Nowa wiadomość',
      }
    },
    select: {email: 'email', name: 'name', surname: 'surname'},
  },
  title: 'Wiadomość',
  type: 'document',
})
