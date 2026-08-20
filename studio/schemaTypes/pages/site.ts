import {defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'

export const site = defineType({
  name: 'site',
  title: 'Ustawienia strony',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Tytuł',
      readOnly: true,
      hidden: true,
      initialValue: 'Ustawienia strony',
    }),
    defineField({
      name: 'siteTitle',
      type: 'string',
      title: 'Tytuł strony (SEO)',
      description:
        'Domyślny tytuł strony wyświetlany w karcie przeglądarki i wynikach wyszukiwania.',
    }),
    defineField({
      name: 'description',
      type: 'string',
      title: 'Opis strony',
    }),
    defineField({
      name: 'keywords',
      type: 'array',
      title: 'Słowa kluczowe',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
  ],
})
