// @ts-check

import react from '@astrojs/react';
import sanity from '@sanity/astro';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import icon from 'astro-icon';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

import { apiVersion } from './apiVersion';
import preloadIslands from './integrations/preload-islands.mjs';

const { PUBLIC_SANITY_DATASET, PUBLIC_SANITY_PROJECT_ID } = loadEnv(
	process.env.NODE_ENV ?? 'development',
	process.cwd(),
	'',
);

// https://astro.build/config
export default defineConfig({
	integrations: [
		preloadIslands(),
		react(),
		sanity({
			apiVersion,
			dataset: PUBLIC_SANITY_DATASET,
			projectId: PUBLIC_SANITY_PROJECT_ID,
			useCdn: false,
		}),
		icon(),
	],
	vite: {
		plugins: [vanillaExtractPlugin()],
		server: {
			fs: {
				// `shared/rich-text.css` lives at the repo root, which is outside
				// Vite's default serving allow list (the workspace root is web/).
				allow: ['..'],
			},
		},
	},
});
