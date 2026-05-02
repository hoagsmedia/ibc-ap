<script lang="ts">
	import EventBrowseSections from "$lib/components/events/EventBrowseSections.svelte";
	import type { PageData } from "./$types.js";

	const { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Events - Island Beer Club</title>
	<meta name="description" content="Upcoming and past events for the Island Beer Club community." />
</svelte:head>

<div class="container mx-auto py-8">
	<div class="mb-8 text-center">
		<h1 class="mb-4 text-4xl font-bold">Club Events</h1>
		<p class="text-muted-foreground mx-auto max-w-2xl text-lg">
			Join us for exciting beer tastings, brewery tours, and community gatherings. Check out our
			upcoming events and relive the memories from past gatherings.
		</p>
		<p class="text-muted-foreground mx-auto mt-4 max-w-2xl text-sm">
			Members: sign in and open <span class="text-foreground font-medium">Events</span> in the member
			hub to see members-only listings and live data.
		</p>
	</div>

	<EventBrowseSections events={data.events} />
</div>
