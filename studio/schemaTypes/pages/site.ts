import {CogIcon} from '@sanity/icons/Cog'
import {defineField, defineType} from 'sanity'

export const site = defineType({
  fields: [
    defineField({
      hidden: true,
      initialValue: 'Ustawienia strony',
      name: 'title',
      readOnly: true,
      title: 'Tytuł',
      type: 'string',
    }),
    defineField({
      description:
        'Domyślny tytuł strony wyświetlany w karcie przeglądarki i wynikach wyszukiwania.',
      name: 'siteTitle',
      title: 'Tytuł strony (SEO)',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Opis strony',
      type: 'string',
    }),
    defineField({
      name: 'keywords',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
      title: 'Słowa kluczowe',
      type: 'array',
    }),
  ],
  icon: CogIcon,
  name: 'site',
  title: 'Ustawienia strony',
  type: 'document',
})
