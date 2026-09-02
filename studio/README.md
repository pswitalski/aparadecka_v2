# Sanity Studio — aparadecka_v2

Standalone Sanity Studio for the artist portfolio.

## Schema

- `painting` — artwork (title, medium, support, dimensions, mainImage). Created only inside a year collection.
- `collection` — yearly group (year collection) of paintings (unique year, thumbnail, paintings). The single place where paintings are added; a painting's year is the collection it lives in.
- `home`, `about`, `contact` — page singletons (locked: fixed IDs, no duplicates/delete)
- `socialLink` — shared link object (label + url)

### `aboutBlock` (used by `about.sections`)

Each About block = text + optional image + layout options:

- `text` — rich text: headings (h2/h3), big/normal/small sizes, bullet lists, bold/italic, links
- `highlighted` — white full-bleed background band instead of gray
- `image` — image with required `alt` and optional `title` caption; `alt`/`title` are read-only until an image is uploaded
- `textAlign` — left | center | right
- `imagePositionDesktop` — image on the left or right of the text (side-by-side, image column capped at ~30%)
- `imagePositionMobile` — image above or under the text (stacked on mobile)

Studio structure is grouped by page: Home · About · Portfolio (Collections) · Contact.

## Commands

- `npm run dev` — run the Studio locally
- `npm run build` — build the Studio
- `npm run typecheck` / `npm run lint` — CI checks
- `npx sanity schemas deploy` — deploy schema to Content Lake
- `npx sanity deploy` — deploy the hosted Studio
