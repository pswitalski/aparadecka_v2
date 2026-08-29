import {HomeIcon} from '@sanity/icons/Home'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const home = defineType({
  fields: [
    defineField({
      hidden: true,
      initialValue: 'Strona główna',
      name: 'title',
      readOnly: true,
      title: 'Tytuł',
      type: 'string',
    }),
    defineField({
      description:
        'Strona główna pokazuje galerię obrazów. Pierwszy wybrany obraz jest duży (cały, z marginesami), ' +
        'kolejne 3 to miniatury (przycięte do proporcji 1,4), a dalsze rotują w miejscu miniaturek. ' +
        'Dodaj co najmniej 4 obrazy.',
      name: 'featured',
      of: [defineArrayMember({to: [{type: 'painting'}], type: 'reference'})],
      title: 'Wyróżnione obrazy',
      type: 'array',
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
  icon: HomeIcon,
  name: 'home',
  title: 'Strona główna',
  type: 'document',
})
