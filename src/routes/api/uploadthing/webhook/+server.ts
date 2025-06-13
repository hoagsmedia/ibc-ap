import { type RequestEvent } from '@sveltejs/kit';
import { createRouteHandler } from 'uploadthing/server';
import { env } from '$env/dynamic/private';
import { ourFileRouter } from '$lib/server/uploadthing';

// Use the same route handler for webhooks
const handler = createRouteHandler({
	router: ourFileRouter,
	config: {
		token: env.UPLOADTHING_TOKEN
	}
});

export async function POST(event: RequestEvent) {
	console.log('🎯 UploadThing WEBHOOK POST received:', {
		url: event.url.href,
		method: event.request.method,
		searchParams: Object.fromEntries(event.url.searchParams.entries()),
		headers: Object.fromEntries(event.request.headers.entries())
	});

	try {
		const result = await handler(event.request);
		console.log('✅ UploadThing webhook processed successfully, status:', result.status);
		return result;
	} catch (error) {
		console.error('❌ UploadThing webhook error:', error);
		throw error;
	}
}
