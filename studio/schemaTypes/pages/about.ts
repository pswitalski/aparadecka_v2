import {defineArrayMember, defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons/User'

export const aboutBlock = defineType({
  name: 'aboutBlock',
  title: 'Blok',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Tekst',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({
      name: 'image',
      title: 'Obraz',
      type: 'image',
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Tekst alternatywny',
          description: 'Ważne dla dostępności i SEO',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'title',
          type: 'string',
          title: 'Tytuł / opis pod obrazem',
          description: 'Opcjonalny widoczny opis wyświetlany pod obrazem',
        }),
      ],
    }),
  ],
  preview: {
    select: {text: 'text', image: 'image'},
    prepare({text, image}) {
      const firstLine = text?.[0]?.children?.[0]?.text ?? 'Blok'
      return {title: firstLine, media: image}
    },
  },
})

export const about = defineType({
  name: 'about',
  title: 'O mnie',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Tytuł',
      readOnly: true,
      hidden: true,
      initialValue: 'O mnie',
    }),
    defineField({
      name: 'sections',
      title: 'Sekcje',
      description:
        "Edytuj stronę jako dowolną liczbę bloków. Każdy blok = tekst i opcjonalnie obraz. Bloki z obrazem układają się naprzemiennie: lewo, prawo, lewo.   Alt obrazu jest wymagany. Tytuł to opcjonalny opis pod zdjęciem.",
      type: 'array',
      of: [defineArrayMember({type: 'aboutBlock'})],
    }),
  ],
})
