import '@fontsource/caladea/400.css'
import '@fontsource/caladea/700.css'
import '@fontsource/calistoga/400.css'

import '../../../shared/tokens.css'
import '../../../shared/rich-text.css'

import type {ReactNode} from 'react'
import type {BlockDecoratorProps, BlockStyleProps} from 'sanity'

/*
 * These components render the Portable Text editor content with exactly the
 * tags and classes the published site emits, so `shared/rich-text.css` is the
 * single source of truth for both. Sanity renders a decorator/style `component`
 * live inside the editor, so an editor sees bold, headings and text sizes as
 * they apply them.
 *
 * The `.rich-text` wrapper has to live here, around the content we render,
 * rather than on the block form component: the editor draws its own blocks
 * under the theme font, so a wrapper placed above them gets overridden and the
 * editor ends up in Sanity's typeface instead of the site's.
 */

function RichText({children}: {children: ReactNode}) {
  return <div className="rich-text">{children}</div>
}

export function BoldDecorator({children}: BlockDecoratorProps) {
  return <strong>{children}</strong>
}

export function ItalicDecorator({children}: BlockDecoratorProps) {
  return <em>{children}</em>
}

export function BigTextStyle({children}: BlockStyleProps) {
  return (
    <RichText>
      <p className="big">{children}</p>
    </RichText>
  )
}

export function Heading2Style({children}: BlockStyleProps) {
  return (
    <RichText>
      <h2>{children}</h2>
    </RichText>
  )
}

export function Heading3Style({children}: BlockStyleProps) {
  return (
    <RichText>
      <h3>{children}</h3>
    </RichText>
  )
}

export function NormalTextStyle({children}: BlockStyleProps) {
  return (
    <RichText>
      <p>{children}</p>
    </RichText>
  )
}

export function SmallTextStyle({children}: BlockStyleProps) {
  return (
    <RichText>
      <p className="small">{children}</p>
    </RichText>
  )
}
