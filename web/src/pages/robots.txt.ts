import type { APIRoute } from 'astro';

import { siteUrl } from '../../siteUrl';

const isProduction = import.meta.env.PUBLIC_SITE_ENV === 'production';

export const GET: APIRoute = () => {
	const body = isProduction
		? `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap-index.xml\n`
		: `User-agent: *\nDisallow: /\n`;

	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
