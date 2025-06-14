import { type RequestEvent } from '@sveltejs/kit';
import { createRouteHandler } from 'uploadthing/server';
import { env } from '$env/dynamic/private';
import { ourFileRouter } from '$lib/server/uploadthing';

const handler = createRouteHandler({
	router: ourFileRouter,
	config: {
		token: env.UPLOADTHING_TOKEN
	}
});

export async function POST(event: RequestEvent) {
	return await handler(event.request);
}
