import type { SanityImageSource } from '@sanity/image-url';

export interface Painting {
	_id: string;
	title: string | null;
	year: number | null;
	medium: string | null;
	support: string | null;
	dimensions: string | null;
	mainImage: SanityImageSource | null;
}
