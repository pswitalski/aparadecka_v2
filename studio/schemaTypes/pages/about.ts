import {defineArrayMember, defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons/User'

export const about = defineType({
  name: 'about',
  title: 'O mnie',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'body',
      type: 'array',
      title: 'Treść',
      of: [defineArrayMember({type: 'block'}), defineArrayMember({type: 'image'})],
    }),
  ],
})
