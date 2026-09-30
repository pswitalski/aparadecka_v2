import type { APIRoute } from 'astro';

import { siteUrl } from '../../siteUrl';

const siteEnv = import.meta.env.PUBLIC_SITE_ENV;
const isPreview = siteEnv === 'preview';

if (siteEnv && !isPreview && siteEnv !== 'production') {
	console.warn(
		`[robots.txt] Unrecognized PUBLIC_SITE_ENV "${siteEnv}" — treating this build as production.`,
	);
}

export const GET: APIRoute = () => {
	const body = isPreview
		? `User-agent: *\nDisallow: /\n`
		: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap-index.xml\n`;

	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
