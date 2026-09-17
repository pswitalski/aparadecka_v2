import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';
import { sanityClient } from 'sanity:client';

import { apiVersion } from '../../apiVersion';

export { apiVersion };

export const imageBuilder = createImageUrlBuilder(sanityClient);

export const IMAGE_WIDTHS = [320, 480, 640, 800, 1024, 1280, 1600, 2000];

interface ImageUrlOptions {
	ratio?: number;
	width: number;
}

interface SrcSetOptions {
	ratio?: number;
	widths?: number[];
}

export function urlForImage(source: SanityImageSource) {
	return imageBuilder.image(source);
}

export function imageUrl(source: SanityImageSource, { ratio, width }: ImageUrlOptions): string {
	const builder = urlForImage(source)
		.width(width)
		.fit(ratio ? 'crop' : 'max')
		.format('webp');

	return (ratio ? builder.height(Math.round(width / ratio)) : builder).url();
}

export function imageSrcSet(source: SanityImageSource, { ratio, widths = IMAGE_WIDTHS }: SrcSetOptions = {}): string {
	return widths.map((width) => `${imageUrl(source, { ratio, width })} ${width}w`).join(', ');
}
