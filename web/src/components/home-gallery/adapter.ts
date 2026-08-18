import type { SanityImageSource } from '@sanity/image-url';
import { urlForImage } from '../../lib/sanity';
import type { Painting } from '../../lib/types';

export interface GalleryPainting {
	id: string;
	title: string | null;
	caption: string;
	image: string;
	mobile: string;
	srcset: string;
}

const IMAGE_WIDTH = 1200;
const MOBILE_WIDTH = 1024;
const SRCSET_WIDTHS = [480, 800, 1024, 1200];

function imageUrl(source: SanityImageSource | null, width: number): string {
	return source ? urlForImage(source).width(width).format('webp').url() : '';
}

function buildCaption(painting: Painting): string {
	if (!painting.title) return '';
	const details = [painting.year, painting.dimensions, painting.medium, painting.support]
		.filter(Boolean)
		.join(', ');
	return [`"${painting.title}"`, details].filter(Boolean).join(' ');
}

export function adaptPaintings(paintings: Painting[] | null | undefined): GalleryPainting[] {
	return (paintings ?? []).map((p) => ({
		id: p._id,
		title: p.title,
		caption: buildCaption(p),
		// Desktop thumbnails reuse the full-size `image` (1200w): each painting is a single
		// persistent element that morphs between the thumb and big slots, so it needs the
		// full-resolution source.
		image: imageUrl(p.mainImage, IMAGE_WIDTH),
		mobile: imageUrl(p.mainImage, MOBILE_WIDTH),
		srcset: p.mainImage ? SRCSET_WIDTHS.map((w) => `${imageUrl(p.mainImage, w)} ${w}w`).join(', ') : '',
	}));
}
