import type { SanityImageSource } from '@sanity/image-url';

export interface Painting {
	_id: string;
	dimensions: null | string;
	mainImage: null | SanityImageSource;
	medium: null | string;
	support: null | string;
	title: null | string;
	year: null | number;
}
