import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

export const GET: RequestHandler = async () => {
	const dir = path.resolve('static/banner-travel');
	let files: string[] = [];
	try {
		files = (await fs.readdir(dir)).filter((f) => /\.(jpe?g)$/i.test(f));
	} catch {
		return new Response('[]', { status: 200 });
	}
	const urls = files.map((f) => `/banner-travel/${f}`);
	return new Response(JSON.stringify(urls), {
		headers: { 'Content-Type': 'application/json' }
	});
};
