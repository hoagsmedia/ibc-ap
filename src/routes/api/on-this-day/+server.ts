import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import type { RequestHandler } from "@sveltejs/kit";

interface WikimediaEvent {
	text: string;
	year: number;
}

let cachedEvent: { date: string; data: WikimediaEvent } | null = null;

export const GET: RequestHandler = async ({ fetch }) => {
	const today = new Date().toDateString().slice(0, 10);

	// Use cached data if it's available
	if (cachedEvent?.date === today) {
		if (dev) {
			console.log("[IBC-LOG] [api/on-this-day] Returning cached event", { date: today });
		}
		const { text, year } = cachedEvent.data;
		return new Response(JSON.stringify({ text, year }), {
			headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=86400" }
		});
	}

	// Fetch today's events from Wikimedia API
	const now = new Date();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");

	const wikimediaEmail = env.WIKIMEDIA_EMAIL;
	const wikimediaToken = env.WIKIMEDIA_ACCESS_TOKEN;
	if (!wikimediaEmail?.trim() || !wikimediaToken?.trim()) {
		console.error("on-this-day: WIKIMEDIA_EMAIL / WIKIMEDIA_ACCESS_TOKEN not configured");
		return new Response("Wikimedia API not configured", { status: 503 });
	}

	const response = await fetch(
		`https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${month}/${day}`,
		{
			headers: {
				Authorization: `Bearer ${wikimediaToken}`,
				"Api-User-Agent": `Island Beer Club App (${wikimediaEmail})`
			}
		}
	);

	if (dev) {
		console.log("[IBC-LOG] [api/on-this-day] Wikimedia API response", { status: response.status });
	}

	if (!response.ok) {
		console.error("Failed to fetch data from Wikimedia API", response.statusText);
		return new Response("Failed to fetch data", { status: response.status });
	}

	const data = await response.json();
	const firstEvent = Array.isArray(data.events) && data.events.length > 0 ? data.events[0] : null;

	// 💾 Cache the result for the day
	cachedEvent = {
		date: today,
		data: firstEvent
	};

	// extract only text and year from firstEvent
	if (!firstEvent) {
		return new Response("No event found", { status: 404 });
	}

	const { text, year } = firstEvent;
	return new Response(JSON.stringify({ text, year }), {
		headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=86400" }
	});
};
