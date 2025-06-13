<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { createUploadThing } from '$lib/utils';
	import type { PageData } from './$types';
	import * as Avatar from '$lib/components/ui/avatar';
	import { generateUsername } from '$lib/utils';

	let { data }: { data: PageData } = $props();
	let uploading = $state(false);
	let updating = $state(false);

	// Get form data from page store using $derived
	let form = $derived($page.form as { success?: boolean; message?: string } | null);

	// Create UploadThing helper
	const { startUpload, isUploading } = createUploadThing('profileImageUploader', {
		onClientUploadComplete: (res) => {
			console.log('Upload Completed', res);
			uploading = false;
			// Refresh the page to show the new image
			window.location.reload();
		},
		onUploadError: (error: Error) => {
			console.error('Upload error:', error);
			uploading = false;
			alert(`Upload failed: ${error.message}`);
		},
		onUploadBegin: (name) => {
			console.log('Upload has begun for', name);
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
			} catch (error) {
				console.error('Upload failed:', error);
				uploading = false;
			}
		}
	}
</script>

<svelte:head>
	<title>Settings | Island Beer Club</title>
	<meta name="description" content="Update your profile settings" />
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mx-auto max-w-2xl">
		<div class="mb-8">
			<h1 class="text-foreground text-3xl font-bold">Profile Settings</h1>
			<p class="text-muted-foreground mt-2 text-sm">
				Update your profile information and upload a profile image.
			</p>
		</div>

		<!-- Success/Error Messages -->
		{#if form?.success}
			<div class="bg-secondary mb-6 rounded-md p-4">
				<div class="flex">
					<div class="ml-3">
						<p class="text-secondary-foreground text-sm font-medium">{form.message}</p>
					</div>
				</div>
			</div>
		{:else if form?.message && !form?.success}
			<div class="bg-destructive/10 mb-6 rounded-md p-4">
				<div class="flex">
					<div class="ml-3">
						<p class="text-destructive text-sm font-medium">{form.message}</p>
					</div>
				</div>
			</div>
		{/if}

		<div class="space-y-8">
			<!-- Profile Image Section -->
			<div class="bg-card rounded-lg p-6 shadow">
				<h2 class="text-card-foreground mb-4 text-lg font-medium">Profile Image</h2>

				<div class="flex items-center space-x-6">
					<!-- UploadThing URL -->
					<Avatar.Root class="size-24">
						{#if data.user.img}
							<Avatar.Image class="size-24" src={data.user.img} alt={data.user.name} />
						{/if}
						<Avatar.Fallback>{generateUsername(data.user.name)}</Avatar.Fallback>
					</Avatar.Root>

					<div class="flex-1">
						<div class="space-y-4">
							<div>
								<label
									for="profile-image-upload"
									class="text-card-foreground mb-2 block text-sm font-medium"
								>
									Upload new profile image
								</label>
								<div
									class="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400"
								>
									{#if uploading}
										<div class="flex items-center justify-center">
											<div
												class="border-primary h-8 w-8 animate-spin rounded-full border-b-2"
											></div>
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
										<button
											onclick={handleUploadClick}
											type="button"
											class="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
										>
											Choose Image
										</button>
									{/if}
								</div>
								<p class="text-muted-foreground mt-1 text-xs">PNG, JPG, GIF up to 4MB</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Profile Information Section -->
			<div class="bg-card rounded-lg p-6 shadow">
				<h2 class="text-card-foreground mb-4 text-lg font-medium">Profile Information</h2>

				<form
					method="POST"
					action="?/updateProfile"
					use:enhance={() => {
						updating = true;
						return async ({ update }) => {
							await update();
							updating = false;
						};
					}}
					class="space-y-4"
				>
					<div>
						<label for="name" class="text-card-foreground block text-sm font-medium">Name</label>
						<input
							type="text"
							id="name"
							name="name"
							value={data.user.name}
							class="border-input bg-input text-foreground focus:border-ring focus:ring-ring mt-1 block w-full rounded-md shadow-sm"
							disabled={updating}
						/>
					</div>

					<div>
						<label for="email" class="text-card-foreground block text-sm font-medium">Email</label>
						<input
							type="email"
							id="email"
							value={data.user.email}
							disabled
							class="border-input bg-muted text-muted-foreground mt-1 block w-full rounded-md shadow-sm"
						/>
						<p class="text-muted-foreground mt-1 text-xs">Email cannot be changed</p>
					</div>

					<div>
						<label for="role" class="text-card-foreground block text-sm font-medium">Role</label>
						<input
							type="text"
							id="role"
							value={data.user.role}
							disabled
							class="border-input bg-muted text-muted-foreground mt-1 block w-full rounded-md capitalize shadow-sm"
						/>
					</div>

					<div class="flex justify-between">
						<button
							type="submit"
							disabled={updating}
							class="bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-ring inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							{updating ? 'Updating...' : 'Update Profile'}
						</button>

						<a
							href="/dashboard"
							class="border-border bg-card text-card-foreground hover:bg-accent focus:ring-ring inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
						>
							← Back to Dashboard
						</a>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
