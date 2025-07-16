import { wordOfTheDayList, dailyQuotes } from "$lib/data";
import type { PageLoad } from "./$types.js";

export const load: PageLoad = async ({ fetch, setHeaders }) => {
	const response = await fetch("/api/on-this-day");
	//console log the response headers for debugging
	console.log("Response Headers:", response.headers);

	setHeaders({
		age: response.headers.get("age") || "0",
		"cache-control": "public, max-age=86400" // Cache for 1 day
	});

	if (!response.ok) {
		console.error("Failed to fetch 'On This Day' data:", response.statusText);
	}
	const today = new Date();
	const dayOfYear = Math.floor(
		(today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
	);
	const wordOfTheDay = wordOfTheDayList[dayOfYear % wordOfTheDayList.length];
	const quoteOfTheDay = dailyQuotes[dayOfYear % dailyQuotes.length];

	return {
		wordOfTheDay,
		quoteOfTheDay,
		onThisDay: await response.json()
	};
};
