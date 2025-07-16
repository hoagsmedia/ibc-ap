<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Calendar, MapPin, Clock } from "@lucide/svelte";
	import type { PageData } from "./$types.js";

	const { data }: { data: PageData } = $props();

	function formatDate(date: Date | null) {
		if (!date) return "No date set";
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric"
		}).format(date);
	}

	function formatTime(date: Date | null) {
		if (!date) return "";
		return new Intl.DateTimeFormat("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		}).format(date);
	}

	function isUpcoming(date: Date | null) {
		if (!date) return false;
		return date > new Date();
	}

	function isPast(date: Date | null) {
		if (!date) return false;
		return date < new Date();
	}

	const upcomingEvents = $derived(
		data.events
			.filter((event) => event.event_date && isUpcoming(event.event_date))
			.sort((a, b) => new Date(a.event_date!).getTime() - new Date(b.event_date!).getTime()) // Sort upcoming events by date (earliest first)
	);
	const pastEvents = $derived(
		data.events
			.filter((event) => event.event_date && isPast(event.event_date))
			.sort((a, b) => new Date(b.event_date!).getTime() - new Date(a.event_date!).getTime()) // Sort past events by date (most recent first)
	);
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
	</div>

	{#if data.events.length === 0}
		<Card.Root class="mx-auto max-w-2xl">
			<Card.Content
				class="flex min-h-[300px] flex-col items-center justify-center py-12 text-center"
			>
				<Calendar class="text-muted-foreground mb-6 h-16 w-16" />
				<h3 class="mb-3 text-2xl font-semibold">No Events Yet</h3>
				<p class="text-muted-foreground text-lg">
					We're working on some exciting events! Check back soon for updates.
				</p>
			</Card.Content>
		</Card.Root>
	{:else if upcomingEvents.length === 0 && pastEvents.length === 0}
		<Card.Root class="mx-auto max-w-2xl">
			<Card.Content
				class="flex min-h-[300px] flex-col items-center justify-center py-12 text-center"
			>
				<Calendar class="text-muted-foreground mb-6 h-16 w-16" />
				<h3 class="mb-3 text-2xl font-semibold">No Scheduled Events</h3>
				<p class="text-muted-foreground text-lg">
					All events need dates to appear here. Check with the admin to ensure events have proper
					scheduling.
				</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<!-- Upcoming Events -->
		{#if upcomingEvents.length > 0}
			<section class="mb-12">
				<h2 class="mb-6 flex items-center gap-2 text-2xl font-bold">
					<Calendar class="h-6 w-6" />
					Upcoming Events
				</h2>
				<div class="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
					{#each upcomingEvents as event}
						<Card.Root class="flex h-full min-h-[300px] flex-col transition-shadow hover:shadow-lg">
							{#if event.img}
								<div class="-mt-6 overflow-hidden rounded-t-lg">
									<img src={event.img} alt={event.title} class="h-48 w-full object-cover" />
								</div>
							{/if}
							<Card.Header class={event.img ? "" : "rounded-t-lg"}>
								<div class="flex items-start justify-between">
									<div class="space-y-2">
										<Card.Title class="text-xl">{event.title}</Card.Title>
										{#if event.description}
											<Card.Description class="text-base">{event.description}</Card.Description>
										{/if}
									</div>
									<Badge variant="default" class="shrink-0">Upcoming</Badge>
								</div>
							</Card.Header>
							<Card.Content class="flex-1">
								<div class="space-y-3">
									<div class="flex items-center gap-3 text-sm">
										<Calendar class="text-primary h-4 w-4" />
										<span class="font-medium">{formatDate(event.event_date)}</span>
									</div>
									{#if formatTime(event.event_date)}
										<div class="flex items-center gap-3 text-sm">
											<Clock class="text-primary h-4 w-4" />
											<span>{formatTime(event.event_date)}</span>
										</div>
									{/if}
									{#if event.location}
										<div class="flex items-center gap-3 text-sm">
											<MapPin class="text-primary h-4 w-4" />
											<span>{event.location}</span>
										</div>
									{/if}
									{#if event.content}
										<div class="mt-4 border-t pt-4">
											<p class="text-sm leading-relaxed">{event.content}</p>
										</div>
									{/if}
								</div>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Past Events -->
		{#if pastEvents.length > 0}
			<section>
				<h2 class="mb-6 flex items-center gap-2 text-2xl font-bold">
					<Calendar class="h-6 w-6" />
					Past Events
				</h2>
				<div class="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
					{#each pastEvents as event}
						<Card.Root
							class={"flex h-full min-h-[250px] flex-col opacity-90 transition-shadow hover:shadow-lg"}
						>
							{#if event.img}
								<div class="-mt-6 overflow-hidden rounded-t-lg">
									<img src={event.img} alt={event.title} class="h-32 w-full object-cover" />
								</div>
							{/if}
							<Card.Header class={event.img ? "" : "rounded-t-lg"}>
								<div class="space-y-2">
									<Card.Title class="text-lg">{event.title}</Card.Title>
									{#if event.description}
										<Card.Description>{event.description}</Card.Description>
									{/if}
								</div>
							</Card.Header>
							<Card.Content class="flex-1">
								<div class="space-y-2">
									{#if event.event_date}
										<div class="text-muted-foreground flex items-center gap-2 text-sm">
											<Calendar class="h-4 w-4" />
											{formatDate(event.event_date)}
										</div>
									{/if}
									{#if event.location}
										<div class="text-muted-foreground flex items-center gap-2 text-sm">
											<MapPin class="h-4 w-4" />
											{event.location}
										</div>
									{/if}
									{#if event.content}
										<div class="mt-3 border-t pt-3">
											<p class="text-muted-foreground line-clamp-3 text-sm">{event.content}</p>
										</div>
									{/if}
								</div>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			</section>
		{/if}
	{/if}
</div>
