import {ImageIcon} from '@sanity/icons/Image'
import {defineField, defineType} from 'sanity'

export const painting = defineType({
  fields: [
    defineField({
      name: 'title',
      title: 'Tytuł',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Rok',
      type: 'number',
      validation: (rule) => rule.integer().min(1900).max(2100),
    }),
    defineField({
      name: 'medium',
      title: 'Technika',
      type: 'string',
    }),
    defineField({
      name: 'support',
      title: 'Podłoże',
      type: 'string',
    }),
    defineField({
      name: 'dimensions',
      title: 'Wymiary',
      type: 'string',
    }),
    defineField({
      name: 'mainImage',
      title: 'Obraz',
      type: 'image',
      validation: (rule) => rule.required(),
    }),
  ],
  icon: ImageIcon,
  name: 'painting',
  title: 'Obraz',
  type: 'document',
})
