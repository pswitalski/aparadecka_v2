import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';
import { sanityClient } from 'sanity:client';

import { apiVersion } from '../../apiVersion';

export { apiVersion };

export const imageBuilder = createImageUrlBuilder(sanityClient);

export const IMAGE_WIDTHS = [320, 400, 480, 560, 640, 720, 800, 960, 1120, 1280, 1600, 2000];

interface ImageDimensions {
	height: number;
	width: number;
}

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

export function imageDimensionsFromRef(ref: string): ImageDimensions | null {
	const match = /-(\d+)x(\d+)-[a-z0-9]+$/.exec(ref);

	return match ? { height: Number(match[2]), width: Number(match[1]) } : null;
}
