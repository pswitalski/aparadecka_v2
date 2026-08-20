import {collection} from './groups/collection'
import {painting} from './groups/painting'
import {about, aboutBlock} from './pages/about'
import {contact} from './pages/contact'
import {home} from './pages/home'
import {site} from './pages/site'
import {socialLink} from './shared/socialLink'

export const schemaTypes = [
  socialLink,
  painting,
  collection,
  home,
  about,
  aboutBlock,
  contact,
  site,
]
