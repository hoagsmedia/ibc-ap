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
	import { ArrowLeft, Upload, X } from '@lucide/svelte';
	import { createUploadThing } from '$lib/utils';
	import type { PageData } from './$types.js';

	const { data }: { data: PageData } = $props();

	const editEventSchema = z.object({
		title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
		description: z.string().optional(),
		content: z.string().optional(),
		event_date: z.string().min(1, 'Event date is required'),
		location: z.string().optional(),
		is_published: z.boolean().default(false),
		img: z.string().optional()
	});

	const { form, errors, enhance, submitting } = superForm(data.form, {
		validators: zodClient(editEventSchema)
	});

	// Image upload state
	let selectedImage = $state<File | null>(null);
	let imagePreview = $state<string | null>(null);
	let uploadedImageUrl = $state<string | null>(data.event.img);
	let currentImageUrl = $state<string | null>(data.event.img);

	const { startUpload, isUploading } = createUploadThing('eventImageUploader', {
		onClientUploadComplete: (res) => {
			if (res?.[0]?.url) {
				uploadedImageUrl = res[0].url;
				currentImageUrl = null; // Remove the old image display
			}
		},
		onUploadError: (error: Error) => {
			console.error('Upload failed:', error);
			alert(`Upload failed: ${error.message}`);
		},
		onUploadBegin: () => {
			console.log('Upload starting...');
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
		// Reset file input
		const fileInput = document.getElementById('image-upload') as HTMLInputElement;
		if (fileInput) fileInput.value = '';
	}

	function removeCurrentImage() {
		currentImageUrl = null;
		uploadedImageUrl = null;
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
				<!-- Hidden input for uploaded image URL -->
				{#if uploadedImageUrl}
					<input type="hidden" name="img" value={uploadedImageUrl} />
				{/if}

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
					<Label for="event_date">Event Date & Time <span class="text-destructive">*</span></Label>
					<Input
						id="event_date"
						name="event_date"
						type="datetime-local"
						bind:value={$form.event_date}
						required
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

				<!-- Event Banner Image Upload -->
				<div class="space-y-2">
					<Label>Event Banner Image</Label>
					<div class="space-y-4">
						{#if currentImageUrl}
							<div class="relative">
								<img
									src={currentImageUrl}
									alt="Current event banner"
									class="h-48 w-full rounded-lg border object-cover"
								/>
								<Button
									type="button"
									variant="destructive"
									size="sm"
									class="absolute top-2 right-2"
									onclick={removeCurrentImage}
								>
									<X class="h-4 w-4" />
								</Button>
								<div
									class="bg-opacity-60 absolute bottom-2 left-2 rounded bg-black px-2 py-1 text-sm text-white"
								>
									Current Image
								</div>
							</div>
						{/if}

						{#if imagePreview}
							<div class="relative">
								<img
									src={imagePreview}
									alt="New event banner preview"
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
								<div
									class="bg-opacity-60 absolute bottom-2 left-2 rounded bg-black px-2 py-1 text-sm text-white"
								>
									New Image
								</div>
							</div>
							{#if !uploadedImageUrl}
								<Button type="button" onclick={uploadImage} disabled={$isUploading} class="w-full">
									{$isUploading ? 'Uploading...' : 'Upload New Banner Image'}
								</Button>
							{:else}
								<p class="text-sm text-green-600">✓ New image uploaded successfully</p>
							{/if}
						{:else if !currentImageUrl}
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
						{:else}
							<div class="flex justify-center">
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
									class="gap-2"
								>
									<Upload class="h-4 w-4" />
									Change Banner Image
								</Button>
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
