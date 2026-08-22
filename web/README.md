# web — Astro site

Astro site for the artist portfolio.

## Commands

- `npm run dev` — dev server
- `npm run build` — static build
- `npm run check` — `astro check` typecheck
- `npm run preview` — preview the built site

## About page

Renders the CMS `about.sections` blocks responsively:

- Desktop — image beside the text (left/right per block, image column ~30% of the content width)
- Mobile — image stacked above or under the text
- Highlighted blocks get a full-bleed white band that hugs the text
- Captions reveal on hover/focus on desktop, and are always visible on mobile
- Text-only blocks span the full content width with the chosen alignment
