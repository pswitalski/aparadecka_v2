import {defineArrayMember, defineField, defineType} from 'sanity'
import {FolderIcon} from '@sanity/icons/Folder'

export const collection = defineType({
  name: 'collection',
  title: 'Rocznik',
  type: 'document',
  icon: FolderIcon,
  preview: {
    select: {year: 'year'},
    prepare: ({year}) => ({title: String(year)}),
  },
  fields: [
    defineField({
      name: 'year',
      type: 'number',
      title: 'Rocznik',
      validation: (rule) => rule.required().integer().min(1900).max(2100),
    }),
    defineField({
      name: 'thumbnail',
      type: 'reference',
      title: 'Wyróżniony obraz',
      to: [{type: 'painting'}],
    }),
    defineField({
      name: 'paintings',
      type: 'array',
      title: 'Prace',
      of: [defineArrayMember({type: 'reference', to: [{type: 'painting'}]})],
    }),
  ],
})
