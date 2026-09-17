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
const MOBILE_WIDTH = 800;
/* The carousel fills the screen below the mobile header, so its image box is portrait
   (about 412x667 at 412px wide) while the paintings are landscape. Without a crop here
   `object-fit: cover` upscales a 412x296 file 2.25x to fill it. */
const CAROUSEL_RATIO = 0.62;
const MOBILE_SRCSET_WIDTHS = [412, 640, 800, 960, 1120, 1280];

export function adaptPaintings(paintings: null | Painting[] | undefined): GalleryPainting[] {
	return (paintings ?? []).map((p) => ({
		caption: buildCaption(p),
		id: p._id,
		// Desktop thumbnails reuse the full-size `image` (1200w): each painting is a single
		// persistent element that morphs between the thumb and big slots, so it needs the
		// full-resolution source.
		image: p.mainImage ? imageUrl(p.mainImage, { width: IMAGE_WIDTH }) : '',
		mobile: p.mainImage ? imageUrl(p.mainImage, { ratio: CAROUSEL_RATIO, width: MOBILE_WIDTH }) : '',
		srcset: p.mainImage ? imageSrcSet(p.mainImage, { ratio: CAROUSEL_RATIO, widths: MOBILE_SRCSET_WIDTHS }) : '',
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
