// @ts-check

import { loadEnv } from 'vite';
import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';
import { apiVersion } from './apiVersion';

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
	process.env.NODE_ENV ?? 'development',
	process.cwd(),
	'',
);

// https://astro.build/config
export default defineConfig({
	integrations: [
		sanity({
			projectId: PUBLIC_SANITY_PROJECT_ID,
			dataset: PUBLIC_SANITY_DATASET,
			apiVersion,
			useCdn: false,
		}),
	],
});
