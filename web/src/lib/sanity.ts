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

interface ImageRect {
	height: number;
	left: number;
	top: number;
	width: number;
}

interface ImageUrlOptions {
	ratio?: number;
	rect?: ImageRect;
	width: number;
}

interface SrcSetOptions {
	ratio?: number;
	rect?: ImageRect;
	widths?: number[];
}

export function urlForImage(source: SanityImageSource) {
	return imageBuilder.image(source);
}

export function imageUrl(source: SanityImageSource, { ratio, rect, width }: ImageUrlOptions): string {
	/* The builder returns a new instance from every call, so the rect has to stay in the chain. */
	const cropped = rect
		? urlForImage(source).rect(rect.left, rect.top, rect.width, rect.height)
		: urlForImage(source);
	const sized = cropped
		.width(width)
		.fit(ratio ? 'crop' : 'max')
		.format('webp');

	return (ratio ? sized.height(Math.round(width / ratio)) : sized).url();
}

export function imageSrcSet(
	source: SanityImageSource,
	{ ratio, rect, widths = IMAGE_WIDTHS }: SrcSetOptions = {},
): string {
	return widths.map((width) => `${imageUrl(source, { ratio, rect, width })} ${width}w`).join(', ');
}

export function imageDimensionsFromRef(ref: string): ImageDimensions | null {
	const match = /-(\d+)x(\d+)-[a-z0-9]+$/.exec(ref);

	return match ? { height: Number(match[2]), width: Number(match[1]) } : null;
}

export function imageDimensions(source: SanityImageSource): ImageDimensions | null {
	const ref = assetRefOf(source);

	return ref ? imageDimensionsFromRef(ref) : null;
}

/* An image can arrive as the asset id, a reference, or an image object wrapping either. */
function assetRefOf(source: SanityImageSource): null | string {
	if (typeof source === 'string') return source;
	if ('_ref' in source) return source._ref;
	if ('asset' in source) return assetRefOf(source.asset);

	return null;
}

/* The region a box actually shows, when the file we send is cropped to `sentRatio` and CSS
   then cover-crops it into a box of `displayRatio`. Cropping that same region here means the
   download contains nothing the browser throws away. */
export function displayedCropRect(
	dimensions: ImageDimensions,
	{ displayRatio, sentRatio }: { displayRatio: number; sentRatio: number },
): ImageRect {
	const sentWidth = Math.min(dimensions.width, Math.round(dimensions.height * sentRatio));
	const sentHeight = Math.round(sentWidth / sentRatio);
	const width = displayRatio <= 1 ? Math.round(sentHeight * displayRatio) : sentWidth;
	const height = Math.round(width / displayRatio);

	return {
		height,
		left: Math.round((dimensions.width - width) / 2),
		top: Math.round((dimensions.height - height) / 2),
		width,
	};
}
