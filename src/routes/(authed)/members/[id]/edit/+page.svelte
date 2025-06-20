<script lang="ts">
	import { page } from '$app/state';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { memberSchema, type MemberSchema } from './edit-member-schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { createUploadThing } from '$lib/utils';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { generateUsername } from '$lib/utils';

	let { data }: { data: { form: SuperValidated<Infer<MemberSchema>> } } = $props();
	let uploading = $state(false);
	let updating = $state(false);
	let message = $derived(data?.form?.message);
	let errors = $derived(data?.form?.errors ?? {});
	let fileInput = $state<HTMLInputElement | null>(null);
	$effect(() => {
		// Focus on first error
		if (Object.keys(errors).length) {
			document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
		}
	});

	const form = superForm(data.form, {
		validators: zodClient(memberSchema)
	});

	const { form: formData, enhance } = form;

	// Create UploadThing helper
	const { startUpload, isUploading } = createUploadThing('updateMemberImage', {
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
				console.log('File selected:');
			} catch (error) {
				uploading = false;
			}
		}
	}
</script>

{#if message}
	<div class="status" class:error={page.status >= 400} class:success={page.status == 200}>
		{message}
	</div>
{/if}

<!-- Header with back button -->
<div class="mb-6 flex flex-col items-center gap-4 md:flex-row">
	<Button variant="outline" size="sm" onclick={() => history.back()}>
		<ArrowLeft class="size-4" />
		Back to Members
	</Button>
	<h1 class="text-3xl font-bold">Member Details</h1>
</div>

<div class="bg-card rounded-lg p-6 shadow">
	<h2 class="text-card-foreground mb-4 text-lg font-medium">Profile Image</h2>

	<div class="flex items-center space-x-6">
		<!-- UploadThing URL -->
		<Avatar.Root class="size-24">
			<Avatar.Image class="size-24" src={data.form.data.img} alt={data.form.data.name} />
			<Avatar.Fallback>{generateUsername(data.form.data.name)}</Avatar.Fallback>
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
<form method="POST" use:enhance>
	<Form.Field {form} name="img">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Profile Image</Form.Label>
			{/snippet}
		</Form.Control>
		<Form.Description>Upload a profile image for the member.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Name</Form.Label>
				<Input {...props} bind:value={$formData.name} />
			{/snippet}
		</Form.Control>
		<Form.Description>This is your public display name.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="mbr">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Member Number</Form.Label>
				<Input {...props} bind:value={$formData.mbr} />
			{/snippet}
		</Form.Control>
		<Form.Description>Your unique username for the club.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="msd">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Member Since</Form.Label>
				<Input {...props} bind:value={$formData.msd} />
			{/snippet}
		</Form.Control>
		<Form.Description>Your unique member number.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="email">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Email</Form.Label>
				<Input type="email" {...props} bind:value={$formData.email} />
			{/snippet}
		</Form.Control>
		<Form.Description>Your email address for notifications.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="phone">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Phone</Form.Label>
				<Input type="tel" {...props} bind:value={$formData.phone} />
			{/snippet}
		</Form.Control>
		<Form.Description>Your phone number for contact purposes.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="address">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Address</Form.Label>
				<Input {...props} bind:value={$formData.address} />
			{/snippet}
		</Form.Control>
		<Form.Description>Your mailing address.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="role">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Role</Form.Label>
				<Input {...props} bind:value={$formData.role} />
			{/snippet}
		</Form.Control>
		<Form.Description>Your current membership level.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="bio">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Bio</Form.Label>
				<Input {...props} bind:value={$formData.bio} />
			{/snippet}
		</Form.Control>
		<Form.Description>A short biography about yourself.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="hobbies">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Hobbies</Form.Label>
				<Input {...props} bind:value={$formData.hobbies} />
			{/snippet}
		</Form.Control>
		<Form.Description>Your hobbies and interests.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="likes">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Likes</Form.Label>
				<Input {...props} bind:value={$formData.likes} />
			{/snippet}
		</Form.Control>
		<Form.Description>Things you like or enjoy.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="sponsor">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Sponsor</Form.Label>
				<Input {...props} bind:value={$formData.sponsor} />
			{/snippet}
		</Form.Control>
		<Form.Description>Your sponsor's name, if applicable.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>Submit</Form.Button>
</form>
