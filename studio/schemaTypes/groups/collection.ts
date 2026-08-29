import {FolderIcon} from '@sanity/icons/Folder'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {apiVersion} from '../../apiVersion'

export const collection = defineType({
  fields: [
    defineField({
      name: 'year',
      title: 'Rok',
      type: 'number',
      validation: (rule) =>
        rule.required().integer().min(1900).max(2100).custom(async (year, context) => {
          const client = context.getClient({apiVersion})
          const id = context.document?._id?.replace(/^drafts\./, '')
          const existing = await client.fetch(
            `count(*[_type == "collection" && year == $year && _id != $id])`,
            {id, year},
          )
          return existing === 0 || `Rok ${year} już istnieje`
        }),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Wyróżniony obraz',
      to: [{type: 'painting'}],
      type: 'reference',
    }),
    defineField({
      name: 'paintings',
      of: [defineArrayMember({to: [{type: 'painting'}], type: 'reference'})],
      title: 'Prace',
      type: 'array',
    }),
  ],
  icon: FolderIcon,
  name: 'collection',
  preview: {
    prepare: ({year}) => ({title: String(year)}),
    select: {year: 'year'},
  },
  title: 'Rocznik',
  type: 'document',
})
