import {defineArrayMember, defineField, defineType} from 'sanity'
import {HomeIcon} from '@sanity/icons/Home'

export const home = defineType({
  name: 'home',
  title: 'Strona główna',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Tytuł',
      readOnly: true,
      hidden: true,
      initialValue: 'Strona główna',
    }),
    defineField({
      name: 'featured',
      type: 'array',
      title: 'Wyróżnione obrazy',
      description:
        'Strona główna pokazuje galerię obrazów. Pierwszy wybrany obraz jest duży (cały, z marginesami), ' +
        'kolejne 3 to miniatury (przycięte do proporcji 1,4), a dalsze rotują w miejscu miniaturek. ' +
        'Dodaj co najmniej 4 obrazy.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'painting'}]})],
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true
          if (value.length < 4) {
            return 'Dodaj co najmniej 4 obrazy, aby uzyskać pełny układ galerii.'
          }
          return true
        }).warning(),
    }),
  ],
})
