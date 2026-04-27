import type { RequestHandler } from '@sveltejs/kit';
import galleryFilenames from 'virtual:gallery-banner-travel-files';

export const GET: RequestHandler = async () => {
	const urls = [...galleryFilenames].map((f) => `/banner-travel/${f}`);
	return new Response(JSON.stringify(urls), {
		headers: { 'Content-Type': 'application/json' }
	});
};
