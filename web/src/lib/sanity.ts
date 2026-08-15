import { sanityClient } from 'sanity:client';
import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';
import { apiVersion } from '../../apiVersion';

export { apiVersion };

export const imageBuilder = createImageUrlBuilder(sanityClient);

export function urlForImage(source: SanityImageSource) {
	return imageBuilder.image(source);
}
