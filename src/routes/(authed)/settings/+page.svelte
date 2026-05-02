<script lang="ts">
	import { createUploadThing } from "$lib/utils";
	import type { PageData } from "./$types";
	import Avatar from "$lib/components/Avatar.svelte";
	import * as Card from "$lib/components/ui/card";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import ProfileForm from "./profile-form.svelte";
	import UpdatePasswordForm from "./update-password-form.svelte";
	import { Trash2 } from "@lucide/svelte";
	import MemberHubPageHeader from "$lib/components/MemberHubPageHeader.svelte";

	let { data }: { data: PageData } = $props();
	let uploading = $state(false);
	let deleteImageDialogOpen = $state(false);
	let deletingImage = $state(false);

	// Create UploadThing helper
	const { startUpload } = createUploadThing("profileImageUploader", {
		onClientUploadComplete: () => {
			uploading = false;
			// Refresh the page to show the new image
			window.location.reload();
		},
		onUploadError: (error: Error) => {
			uploading = false;
			alert(`Upload failed: ${error.message}`);
		},
		onUploadBegin: () => {
			uploading = true;
		}
	});

	let fileInput = $state<HTMLInputElement | null>(null);

	function handleUploadClick() {
		if (fileInput) {
			fileInput.click();
		}
	}

	async function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;
		if (files && files.length > 0) {
			try {
				await startUpload(Array.from(files));
			} catch {
				uploading = false;
			}
		}
	}

	async function confirmDeleteProfileImage() {
		deletingImage = true;
		try {
			const response = await fetch("/api/profile-image/delete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({})
			});

			if (!response.ok) {
				const data = (await response.json().catch(() => ({}))) as { message?: string };
				throw new Error(data.message || "Failed to delete profile image");
			}

			window.location.reload();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete profile image";
			alert(message);
			deletingImage = false;
		}
	}
</script>

<svelte:head>
	<title>Settings | Island Beer Club</title>
	<meta name="description" content="Update your profile settings" />
</svelte:head>

<div class="mx-auto w-full max-w-2xl">
	<MemberHubPageHeader
		title="Profile Settings"
		description="Update your profile information and upload a profile image."
	/>

	<div class="space-y-8">
		<!-- Profile Image Section (Admins only) -->
		{#if data.user.role === "admin"}
			<Card.Root class="ibc-hub-surface bg-card/50 dark:bg-card/35 rounded-lg p-6 shadow-sm">
				<Card.Content class="flex flex-col items-center justify-center gap-4 py-6">
					<Avatar
						class="border-primary size-32 rounded-full border-4 shadow"
						name={data.user.name}
						img={data.user.img ?? undefined}
					/>
					<div class="text-center">
						<div class="text-card-foreground text-lg font-semibold">{data.user.name}</div>
						{#if data.user.email ?? data.user.username}
							<div class="text-muted-foreground text-sm">
								{data.user.email ?? data.user.username}
							</div>
						{/if}
					</div>
					<div class="w-full max-w-xs">
						<label
							for="profile-image-upload"
							class="text-card-foreground mb-2 block text-left text-sm font-medium"
						>
							Upload new profile image
						</label>
						<div
							class="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400"
						>
							{#if uploading}
								<div class="flex items-center justify-center">
									<div class="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
									<span class="text-muted-foreground ml-3 text-sm">Uploading...</span>
								</div>
							{:else}
								<input
									bind:this={fileInput}
									id="profile-image-upload"
									type="file"
									accept="image/*"
									onchange={handleFileChange}
									class="hidden"
								/>
								<div class="flex flex-wrap justify-center gap-2">
									<Button onclick={handleUploadClick} type="button">Choose Image</Button>
									{#if data.user.img}
										<Button
											variant="destructive"
											type="button"
											onclick={() => (deleteImageDialogOpen = true)}
										>
											<Trash2 class="size-4" />
											Delete Image
										</Button>
									{/if}
								</div>
							{/if}
						</div>
						<p class="text-muted-foreground mt-1 text-xs">PNG, JPG, GIF up to 8MB</p>
					</div>
				</Card.Content>
			</Card.Root>
		{:else}
			<Card.Root class="ibc-hub-surface bg-card/50 dark:bg-card/35 rounded-lg p-6 shadow-sm">
				<Card.Content class="flex flex-col items-center justify-center gap-4 py-6">
					<Avatar
						class="border-primary size-32 rounded-full border-4 shadow"
						name={data.user.name}
						img={data.user.img ?? undefined}
					/>
					<div class="text-center">
						<div class="text-card-foreground text-lg font-semibold">{data.user.name}</div>
						{#if data.user.email ?? data.user.username}
							<div class="text-muted-foreground text-sm">
								{data.user.email ?? data.user.username}
							</div>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		{/if}

		<!-- Profile Information Section -->
		<ProfileForm {data} />

		<!-- Update Password Section  -->
		<UpdatePasswordForm {data} />
	</div>
</div>

<Dialog.Root bind:open={deleteImageDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="text-destructive flex items-center gap-2">
				<Trash2 class="size-5" />
				Delete profile image?
			</Dialog.Title>
			<Dialog.Description>
				This will remove the current profile image. You can upload a new one anytime.
			</Dialog.Description>
		</Dialog.Header>

		<Dialog.Footer class="mt-4 flex gap-2">
			<Button
				type="button"
				variant="outline"
				onclick={() => (deleteImageDialogOpen = false)}
				disabled={deletingImage}
			>
				No
			</Button>
			<Button
				type="button"
				variant="destructive"
				onclick={confirmDeleteProfileImage}
				disabled={deletingImage}
			>
				{deletingImage ? "Deleting..." : "Yes, delete it"}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
