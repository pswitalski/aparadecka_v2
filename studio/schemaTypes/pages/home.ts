import {defineArrayMember, defineField, defineType} from 'sanity'
import {HomeIcon} from '@sanity/icons/Home'

export const home = defineType({
  name: 'home',
  title: 'Strona główna',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'featured',
      type: 'array',
      title: 'Wyróżnione obrazy',
      of: [defineArrayMember({type: 'reference', to: [{type: 'painting'}]})],
    }),
  ],
})
