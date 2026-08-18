// @ts-check

import { loadEnv } from 'vite';
import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';
import react from '@astrojs/react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { apiVersion } from './apiVersion';

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
	process.env.NODE_ENV ?? 'development',
	process.cwd(),
	'',
);

// https://astro.build/config
export default defineConfig({
	integrations: [
		react(),
		sanity({
			projectId: PUBLIC_SANITY_PROJECT_ID,
			dataset: PUBLIC_SANITY_DATASET,
			apiVersion,
			useCdn: false,
		}),
	],
	vite: {
		plugins: [vanillaExtractPlugin()],
	},
});
