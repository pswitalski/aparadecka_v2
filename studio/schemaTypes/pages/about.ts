import {defineArrayMember, defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons/User'
import {BoldIcon} from '@sanity/icons/Bold'
import {ItalicIcon} from '@sanity/icons/Italic'
import {makeTextStyle} from '../components/TextStylePreview'

export const aboutBlock = defineType({
  name: 'aboutBlock',
  title: 'Blok',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Tekst',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Nagłówek 2', value: 'h2'},
            {title: 'Nagłówek 3', value: 'h3'},
            {title: 'Większy tekst', value: 'big', component: makeTextStyle('18px')},
            {
              title: 'Standardowy tekst',
              value: 'normal',
              component: makeTextStyle('16px'),
            },
            {title: 'Mniejszy tekst', value: 'small', component: makeTextStyle('14px')},
          ],
          lists: [{title: 'Kropkowana', value: 'bullet'}],
          marks: {
            decorators: [
              {title: 'Pogrubienie', value: 'bold', icon: BoldIcon},
              {title: 'Kursywa', value: 'em', icon: ItalicIcon},
            ],
            annotations: [
              {
                title: 'Link',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (rule) =>
                      rule.uri({scheme: ['http', 'https', 'mailto']}),
                  },
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'highlighted',
      type: 'boolean',
      title: 'Wyróżniony (białe tło)',
      description: 'Włącz, jeśli blok ma mieć białe tło zamiast szarego.',
      initialValue: false,
    }),
    defineField({
      name: 'imagePositionDesktop',
      type: 'string',
      title: 'Położenie obrazu — komputer',
      description: 'Ustawienie obrazu obok tekstu na dużym ekranie.',
      options: {
        list: [
          {title: 'Lewa strona', value: 'left'},
          {title: 'Prawa strona', value: 'right'},
        ],
        layout: 'radio',
      },
      initialValue: 'left',
      validation: (rule) => rule.required(),
      hidden: ({parent}) => parent?.image == null,
    }),
    defineField({
      name: 'imagePositionMobile',
      type: 'string',
      title: 'Położenie obrazu — telefon',
      description: 'Na małym ekranie obraz może znajdować się tylko nad lub pod tekstem.',
      options: {
        list: [
          {title: 'Nad tekstem', value: 'above'},
          {title: 'Pod tekstem', value: 'under'},
        ],
        layout: 'radio',
      },
      initialValue: 'above',
      validation: (rule) => rule.required(),
      hidden: ({parent}) => parent?.image == null,
    }),
    defineField({
      name: 'textAlign',
      type: 'string',
      title: 'Wyrównanie tekstu',
      description: 'Wyrównanie treści tekstowej bloku.',
      options: {
        list: [
          {title: 'Do lewej', value: 'left'},
          {title: 'Do środka', value: 'center'},
          {title: 'Do prawej', value: 'right'},
        ],
        layout: 'radio',
      },
      initialValue: 'left',
      validation: (rule) => rule.required(),
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
          readOnly: ({parent}) => parent?.asset == null,
        }),
        defineField({
          name: 'title',
          type: 'string',
          title: 'Tytuł / opis pod obrazem',
          description: 'Opcjonalny widoczny opis wyświetlany pod obrazem',
          readOnly: ({parent}) => parent?.asset == null,
        }),
      ],
    }),
  ],
  preview: {
    select: {text: 'text', image: 'image', highlighted: 'highlighted'},
    prepare({text, image, highlighted}) {
      const firstLine = text?.[0]?.children?.[0]?.text ?? 'Blok'
      return {
        title: `${highlighted ? '★ ' : ''}${firstLine}`,
        media: image,
      }
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
        "Edytuj stronę jako dowolną liczbę bloków. Każdy blok = tekst i opcjonalnie obraz. Położenie obrazu (komputer i telefon) oraz wyrównanie tekstu ustawiasz indywidualnie dla każdego bloku.   Alt obrazu jest wymagany. Tytuł to opcjonalny opis pod zdjęciem.",
      type: 'array',
      of: [defineArrayMember({type: 'aboutBlock'})],
    }),
  ],
})
