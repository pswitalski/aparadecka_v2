import type {StructureResolver} from 'sanity/structure'

import {CogIcon} from '@sanity/icons/Cog'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {FolderIcon} from '@sanity/icons/Folder'
import {HomeIcon} from '@sanity/icons/Home'
import {ThLargeIcon} from '@sanity/icons/ThLarge'
import {UserIcon} from '@sanity/icons/User'

export const structure: StructureResolver = (S) => {
  const singleton = (id: string, title: string) =>
    S.document().schemaType(id).documentId(id).title(title)

  return S.list()
    .title('Treść')
    .items([
      S.listItem()
        .id('homePageGroup')
        .title('Strona główna')
        .icon(HomeIcon)
        .child(
          S.list()
            .title('Strona główna')
            .items([
              S.listItem()
                .id('home')
                .title('Strona główna')
                .icon(HomeIcon)
                .child(singleton('home', 'Strona główna')),
            ]),
        ),
      S.listItem()
        .id('aboutMeGroup')
        .title('O mnie')
        .icon(UserIcon)
        .child(
          S.list().title('O mnie').items([
            S.listItem()
              .id('about')
              .title('O mnie')
              .icon(UserIcon)
              .child(singleton('about', 'O mnie')),
          ]),
        ),
      S.listItem()
        .id('portfolioGroup')
        .title('Portfolio')
        .icon(ThLargeIcon)
        .child(
          S.list()
            .title('Portfolio')
            .items([
              S.listItem()
                .id('collection')
                .title('Roczniki')
                .icon(FolderIcon)
                .child(
                  S.documentList()
                    .schemaType('collection')
                    .id('collection')
                    .filter('_type == "collection"')
                    .defaultOrdering([{direction: 'desc', field: 'year'}]),
                ),
            ]),
        ),
      S.listItem()
        .id('contactGroup')
        .title('Kontakt')
        .icon(EnvelopeIcon)
        .child(
          S.list().title('Kontakt').items([
            S.listItem()
              .id('contact')
              .title('Kontakt')
              .icon(EnvelopeIcon)
              .child(singleton('contact', 'Kontakt')),
          ]),
        ),
      S.listItem()
        .id('settingsGroup')
        .title('Ustawienia')
        .icon(CogIcon)
        .child(
          S.list().title('Ustawienia').items([
            S.listItem()
              .id('site')
              .title('Ustawienia strony')
              .icon(CogIcon)
              .child(singleton('site', 'Ustawienia strony')),
          ]),
        ),
    ])
}
