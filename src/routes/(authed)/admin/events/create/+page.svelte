<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';
	import HubBackLink from '$lib/components/HubBackLink.svelte';
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
	import { ArrowLeft, Upload, X } from '@lucide/svelte';
	import { createUploadThing } from '$lib/utils';
	import EventDateTimeField from '$lib/components/EventDateTimeField.svelte';
	import type { PageData } from './$types.js';

	const { data }: { data: PageData } = $props();

	const createEventSchema = z.object({
		title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
		description: z.string().optional(),
		content: z.string().optional(),
		event_date: z.string().min(1, 'Event date is required'),
		location: z.string().optional(),
		is_published: z.boolean().default(false),
		members_only: z.boolean().default(false),
		img: z.string().optional()
	});

	const { form, errors, enhance, submitting } = superForm(data.form, {
		validators: zodClient(createEventSchema)
	});

	// Image upload state
	let selectedImage = $state<File | null>(null);
	let imagePreview = $state<string | null>(null);
	let uploadedImageUrl = $state<string | null>(null);

	const { startUpload, isUploading } = createUploadThing('eventImageUploader', {
		onClientUploadComplete: (res) => {
			if (res?.[0]?.url) {
				uploadedImageUrl = res[0].url;
			}
		},
		onUploadError: (error: Error) => {
			console.error('Upload failed:', error);
			alert(`Upload failed: ${error.message}`);
		}
	});

	function handleImageSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			selectedImage = file;
			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				imagePreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	function removeImage() {
		selectedImage = null;
		imagePreview = null;
		uploadedImageUrl = null;
		// Reset file input
		const fileInput = document.getElementById('image-upload') as HTMLInputElement;
		if (fileInput) fileInput.value = '';
	}

	async function uploadImage() {
		if (!selectedImage) return;

		try {
			await startUpload([selectedImage]);
		} catch (error) {
			console.error('Upload failed:', error);
		}
	}
</script>

<svelte:head>
	<title>Create Event - Island Beer Club Admin</title>
</svelte:head>

<div class="container mx-auto max-w-full px-4 py-8">
	<div class="mb-8">
		<HubBackLink href="/admin/events" class="mb-4 gap-2">
			<ArrowLeft class="h-4 w-4" />
			Back to Events
		</HubBackLink>
		<h1 class="text-3xl font-bold">Create Event</h1>
		<p class="text-muted-foreground">Add a new event for the club</p>
	</div>

	<Card class="ibc-hub-surface bg-card/50 mx-auto w-full max-w-2xl dark:bg-card/35">
		<CardHeader>
			<CardTitle>Event Details</CardTitle>
			<CardDescription
				>Fill out the information for your new event. All fields are required.</CardDescription
			>
		</CardHeader>
		<CardContent>
			<form method="POST" use:enhance class="space-y-6">
				<!-- Hidden input for uploaded image URL -->
				{#if uploadedImageUrl}
					<input type="hidden" name="img" value={uploadedImageUrl} />
				{/if}

				<div class="space-y-2">
					<Label for="title">Title <span class="text-destructive">*</span></Label>
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
					<Label for="description">Description <span class="text-destructive">*</span></Label>
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
					<p class="text-sm leading-none font-medium">
						Event date &amp; time <span class="text-destructive">*</span>
					</p>
					<EventDateTimeField
						id="event_date"
						name="event_date"
						bind:value={$form.event_date}
						aria-invalid={$errors.event_date ? 'true' : undefined}
					/>
					{#if $errors.event_date}
						<p class="text-destructive text-sm">{$errors.event_date}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="location">Location <span class="text-destructive">*</span></Label>
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
					<Label for="content">Content <span class="text-destructive">*</span></Label>
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

				<!-- Event Banner Image Upload -->
				<div class="space-y-2">
					<Label>Event Banner Image</Label>
					<div class="space-y-4">
						{#if imagePreview}
							<div class="relative">
								<img
									src={imagePreview}
									alt="Event banner preview"
									class="h-48 w-full rounded-lg border object-cover"
								/>
								<Button
									type="button"
									variant="destructive"
									size="sm"
									class="absolute top-2 right-2"
									onclick={removeImage}
								>
									<X class="h-4 w-4" />
								</Button>
							</div>
							{#if !uploadedImageUrl}
								<Button type="button" onclick={uploadImage} disabled={$isUploading} class="w-full">
									{$isUploading ? 'Uploading...' : 'Upload Banner Image'}
								</Button>
							{:else}
								<p class="text-sm text-green-600">✓ Image uploaded successfully</p>
							{/if}
						{:else}
							<div class="rounded-lg border-2 border-dashed border-gray-300 p-6">
								<div class="text-center">
									<Upload class="mx-auto mb-2 h-8 w-8 text-gray-400" />
									<p class="mb-2 text-sm text-gray-600">Choose an event banner image</p>
									<Input
										id="image-upload"
										type="file"
										accept="image/*"
										class="hidden"
										onchange={handleImageSelect}
									/>
									<Button
										type="button"
										variant="outline"
										onclick={() => document.getElementById('image-upload')?.click()}
									>
										Select Image
									</Button>
								</div>
							</div>
						{/if}
					</div>
				</div>

				<div class="flex items-center space-x-2">
					<Checkbox id="is_published" name="is_published" bind:checked={$form.is_published} />
					<Label
						for="is_published"
						class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Publish immediately
					</Label>
				</div>

				<div class="flex items-center space-x-2">
					<Checkbox id="members_only" name="members_only" bind:checked={$form.members_only} />
					<Label
						for="members_only"
						class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Members only (hide from public /events until signed in as a member)
					</Label>
				</div>

				<div class="flex justify-end gap-4">
					<Button type="button" variant="outline" href="/admin/events">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Creating...' : 'Create Event'}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
