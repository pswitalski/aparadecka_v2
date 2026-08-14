import {defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons/Image'

export const painting = defineType({
  name: 'painting',
  title: 'Obraz',
  type: 'document',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Tytuł',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'year',
      type: 'number',
      title: 'Rok',
      validation: (rule) => rule.integer().min(1900).max(2100),
    }),
    defineField({
      name: 'medium',
      type: 'string',
      title: 'Technika',
    }),
    defineField({
      name: 'support',
      type: 'string',
      title: 'Podłoże',
    }),
    defineField({
      name: 'dimensions',
      type: 'string',
      title: 'Wymiary',
    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      title: 'Obraz',
      validation: (rule) => rule.required(),
    }),
  ],
})
