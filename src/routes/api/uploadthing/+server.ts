import { env } from '$env/dynamic/private';
import { ourFileRouter } from '$lib/server/uploadthing';
import { createRouteHandler } from 'uploadthing/server';
import type { RequestEvent } from '@sveltejs/kit';

const handlers = createRouteHandler({
	router: ourFileRouter,
	config: {
		token: env.UPLOADTHING_TOKEN
	}
});

export async function GET(event: RequestEvent) {
	console.log('🔍 UploadThing GET request received:', {
		url: event.url.href,
		method: event.request.method,
		searchParams: Object.fromEntries(event.url.searchParams.entries()),
		headers: Object.fromEntries(event.request.headers.entries())
	});

	try {
		const result = await handlers(event.request);
		console.log('🔍 UploadThing GET response status:', result.status);

		// Log response body if it's small enough
		const responseText = await result.text();
		console.log('🔍 UploadThing GET response body:', responseText);

		// Return a new response with the same content
		return new Response(responseText, {
			status: result.status,
			statusText: result.statusText,
			headers: result.headers
		});
	} catch (error) {
		console.error('❌ UploadThing GET error:', error);
		throw error;
	}
}

export async function POST(event: RequestEvent) {
	console.log('🔍 UploadThing POST request received:', {
		url: event.url.href,
		method: event.request.method,
		searchParams: Object.fromEntries(event.url.searchParams.entries()),
		headers: Object.fromEntries(event.request.headers.entries())
	});

	try {
		const result = await handlers(event.request);
		console.log('🔍 UploadThing POST response status:', result.status);
		return result;
	} catch (error) {
		console.error('❌ UploadThing POST error:', error);
		throw error;
	}
}
