<script lang="ts">
	import { createUploadThing } from '$lib/utils';
	import type { PageData } from './$types';
	import Avatar from '$lib/components/Avatar.svelte';
	import * as Card from '$lib/components/ui/card';
	import ProfileForm from './profile-form.svelte';
	import UpdatePasswordForm from './update-password-form.svelte';

	let { data }: { data: PageData } = $props();
	let uploading = $state(false);

	// Create UploadThing helper
	const { startUpload, isUploading } = createUploadThing('profileImageUploader', {
		onClientUploadComplete: (res) => {
			uploading = false;
			// Refresh the page to show the new image
			window.location.reload();
		},
		onUploadError: (error: Error) => {
			uploading = false;
			alert(`Upload failed: ${error.message}`);
		},
		onUploadBegin: (name) => {
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

		<div class="space-y-8">
			<!-- Profile Image Section -->
			<Card.Root class="bg-card rounded-lg p-6 shadow">
				<Card.Header class="text-card-foreground mb-4 text-lg font-medium"
					>Profile Image</Card.Header
				>

				<Card.Content class="flex items-center space-x-6">
					<Avatar class="size-24" name={data.user.name} img={data.user.img ?? undefined} />
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
				</Card.Content>
			</Card.Root>

			<!-- Profile Information Section -->
			<ProfileForm {data} />

			<!-- Update Password Section  -->
			<UpdatePasswordForm {data} />
		</div>
	</div>
</div>
