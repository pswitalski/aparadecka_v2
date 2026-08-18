import type { SanityImageSource } from '@sanity/image-url';
import { urlForImage } from '../../lib/sanity';
import type { Painting } from '../../lib/types';

export interface GalleryPainting {
	id: string;
	title: string | null;
	caption: string;
	image: string;
	thumb: string;
	mobile: string;
	srcset: string;
}

const IMAGE_WIDTH = 1200;
const THUMB_WIDTH = 300;
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
		image: imageUrl(p.mainImage, IMAGE_WIDTH),
		thumb: imageUrl(p.mainImage, THUMB_WIDTH),
		mobile: imageUrl(p.mainImage, MOBILE_WIDTH),
		srcset: p.mainImage
			? SRCSET_WIDTHS.map((w) => `${urlForImage(p.mainImage!).width(w).format('webp').url()} ${w}w`).join(', ')
			: '',
	}));
}