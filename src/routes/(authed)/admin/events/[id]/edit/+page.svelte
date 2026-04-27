<script lang="ts">
	import { tick } from "svelte";
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { z } from "zod";
	import HubBackLink from "$lib/components/HubBackLink.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import { ArrowLeft, Upload, X } from "@lucide/svelte";
	import { createUploadThing } from "$lib/utils";
	import EventDateTimeField from "$lib/components/EventDateTimeField.svelte";
	import type { PageData } from "./$types.js";

	const { data }: { data: PageData } = $props();

	const editEventSchema = z.object({
		title: z.string().min(1, "Title is required").max(255, "Title is too long"),
		description: z.string().optional(),
		content: z.string().optional(),
		event_date: z.string().min(1, "Event date is required"),
		location: z.string().optional(),
		is_published: z.boolean().default(false),
		members_only: z.boolean().default(false),
		img: z.string().optional()
	});

	const { form, errors, enhance, submitting } = superForm(data.form, {
		validators: zodClient(editEventSchema)
	});

	// Image upload state
	let selectedImage = $state<File | null>(null);
	let imagePreview = $state<string | null>(null);
	let uploadedImageUrl = $state<string | null>(data.event.img);
	let uploadedImageKey = $state<string | null>(null);
	let currentImageUrl = $state<string | null>(data.event.img);
	let hasPendingImageUpload = $state(false);
	let formEl = $state<HTMLFormElement | null>(null);
	let hiddenSubmitEl = $state<HTMLButtonElement | null>(null);

	$effect(() => {
		$form.img = uploadedImageUrl ?? "";
	});

	async function deleteUploadedImage(fileRef: { url?: string | null; key?: string | null }) {
		if (!fileRef.url && !fileRef.key) return;
		try {
			await fetch("/api/uploadthing/delete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(fileRef)
			});
		} catch (error) {
			console.error("Failed to delete replaced image:", error);
		}
	}

	const { startUpload, isUploading } = createUploadThing("galleryImageUploader", {
		onUploadError: (error: Error) => {
			console.error("Upload failed:", error);
			alert(`Upload failed: ${error.message}`);
		}
	});

	function handleImageSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			selectedImage = file;
			hasPendingImageUpload = true;
			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				imagePreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	async function removeImage() {
		if (uploadedImageUrl && uploadedImageUrl !== currentImageUrl) {
			await deleteUploadedImage({ key: uploadedImageKey, url: uploadedImageUrl });
			uploadedImageUrl = currentImageUrl;
			uploadedImageKey = null;
			$form.img = currentImageUrl ?? "";
		}
		selectedImage = null;
		imagePreview = null;
		hasPendingImageUpload = false;
		// Reset file input
		const fileInput = document.getElementById("image-upload") as HTMLInputElement;
		if (fileInput) fileInput.value = "";
	}

	function removeCurrentImage() {
		currentImageUrl = null;
		uploadedImageUrl = null;
		uploadedImageKey = null;
		$form.img = "";
		hasPendingImageUpload = false;
	}

	async function uploadImage() {
		if (!selectedImage) return false;

		try {
			const res = await startUpload([selectedImage]);
			const file = res?.[0];
			const imageUrl = file?.serverData?.imageUrl ?? file?.ufsUrl ?? file?.url;
			const imageKey = file?.key;
			if (!imageUrl) return false;

			if (
				uploadedImageUrl &&
				uploadedImageUrl !== currentImageUrl &&
				uploadedImageUrl !== imageUrl
			) {
				await deleteUploadedImage({ key: uploadedImageKey, url: uploadedImageUrl });
			}

			uploadedImageUrl = imageUrl;
			uploadedImageKey = imageKey ?? null;
			$form.img = imageUrl;
			currentImageUrl = null;
			hasPendingImageUpload = false;
			return true;
		} catch (error) {
			console.error("Upload failed:", error);
			return false;
		}
	}

	async function handlePrimarySubmit() {
		if (hasPendingImageUpload) {
			const ok = await uploadImage();
			if (!ok || !uploadedImageUrl) return;
			$form.img = uploadedImageUrl;
			await tick();
		}

		formEl?.requestSubmit(hiddenSubmitEl ?? undefined);
	}
</script>

<svelte:head>
	<title>Edit Event - Island Beer Club Admin</title>
</svelte:head>

<div class="flex w-full min-w-0 flex-col gap-6">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div class="min-w-0">
			<h1 class="text-3xl font-bold">Edit Event</h1>
			<p class="text-muted-foreground mt-1">Update event information</p>
		</div>
		<HubBackLink href="/admin/events" size="sm" class="shrink-0 gap-2">
			<ArrowLeft class="h-4 w-4" />
			Back to Events
		</HubBackLink>
	</div>

	<Card class="ibc-hub-surface bg-card/50 dark:bg-card/35 mx-auto w-full max-w-2xl">
		<CardHeader>
			<CardTitle>Event Details</CardTitle>
			<CardDescription>Edit the information for this event</CardDescription>
		</CardHeader>
		<CardContent>
			<form bind:this={formEl} method="POST" use:enhance class="space-y-6">
				<input type="hidden" name="img" bind:value={$form.img} />

				<div class="space-y-2">
					<Label for="title">Title *</Label>
					<Input
						id="title"
						name="title"
						bind:value={$form.title}
						aria-invalid={$errors.title ? "true" : undefined}
						class={$errors.title ? "border-destructive" : ""}
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
					<p class="text-sm leading-none font-medium">
						Event date &amp; time <span class="text-destructive">*</span>
					</p>
					<EventDateTimeField
						id="event_date"
						name="event_date"
						bind:value={$form.event_date}
						aria-invalid={$errors.event_date ? "true" : undefined}
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
									{$isUploading ? "Uploading..." : "Upload Image"}
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
										onclick={() => document.getElementById("image-upload")?.click()}
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
									onclick={() => document.getElementById("image-upload")?.click()}
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
					<Button
						type="button"
						disabled={$submitting || $isUploading}
						onclick={handlePrimarySubmit}
					>
						{$submitting ? "Updating..." : $isUploading ? "Uploading..." : "Update Event"}
					</Button>
					<button bind:this={hiddenSubmitEl} type="submit" class="hidden" aria-hidden="true"
					></button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
