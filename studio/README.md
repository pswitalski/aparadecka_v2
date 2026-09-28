# Sanity Studio — aparadecka_v2

Standalone Sanity Studio for the artist portfolio.

## Schema

Registered in `schemaTypes/index.ts`:

- `painting` — artwork (year, title, medium, support, dimensions, mainImage). Created only inside a year collection; its `year` is changed by moving it between collections with the custom `YearSelectInput`.
- `collection` — yearly group (year collection) of paintings (unique year, thumbnail, paintings). The single place where paintings are added; a painting's year is the collection it lives in.
- `home`, `about`, `contact`, `site` — page singletons (locked: fixed IDs, no duplicates/delete). `site` holds site-wide settings.
- `aboutBlock` — reusable block used by `about.sections` (see below).
- `socialLink` — shared link object (label + url), used by the contact page.
- `contactMessage` — contact-form submissions (the Studio's contact messages list), written by the web app's `/api/contact` Pages Function.
- `deploy.run` / `deploy.trigger` — **internal** deploy plumbing, not editor-facing. The Studio's deploy document actions create `deploy.trigger` to request a deploy; the `Deploy Web` workflow writes status back to `deploy.run.<branch>`, which the Studio reads.

### `aboutBlock` (used by `about.sections`)

Each About block = text + optional image + layout options:

- `text` — rich text: headings (h2/h3), big/normal/small sizes, bullet lists, bold/italic, links
- `highlighted` — white full-bleed background band instead of gray
- `image` — image with required `alt` and optional `title` caption; `alt`/`title` are read-only until an image is uploaded
- `textAlign` — left | center | right
- `imagePositionDesktop` — image on the left or right of the text (side-by-side, image column capped at ~30%)
- `imagePositionMobile` — image above or under the text (stacked on mobile)

### Custom inputs

`schemaTypes/components/` holds the custom field inputs:

- `AboutTextRendering` — rich-text decorator/style components (bold, italic, big/normal/small, h2/h3) that render editor content with the site's own typography, via `shared/rich-text.css`.
- `FeaturedImageInput` — restricts the collection's featured (thumbnail) painting to images already in that collection.
- `PaintingsArrayInput` — custom remove that confirms, then deletes the painting and its unused asset from Sanity.
- `YearSelectInput` — dropdown that moves a painting between year collections.

## Structure

Studio structure is grouped by page (the Studio UI labels are in Polish):

- **Home** → Home (`home`)
- **About** → About (`about`)
- **Portfolio** → Years (`collection`)
- **Contact** → Contact (`contact`), Messages (`contactMessage`)
- **Settings** → Site settings (`site`)

Singleton and delete/duplicate rules, plus the collection delete action and the deploy actions, are configured in `sanity.config.ts`.

## Commands

- `npm run dev` — run the Studio locally
- `npm run build` — build the Studio
- `npm run typecheck` / `npm run lint` — CI checks
- `npm run schema:extract` — extract schema to `schema.json`
- `npm run typegen` / `npm run types` — generate `../web/sanity.types.ts` (`types` = extract + typegen)
- `npm run start` — serve a built Studio locally
- `npx sanity schemas deploy` — deploy schema to Content Lake
- `npx sanity deploy` — deploy the hosted Studio
