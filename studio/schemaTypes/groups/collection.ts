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
      description:
        'Tu dodaje się obrazy dla tego roku. Każdy obraz należy tylko do jednego rocznika — jego rok wynika z rocznika, w którym się znajduje.',
      name: 'paintings',
      of: [defineArrayMember({to: [{type: 'painting'}], type: 'reference'})],
      title: 'Prace',
      type: 'array',
      validation: (rule) =>
        rule.custom(async (value, context) => {
          if (!value || value.length === 0) return true
          const client = context.getClient({apiVersion})
          const docId = context.document?._id ?? ''
          const baseId = docId.replace(/^drafts\./, '')
          const ownIds = [docId, baseId]
          const refs = (value as Array<{_ref?: string}>)
            .map((item) => item._ref)
            .filter((r): r is string => Boolean(r))
          if (refs.length === 0) return true
          const duplicates = await client.fetch(
            `count(*[_type == "collection" && !(_id in $ownIds) && references($refs)])`,
            {ownIds, refs},
          )
          return duplicates === 0 || 'Ten obraz został już dodany do innego rocznika'
        }),
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
