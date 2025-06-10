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
			<h1 class="text-3xl font-bold text-gray-900">Profile Settings</h1>
			<p class="mt-2 text-sm text-gray-600">
				Update your profile information and upload a profile image.
			</p>
		</div>

		<!-- Success/Error Messages -->
		{#if form?.success}
			<div class="mb-6 rounded-md bg-green-50 p-4">
				<div class="flex">
					<div class="ml-3">
						<p class="text-sm font-medium text-green-800">{form.message}</p>
					</div>
				</div>
			</div>
		{:else if form?.message && !form?.success}
			<div class="mb-6 rounded-md bg-red-50 p-4">
				<div class="flex">
					<div class="ml-3">
						<p class="text-sm font-medium text-red-800">{form.message}</p>
					</div>
				</div>
			</div>
		{/if}

		<div class="space-y-8">
			<!-- Profile Image Section -->
			<div class="rounded-lg bg-white p-6 shadow">
				<h2 class="mb-4 text-lg font-medium text-gray-900">Profile Image</h2>

				<div class="flex items-center space-x-6">
					<div class="flex-shrink-0">
						{#if imagePreview}
							<img
								src={imagePreview}
								alt="Preview"
								class="h-24 w-24 rounded-full object-cover ring-4 ring-gray-300"
							/>
						{:else if data.user.img}
							<img
								src={data.user.img.startsWith('/') ? data.user.img : `/resources/${data.user.img}`}
								alt={data.user.name}
								class="h-24 w-24 rounded-full object-cover ring-4 ring-gray-300"
							/>
						{:else}
							<div
								class="flex h-24 w-24 items-center justify-center rounded-full bg-gray-300 ring-4 ring-gray-300"
							>
								<span class="text-xl font-medium text-gray-600">
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
								<label for="image" class="block text-sm font-medium text-gray-700">
									Choose new image
								</label>
								<input
									type="file"
									id="image"
									name="image"
									accept="image/*"
									onchange={handleImagePreview}
									class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
									disabled={uploading}
								/>
								<p class="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
							</div>

							<button
								type="submit"
								disabled={uploading}
								class="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							>
								{uploading ? 'Uploading...' : 'Upload Image'}
							</button>
						</div>
					</form>
				</div>
			</div>

			<!-- Profile Information Section -->
			<div class="rounded-lg bg-white p-6 shadow">
				<h2 class="mb-4 text-lg font-medium text-gray-900">Profile Information</h2>

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
						<label for="name" class="block text-sm font-medium text-gray-700">Name</label>
						<input
							type="text"
							id="name"
							name="name"
							value={data.user.name}
							class="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500"
							disabled={updating}
						/>
					</div>

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
						<input
							type="email"
							id="email"
							value={data.user.email}
							disabled
							class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500 shadow-sm"
						/>
						<p class="mt-1 text-xs text-gray-500">Email cannot be changed</p>
					</div>

					<div>
						<label for="role" class="block text-sm font-medium text-gray-700">Role</label>
						<input
							type="text"
							id="role"
							value={data.user.role}
							disabled
							class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500 capitalize shadow-sm"
						/>
					</div>

					<div class="flex justify-between">
						<button
							type="submit"
							disabled={updating}
							class="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							{updating ? 'Updating...' : 'Update Profile'}
						</button>

						<a
							href="/dashboard"
							class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
						>
							← Back to Dashboard
						</a>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
