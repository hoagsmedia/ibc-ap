import { dailyQuotes, wordOfTheDayList } from "$lib/data";
import type { PageLoad } from "./$types.js";

const fallbackOnThisDay = {
	year: new Date().getFullYear(),
	text: "Today’s beer history is taking a quick break. Check back later for another story."
};

export const load: PageLoad = async ({ fetch, setHeaders }) => {
	const response = await fetch("/api/on-this-day");

	setHeaders({
		age: response.headers.get("age") || "0",
		"cache-control": "public, max-age=86400"
	});

	let onThisDay = fallbackOnThisDay;
	if (response.ok) {
		try {
			onThisDay = await response.json();
		} catch (error) {
			console.error("Failed to parse 'On This Day' data:", error);
		}
	} else {
		console.error("Failed to fetch 'On This Day' data:", response.status, response.statusText);
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
		onThisDay
	};
};
