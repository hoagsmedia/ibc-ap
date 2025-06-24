<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { ArrowLeft } from '@lucide/svelte';
	import type { PageData } from './$types.js';

	const { data }: { data: PageData } = $props();

	const editEventSchema = z.object({
		title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
		description: z.string().optional(),
		content: z.string().optional(),
		event_date: z.string().optional(),
		location: z.string().optional(),
		is_published: z.boolean().default(false)
	});

	const { form, errors, enhance, submitting } = superForm(data.form, {
		validators: zodClient(editEventSchema)
	});
</script>

<svelte:head>
	<title>Edit Event - Island Beer Club Admin</title>
</svelte:head>

<div class="container mx-auto py-8">
	<div class="mb-8">
		<Button href="/admin/events" variant="ghost" class="mb-4 gap-2">
			<ArrowLeft class="h-4 w-4" />
			Back to Events
		</Button>
		<h1 class="text-3xl font-bold">Edit Event</h1>
		<p class="text-muted-foreground">Update event information</p>
	</div>

	<Card class="mx-auto w-full max-w-2xl">
		<CardHeader>
			<CardTitle>Event Details</CardTitle>
			<CardDescription>Edit the information for this event</CardDescription>
		</CardHeader>
		<CardContent>
			<form method="POST" use:enhance class="space-y-6">
				<div class="space-y-2">
					<Label for="title">Title *</Label>
					<Input
						id="title"
						name="title"
						bind:value={$form.title}
						aria-invalid={$errors.title ? 'true' : undefined}
						class={$errors.title ? 'border-destructive' : ''}
					/>
					{#if $errors.title}
						<p class="text-destructive text-sm">{$errors.title}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="description">Description</Label>
					<Input
						id="description"
						name="description"
						bind:value={$form.description}
						placeholder="Brief description of the event"
					/>
					{#if $errors.description}
						<p class="text-destructive text-sm">{$errors.description}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="event_date">Event Date & Time</Label>
					<Input
						id="event_date"
						name="event_date"
						type="datetime-local"
						bind:value={$form.event_date}
					/>
					{#if $errors.event_date}
						<p class="text-destructive text-sm">{$errors.event_date}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="location">Location</Label>
					<Input
						id="location"
						name="location"
						bind:value={$form.location}
						placeholder="Event location"
					/>
					{#if $errors.location}
						<p class="text-destructive text-sm">{$errors.location}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="content">Content</Label>
					<Textarea
						id="content"
						name="content"
						bind:value={$form.content}
						placeholder="Detailed description, agenda, or additional information"
						rows={6}
						class="resize-none"
					/>
					{#if $errors.content}
						<p class="text-destructive text-sm">{$errors.content}</p>
					{/if}
				</div>

				<div class="flex items-center space-x-2">
					<Checkbox id="is_published" name="is_published" bind:checked={$form.is_published} />
					<Label
						for="is_published"
						class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Published
					</Label>
				</div>

				<div class="flex justify-end gap-4">
					<Button type="button" variant="outline" href="/admin/events">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Updating...' : 'Update Event'}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
