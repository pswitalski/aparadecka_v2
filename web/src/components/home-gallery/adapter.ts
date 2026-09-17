import type { Painting } from '../../lib/types';

import { imageSrcSet, imageUrl } from '../../lib/sanity';

export interface GalleryPainting {
	caption: string;
	id: string;
	image: string;
	mobile: string;
	srcset: string;
	title: null | string;
}

const IMAGE_WIDTH = 1200;
const MOBILE_WIDTH = 1024;
/* The carousel is hidden above 767px, but its first slide is eager, so a desktop browser
   still resolves `sizes="100vw"` against the full window. Capping the ladder here keeps that
   request at the same size it is today, instead of jumping to the 2000w top of the shared ladder. */
const MOBILE_SRCSET_WIDTHS = [320, 400, 480, 560, 640, 720, 800, 960, 1120];

export function adaptPaintings(paintings: null | Painting[] | undefined): GalleryPainting[] {
	return (paintings ?? []).map((p) => ({
		caption: buildCaption(p),
		id: p._id,
		// Desktop thumbnails reuse the full-size `image` (1200w): each painting is a single
		// persistent element that morphs between the thumb and big slots, so it needs the
		// full-resolution source.
		image: p.mainImage ? imageUrl(p.mainImage, { width: IMAGE_WIDTH }) : '',
		mobile: p.mainImage ? imageUrl(p.mainImage, { width: MOBILE_WIDTH }) : '',
		srcset: p.mainImage ? imageSrcSet(p.mainImage, { widths: MOBILE_SRCSET_WIDTHS }) : '',
		title: p.title,
	}));
}

function buildCaption(painting: Painting): string {
	if (!painting.title) return '';
	const details = [painting.year, painting.dimensions, painting.medium, painting.support]
		.filter(Boolean)
		.join(', ');
	return [`"${painting.title}"`, details].filter(Boolean).join(' ');
}
