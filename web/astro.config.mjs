// @ts-check

import react from '@astrojs/react';
import sanity from '@sanity/astro';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import icon from 'astro-icon';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

import { apiVersion } from './apiVersion';

const { PUBLIC_SANITY_DATASET, PUBLIC_SANITY_PROJECT_ID } = loadEnv(
	process.env.NODE_ENV ?? 'development',
	process.cwd(),
	'',
);

// https://astro.build/config
export default defineConfig({
	integrations: [
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
	},
});
