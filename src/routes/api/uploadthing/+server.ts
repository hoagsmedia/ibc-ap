import { env } from '$env/dynamic/private';
import { ourFileRouter } from '$lib/server/uploadthing';
import type { RequestEvent } from '@sveltejs/kit';
import { createRouteHandler } from 'uploadthing/server';

const handlers = createRouteHandler({
	router: ourFileRouter,
	config: {
		token: env.UPLOADTHING_TOKEN
	}
});

export async function GET(event: RequestEvent) {
	console.log('🔍 UploadThing GET request received:', {
		url: event.url.toString(),
		headers: Object.fromEntries(event.request.headers.entries()),
		hasVercelBypass: event.request.headers.has('x-vercel-protection-bypass')
	});
	return handlers(event.request);
}

export async function POST(event: RequestEvent) {
	console.log('🔍 UploadThing POST request received:', {
		url: event.url.toString(),
		headers: Object.fromEntries(event.request.headers.entries()),
		hasVercelBypass: event.request.headers.has('x-vercel-protection-bypass')
	});
	return handlers(event.request);
}
