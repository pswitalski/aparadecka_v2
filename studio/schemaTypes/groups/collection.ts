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
      title: 'Rok',
      validation: (rule) =>
        rule.required().integer().min(1900).max(2100).custom(async (year, context) => {
          const client = context.getClient({apiVersion: '2026-08-14'})
          const id = context.document?._id?.replace(/^drafts\./, '')
          const existing = await client.fetch(
            `count(*[_type == "collection" && year == $year && _id != $id])`,
            {year, id},
          )
          return existing === 0 || 'Rocznik o tym roku już istnieje'
        }),
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
