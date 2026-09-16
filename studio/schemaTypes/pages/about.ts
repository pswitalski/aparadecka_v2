import {BoldIcon} from '@sanity/icons/Bold'
import {ItalicIcon} from '@sanity/icons/Italic'
import {UserIcon} from '@sanity/icons/User'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {
  BigTextStyle,
  BoldDecorator,
  Heading2Style,
  Heading3Style,
  ItalicDecorator,
  NormalTextStyle,
  SmallTextStyle,
} from '../components/AboutTextRendering'

export const aboutBlock = defineType({
  fields: [
    defineField({
      name: 'text',
      of: [
        defineArrayMember({
          lists: [{title: 'Kropkowana', value: 'bullet'}],
          marks: {
            annotations: [
              {
                fields: [
                  {
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    validation: (rule) =>
                      rule.required().uri({scheme: ['http', 'https', 'mailto']}),
                  },
                ],
                name: 'link',
                title: 'Link',
                type: 'object',
              },
            ],
            decorators: [
              {component: BoldDecorator, icon: BoldIcon, title: 'Pogrubienie', value: 'bold'},
              {component: ItalicDecorator, icon: ItalicIcon, title: 'Kursywa', value: 'em'},
            ],
          },
          styles: [
            // Must stay first: Sanity uses the first defined style as the
            // default for new blocks, so this makes Enter create a paragraph.
            {component: NormalTextStyle, title: 'Standardowy tekst', value: 'normal'},
            {component: BigTextStyle, title: 'Większy tekst', value: 'big'},
            {component: SmallTextStyle, title: 'Mniejszy tekst', value: 'small'},
            {component: Heading2Style, title: 'Nagłówek 2', value: 'h2'},
            {component: Heading3Style, title: 'Nagłówek 3', value: 'h3'},
          ],
          type: 'block',
        }),
      ],
      title: 'Tekst',
      type: 'array',
    }),
    defineField({
      description: 'Włącz, jeśli blok ma mieć białe tło zamiast szarego.',
      initialValue: false,
      name: 'highlighted',
      title: 'Wyróżniony (białe tło)',
      type: 'boolean',
    }),
    defineField({
      description: 'Ustawienie obrazu obok tekstu na dużym ekranie.',
      hidden: ({parent}) => parent?.image == null,
      initialValue: 'left',
      name: 'imagePositionDesktop',
      options: {
        layout: 'radio',
        list: [
          {title: 'Lewa strona', value: 'left'},
          {title: 'Prawa strona', value: 'right'},
        ],
      },
      title: 'Położenie obrazu — komputer',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      description: 'Na małym ekranie obraz może znajdować się tylko nad lub pod tekstem.',
      hidden: ({parent}) => parent?.image == null,
      initialValue: 'above',
      name: 'imagePositionMobile',
      options: {
        layout: 'radio',
        list: [
          {title: 'Nad tekstem', value: 'above'},
          {title: 'Pod tekstem', value: 'under'},
        ],
      },
      title: 'Położenie obrazu — telefon',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      description: 'Wyrównanie treści tekstowej bloku.',
      initialValue: 'left',
      name: 'textAlign',
      options: {
        layout: 'radio',
        list: [
          {title: 'Do lewej', value: 'left'},
          {title: 'Do środka', value: 'center'},
          {title: 'Do prawej', value: 'right'},
        ],
      },
      title: 'Wyrównanie tekstu',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      fields: [
        defineField({
          description: 'Ważne dla dostępności i SEO',
          name: 'alt',
          readOnly: ({parent}) => parent?.asset == null,
          title: 'Tekst alternatywny',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          description: 'Opcjonalny widoczny opis wyświetlany pod obrazem',
          name: 'title',
          readOnly: ({parent}) => parent?.asset == null,
          title: 'Tytuł / opis pod obrazem',
          type: 'string',
        }),
      ],
      name: 'image',
      title: 'Obraz',
      type: 'image',
    }),
  ],
  name: 'aboutBlock',
  preview: {
    prepare({highlighted, image, text}) {
      const firstLine = text?.[0]?.children?.[0]?.text ?? 'Blok'
      return {
        media: image,
        title: `${highlighted ? '★ ' : ''}${firstLine}`,
      }
    },
    select: {highlighted: 'highlighted', image: 'image', text: 'text'},
  },
  title: 'Blok',
  type: 'object',
})

export const about = defineType({
  fields: [
    defineField({
      hidden: true,
      initialValue: 'O mnie',
      name: 'title',
      readOnly: true,
      title: 'Tytuł',
      type: 'string',
    }),
    defineField({
      description:
        "Edytuj stronę jako dowolną liczbę bloków. Każdy blok = tekst i opcjonalnie obraz. Położenie obrazu (komputer i telefon) oraz wyrównanie tekstu ustawiasz indywidualnie dla każdego bloku.   Alt obrazu jest wymagany. Tytuł to opcjonalny opis pod zdjęciem.",
      name: 'sections',
      of: [defineArrayMember({type: 'aboutBlock'})],
      title: 'Sekcje',
      type: 'array',
    }),
  ],
  icon: UserIcon,
  name: 'about',
  title: 'O mnie',
  type: 'document',
})
