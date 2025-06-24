<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Plus, Calendar, MapPin, Edit, Trash2 } from '@lucide/svelte';
	import type { PageData } from './$types.js';

	const { data }: { data: PageData } = $props();

	function formatDate(date: Date | null) {
		if (!date) return 'No date set';
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}
</script>

<svelte:head>
	<title>Events Management - Island Beer Club Admin</title>
</svelte:head>

<div class="container mx-auto py-8">
	<div class="mb-8 flex items-center justify-between space-x-3">
		<div>
			<h1 class="text-3xl font-bold">Events Management</h1>
			<p class="text-muted-foreground">Create and manage club events</p>
		</div>
		<Button href="/admin/events/create" class="gap-2">
			<Plus class="h-4 w-4" />
			Create Event
		</Button>
	</div>

	{#if data.events.length === 0}
		<Card>
			<CardContent class="flex min-h-[200px] flex-col items-center justify-center text-center">
				<Calendar class="text-muted-foreground mb-4 h-12 w-12" />
				<h3 class="mb-2 text-lg font-semibold">No events yet</h3>
				<p class="text-muted-foreground mb-4">Get started by creating your first event.</p>
				<Button href="/admin/events/create" class="gap-2">
					<Plus class="h-4 w-4" />
					Create Event
				</Button>
			</CardContent>
		</Card>
	{:else}
		<div class="grid gap-6">
			{#each data.events as event}
				<Card>
					<CardHeader>
						<div class="flex items-start justify-between">
							<div class="space-y-1">
								<CardTitle class="text-xl">{event.title}</CardTitle>
								{#if event.description}
									<CardDescription>{event.description}</CardDescription>
								{/if}
							</div>
							<div class="flex items-center gap-2">
								<Badge variant={event.is_published === 1 ? 'default' : 'secondary'}>
									{event.is_published === 1 ? 'Published' : 'Draft'}
								</Badge>
								<div class="flex gap-1">
									<Button
										href="/admin/events/{event.id}/edit"
										variant="outline"
										size="sm"
										class="gap-1"
									>
										<Edit class="h-3 w-3" />
										Edit
									</Button>
									<Dialog.Root>
										<Dialog.Trigger>
											<Button
												variant="outline"
												size="sm"
												class="text-destructive hover:bg-destructive hover:text-destructive-foreground gap-1"
											>
												<Trash2 class="h-3 w-3" />
												Delete
											</Button>
										</Dialog.Trigger>
										<Dialog.Content>
											<Dialog.Header>
												<Dialog.Title>Delete Event</Dialog.Title>
												<Dialog.Description>
													Are you sure you want to delete "{event.title}"? This action cannot be
													undone and will permanently remove the event from the system.
												</Dialog.Description>
											</Dialog.Header>
											<div class="flex justify-end gap-3 pt-6">
												<Dialog.Close>
													<Button variant="outline">Cancel</Button>
												</Dialog.Close>
												<form method="POST" action="?/delete" class="inline">
													<input type="hidden" name="eventId" value={event.id} />
													<Button type="submit" variant="destructive">Delete Event</Button>
												</form>
											</div>
										</Dialog.Content>
									</Dialog.Root>
								</div>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div class="text-muted-foreground space-y-2 text-sm">
							{#if event.event_date}
								<div class="flex items-center gap-2">
									<Calendar class="h-4 w-4" />
									{formatDate(event.event_date)}
								</div>
							{/if}
							{#if event.location}
								<div class="flex items-center gap-2">
									<MapPin class="h-4 w-4" />
									{event.location}
								</div>
							{/if}
						</div>
						{#if event.content}
							<div class="mt-4">
								<p class="line-clamp-3 text-sm">{event.content}</p>
							</div>
						{/if}
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</div>
