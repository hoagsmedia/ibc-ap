<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let imagePreview = $state<string | null>(null);
	let uploading = $state(false);
	let updating = $state(false);

	// Get form data from page store using $derived
	let form = $derived($page.form as { success?: boolean; message?: string } | null);

	function handleImagePreview(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				imagePreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
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
					<div class="flex-shrink-0">
						{#if imagePreview}
							<img
								src={imagePreview}
								alt="Preview"
								class="ring-border size-24 rounded-full object-cover ring-4"
							/>
						{:else if data.user.img}
							<img
								src={`/resources/${data.user.img}`}
								alt={data.user.name}
								class="ring-border size-24 rounded-full object-cover ring-4"
							/>
						{:else}
							<div
								class="bg-muted ring-border flex size-24 items-center justify-center rounded-full ring-4"
							>
								<span class="text-muted-foreground text-xl font-medium">
									{data.user.name.charAt(0).toUpperCase()}
								</span>
							</div>
						{/if}
					</div>

					<form
						method="POST"
						action="?/uploadImage"
						enctype="multipart/form-data"
						use:enhance={() => {
							uploading = true;
							return async ({ update }) => {
								await update();
								uploading = false;
								imagePreview = null;
								// Reset file input
								const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
								if (fileInput) fileInput.value = '';
							};
						}}
						class="flex-1"
					>
						<div class="space-y-4">
							<div>
								<label for="image" class="text-card-foreground block text-sm font-medium">
									Choose new image
								</label>
								<input
									type="file"
									id="image"
									name="image"
									accept="image/*"
									onchange={handleImagePreview}
									class="text-muted-foreground file:bg-accent file:text-accent-foreground hover:file:bg-accent/80 mt-1 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:text-sm file:font-medium"
									disabled={uploading}
								/>
								<p class="text-muted-foreground mt-1 text-xs">PNG, JPG, GIF up to 5MB</p>
							</div>

							<button
								type="submit"
								disabled={uploading}
								class="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							>
								{uploading ? 'Uploading...' : 'Upload Image'}
							</button>
						</div>
					</form>
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
