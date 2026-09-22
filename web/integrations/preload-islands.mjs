import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ISLAND_ENTRY_RE = /(?:component-url|renderer-url)="([^"]+\.js)"/g;
const MODULEPRELOAD_RE = /<link\b[^>]*\brel="modulepreload"[^>]*>/g;

async function findHtmlFiles(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const full = join(dir, entry.name);

		if (entry.isDirectory()) {
			files.push(...(await findHtmlFiles(full)));
		} else if (entry.name.endsWith('.html')) {
			files.push(full);
		}
	}

	return files;
}

function islandEntryNames(html, base) {
	const names = new Set();

	for (const match of html.matchAll(ISLAND_ENTRY_RE)) {
		names.add(base !== '/' && match[1].startsWith(base) ? match[1].slice(base.length) : match[1].replace(/^\//, ''));
	}

	return names;
}

/**
 * Astro emits islands as `<astro-island component-url renderer-url>` and lets the browser
 * discover their imports one hop at a time. This injects `<link rel="modulepreload">` for the
 * chunks the island scripts depend on, so those are fetched in parallel instead of serially.
 *
 * @returns {import('astro').AstroIntegration}
 */
export default function preloadIslands() {
	/** @type {Map<string, string[]>} */
	const importsByChunk = new Map();
	let base = '/';

	return {
		hooks: {
			'astro:build:done': async ({ dir, logger }) => {
				const root = fileURLToPath(dir);

				for (const file of await findHtmlFiles(root)) {
					const html = await readFile(file, 'utf8');

					if (!html.includes('<astro-island')) continue;

					const entries = islandEntryNames(html, base);
					const existing = new Set(html.match(MODULEPRELOAD_RE) ?? []);
					const dependencies = new Set();

					for (const entry of entries) {
						for (const dependency of importsByChunk.get(entry) ?? []) {
							if (!entries.has(dependency)) dependencies.add(dependency);
						}
					}

					const links = [...dependencies]
						.map((name) => `<link href="${base}${name}" rel="modulepreload">`)
						.filter((link) => !existing.has(link));

					if (links.length === 0) continue;

					await writeFile(file, html.replace('</head>', `${links.join('')}</head>`), 'utf8');
					logger.info(`preloaded ${links.length} island chunk(s) in ${relative(root, file)}`);
				}
			},
			'astro:config:setup': ({ config, updateConfig }) => {
				base = config.base;
				updateConfig({
					vite: {
						plugins: [
							{
								apply: 'build',
								generateBundle(_options, bundle) {
									for (const output of Object.values(bundle)) {
										if (output.type === 'chunk') {
											importsByChunk.set(output.fileName, output.imports);
										}
									}
								},
								name: 'preload-islands:capture-imports',
							},
						],
					},
				});
			},
		},
		name: 'preload-islands',
	};
}
