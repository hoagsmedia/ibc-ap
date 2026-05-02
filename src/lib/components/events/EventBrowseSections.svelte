<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Calendar, MapPin, Clock } from "@lucide/svelte";
	import type { Event } from "$lib/server/db/schema.js";

	let { events, showAccessLegend = false }: { events: Event[]; showAccessLegend?: boolean } =
		$props();

	/** Public / open events — cool accent. Members-only — warm accent. */
	function eventCardFrameClass(membersOnly: boolean | null | undefined) {
		if (membersOnly) {
			return "rounded-xl border-2 border-amber-500/45 bg-card shadow-sm ring-1 ring-amber-500/15 transition-shadow hover:shadow-md dark:border-amber-400/40 dark:ring-amber-400/10";
		}
		return "rounded-xl border-2 border-sky-500/40 bg-card shadow-sm ring-1 ring-sky-500/15 transition-shadow hover:shadow-md dark:border-sky-400/35 dark:ring-sky-400/10";
	}

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
		events
			.filter((event) => event.event_date && isUpcoming(event.event_date))
			.sort((a, b) => new Date(a.event_date!).getTime() - new Date(b.event_date!).getTime())
	);
	const pastEvents = $derived(
		events
			.filter((event) => event.event_date && isPast(event.event_date))
			.sort((a, b) => new Date(b.event_date!).getTime() - new Date(a.event_date!).getTime())
	);
</script>

{#if events.length === 0}
	<Card.Root class="mx-auto max-w-2xl">
		<Card.Content class="flex min-h-[300px] flex-col items-center justify-center py-12 text-center">
			<Calendar class="text-muted-foreground mb-6 h-16 w-16" />
			<h3 class="mb-3 text-2xl font-semibold">No Events Yet</h3>
			<p class="text-muted-foreground text-lg">
				We're working on some exciting events! Check back soon for updates.
			</p>
		</Card.Content>
	</Card.Root>
{:else if upcomingEvents.length === 0 && pastEvents.length === 0}
	<Card.Root class="mx-auto max-w-2xl">
		<Card.Content class="flex min-h-[300px] flex-col items-center justify-center py-12 text-center">
			<Calendar class="text-muted-foreground mb-6 h-16 w-16" />
			<h3 class="mb-3 text-2xl font-semibold">No Scheduled Events</h3>
			<p class="text-muted-foreground text-lg">
				All events need dates to appear here. Check with the admin to ensure events have proper
				scheduling.
			</p>
		</Card.Content>
	</Card.Root>
{:else}
	{#if upcomingEvents.length > 0}
		<section class="mb-12">
			<h2 class="mb-6 flex items-center gap-2 text-2xl font-bold">
				<Calendar class="h-6 w-6" />
				Upcoming Events
			</h2>
			{#if showAccessLegend}
				<p class="text-muted-foreground mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
					<span class="inline-flex items-center gap-2">
						<span
							class="inline-block size-3 rounded-sm border-2 border-sky-500/50 ring-1 ring-sky-500/20"
						></span>
						Open to everyone
					</span>
					<span class="inline-flex items-center gap-2">
						<span
							class="inline-block size-3 rounded-sm border-2 border-amber-500/50 ring-1 ring-amber-500/20"
						></span>
						Members only
					</span>
				</p>
			{/if}
			<div class="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
				{#each upcomingEvents as event (event.id)}
					<Card.Root
						class="flex h-full min-h-[300px] flex-col {eventCardFrameClass(event.members_only)}"
					>
						{#if event.img}
							<div class="-mt-6 overflow-hidden rounded-t-lg">
								<img src={event.img} alt={event.title} class="h-48 w-full object-cover" />
							</div>
						{/if}
						<Card.Header class={event.img ? "" : "rounded-t-lg"}>
							<div class="flex items-start justify-between gap-2">
								<div class="space-y-2">
									<Card.Title class="text-xl">{event.title}</Card.Title>
									{#if event.description}
										<Card.Description class="text-base">{event.description}</Card.Description>
									{/if}
								</div>
								<div class="flex shrink-0 flex-col items-end gap-1">
									<Badge variant="default">Upcoming</Badge>
									{#if event.members_only}
										<Badge variant="secondary">Members only</Badge>
									{/if}
								</div>
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

	{#if pastEvents.length > 0}
		<section>
			<h2 class="mb-6 flex items-center gap-2 text-2xl font-bold">
				<Calendar class="h-6 w-6" />
				Past Events
			</h2>
			<div class="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
				{#each pastEvents as event (event.id)}
					<Card.Root
						class="flex h-full min-h-[250px] flex-col opacity-90 {eventCardFrameClass(
							event.members_only
						)}"
					>
						{#if event.img}
							<div class="-mt-6 overflow-hidden rounded-t-lg">
								<img src={event.img} alt={event.title} class="h-32 w-full object-cover" />
							</div>
						{/if}
						<Card.Header class={event.img ? "" : "rounded-t-lg"}>
							<div class="flex items-start justify-between gap-2">
								<div class="space-y-2">
									<Card.Title class="text-lg">{event.title}</Card.Title>
									{#if event.description}
										<Card.Description>{event.description}</Card.Description>
									{/if}
								</div>
								{#if event.members_only}
									<Badge variant="secondary" class="shrink-0">Members only</Badge>
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
