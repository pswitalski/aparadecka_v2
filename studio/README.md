# Sanity Studio — aparadecka_v2

Standalone Sanity Studio for the artist portfolio.

## Schema

- `painting` — artwork (title, year, medium, support, dimensions, mainImage)
- `collection` — yearly group of paintings (unique year, thumbnail, paintings)
- `home`, `about`, `contact` — page singletons (locked: fixed IDs, no duplicates/delete)
- `socialLink` — shared link object (label + url)

Studio structure is grouped by page: Home · About · Portfolio (Collections + Paintings) · Contact.

## Commands

- `npm run dev` — run the Studio locally
- `npm run build` — build the Studio
- `npm run typecheck` / `npm run lint` — CI checks
- `npx sanity schemas deploy` — deploy schema to Content Lake
- `npx sanity deploy` — deploy the hosted Studio
