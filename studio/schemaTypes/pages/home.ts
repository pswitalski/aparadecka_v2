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
      description:
        'Pierwszy obraz jest wyświetlany jako duży na stronie głównej (cały obraz z marginesami). ' +
        'Kolejne 3 obrazy pojawiają się jako miniatury (przycięte do proporcji 1,4, wyśrodkowane). ' +
        'Dodatkowe obrazy rotują w miejscu miniaturek. Zalecane: co najmniej 4 obrazy.',
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
