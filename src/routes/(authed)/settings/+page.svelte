<script lang="ts">
	import { createUploadThing } from '$lib/utils';
	import type { PageData } from './$types';
	import Avatar from '$lib/components/Avatar.svelte';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { generateUsername } from '$lib/utils';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { settingsSchema } from './settings-form';
	import { toast } from 'svelte-sonner';

	let { data }: { data: PageData } = $props();
	let uploading = $state(false);

	// Initialize superform
	const form = superForm(data.form, {
		validators: zodClient(settingsSchema),
		resetForm: false,
		onUpdated: ({ form: f }) => {
			if (f.message) {
				toast.success(f.message);
			}
		},
		onError: ({ result }) => {
			if (result.error?.message) {
				toast.error(result.error.message);
			} else {
				toast.error('An error occurred while updating your profile');
			}
		}
	});

	const { form: formData, enhance, errors, submitting } = form;

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
			<div class="bg-card rounded-lg p-6 shadow">
				<h2 class="text-card-foreground mb-4 text-lg font-medium">Profile Image</h2>

				<div class="flex items-center space-x-6">
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
				</div>
			</div>

			<!-- Profile Information Section -->
			<div class="bg-card rounded-lg p-6 shadow">
				<h2 class="text-card-foreground mb-4 text-lg font-medium">Profile Information</h2>

				<form method="POST" action="?/updateProfile" use:enhance class="space-y-4">
					<Form.Field {form} name="name">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Name</Form.Label>
								<Input {...props} bind:value={$formData.name} disabled={$submitting} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="phone">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Phone Number</Form.Label>
								<Input
									{...props}
									type="tel"
									bind:value={$formData.phone}
									disabled={$submitting}
									placeholder="Your phone number"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="address">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Address</Form.Label>
								<Input
									{...props}
									bind:value={$formData.address}
									disabled={$submitting}
									placeholder="Your address"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="bio">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Bio</Form.Label>
								<Textarea
									{...props}
									bind:value={$formData.bio}
									disabled={$submitting}
									placeholder="Tell us about yourself..."
									rows={4}
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="hobbies">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Hobbies</Form.Label>
								<Input
									{...props}
									bind:value={$formData.hobbies}
									disabled={$submitting}
									placeholder="Your hobbies and interests"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="likes">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Likes</Form.Label>
								<Input
									{...props}
									bind:value={$formData.likes}
									disabled={$submitting}
									placeholder="Things you like"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<div>
						<label for="email" class="text-card-foreground block text-sm font-medium">Email</label>
						<Input
							id="email"
							value={data.user.email}
							disabled
							class="bg-muted text-muted-foreground"
						/>
						<p class="text-muted-foreground mt-1 text-xs">Email cannot be changed</p>
					</div>

					<div>
						<label for="role" class="text-card-foreground block text-sm font-medium">Role</label>
						<Input
							id="role"
							value={data.user.role}
							disabled
							class="bg-muted text-muted-foreground capitalize"
						/>
					</div>

					<div class="flex flex-col justify-between gap-4 md:flex-row">
						<Form.Button disabled={$submitting}>
							{$submitting ? 'Updating...' : 'Update Profile'}
						</Form.Button>

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
