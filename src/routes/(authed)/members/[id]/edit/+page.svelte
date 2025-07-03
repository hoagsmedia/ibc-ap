<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ArrowLeft, Check, Trash2, KeyRound, Copy } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { memberSchema, type MemberSchema } from './edit-member-schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { createUploadThing } from '$lib/utils';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { generateUsername } from '$lib/utils';

	let { data }: { data: { form: SuperValidated<Infer<MemberSchema>>; member: any; user: any } } =
		$props();
	let uploading = $state(false);
	let fileInput = $state<HTMLInputElement | null>(null);
	let deleteDialogOpen = $state(false);
	let deleteConfirmText = $state('');
	let resetPasswordDialogOpen = $state(false);
	let tempPassword = $state('');

	// Check if current user is admin (for delete access)
	const isAdmin = $derived(data.user?.role === 'admin');

	// Update form
	const form = superForm(data.form, {
		validators: zodClient(memberSchema),
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success('Member updated successfully!', {
					icon: Check,
					duration: 3000,
					position: 'bottom-right',
					class: 'bg-green-50 text-green-800',
					action: {
						label: 'Close',
						onClick: () => toast.dismiss()
					}
				});
			}
		}
	});

	const { form: formData, enhance, submitting, message } = form;

	// Delete form
	const deleteForm = superForm(data.form, {
		id: 'delete-member',
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success('Member deleted successfully!', {
					icon: Check,
					duration: 3000,
					position: 'bottom-right'
				});
				// Redirect to members list after successful deletion
				window.location.href = '/members';
			} else if (result.type === 'error') {
				toast.error('Failed to delete member. Please try again.', {
					duration: 5000,
					position: 'bottom-right'
				});
			}
			// Close dialog regardless
			deleteDialogOpen = false;
			deleteConfirmText = '';
		}
	});

	const { enhance: enhanceDelete, submitting: isDeleting } = deleteForm;

	// Reset password form
	const resetPasswordForm = superForm(data.form, {
		id: 'reset-password',
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'success' && result.data?.tempPassword) {
				tempPassword = result.data.tempPassword;
				resetPasswordDialogOpen = true;
				toast.success(`Password reset for ${result.data.memberName}`, {
					icon: Check,
					duration: 5000,
					position: 'bottom-right'
				});
			} else if (result.type === 'failure' && result.data?.message) {
				toast.error(result.data.message, {
					duration: 5000,
					position: 'bottom-right'
				});
			} else if (result.type === 'error') {
				toast.error('Failed to reset password. Please try again.', {
					duration: 5000,
					position: 'bottom-right'
				});
			}
		}
	});

	const { enhance: enhanceResetPassword, submitting: isResettingPassword } = resetPasswordForm;

	// Create UploadThing helper
	const { startUpload } = createUploadThing('updateMemberImage', {
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
			} catch (error) {
				uploading = false;
				console.error('Upload failed:', error);
			}
		}
	}

	function openDeleteDialog() {
		deleteConfirmText = '';
		deleteDialogOpen = true;
	}

	function closeDeleteDialog() {
		deleteDialogOpen = false;
		deleteConfirmText = '';
	}

	function openResetPasswordDialog() {
		resetPasswordDialogOpen = true;
	}

	function closeResetPasswordDialog() {
		resetPasswordDialogOpen = false;
		tempPassword = '';
	}

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			toast.success('Password copied to clipboard!', {
				duration: 2000,
				position: 'bottom-right'
			});
		} catch (err) {
			console.error('Failed to copy to clipboard:', err);
			toast.error('Failed to copy to clipboard', {
				duration: 3000,
				position: 'bottom-right'
			});
		}
	}
</script>

<!-- Header with back button -->
<div class="mb-6 flex flex-col items-center gap-4 md:flex-row">
	<Button variant="outline" size="sm" onclick={() => history.back()}>
		<ArrowLeft class="size-4" />
		Back to Members
	</Button>
	<h1 class="text-3xl font-bold">Edit Member</h1>
</div>

<!-- Profile Image Section -->
<Card.Root class="mb-6">
	<Card.Header>
		<Card.Title>Profile Image</Card.Title>
		<Card.Description>Update the member's profile picture</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="flex items-center space-x-6">
			<!-- Current member image -->
			<Avatar.Root class="size-24">
				<Avatar.Image
					class="size-24"
					src={data.member?.img || $formData.img}
					alt={$formData.name}
				/>
				<Avatar.Fallback>{generateUsername($formData.name)}</Avatar.Fallback>
			</Avatar.Root>

			<div class="flex-1">
				<div class="space-y-4">
					<div>
						<label for="profile-image-upload" class="mb-2 block text-sm font-medium">
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
								<Button variant="outline" onclick={handleUploadClick} type="button">
									Choose Image
								</Button>
							{/if}
						</div>
						<p class="text-muted-foreground mt-1 text-xs">PNG, JPG, GIF up to 4MB</p>
					</div>
				</div>
			</div>
		</div>
	</Card.Content>
</Card.Root>

<!-- Member Details Form -->
<Card.Root>
	<Card.Header>
		<Card.Title>Member Details</Card.Title>
		<Card.Description>Update the member's information below.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" action="?/update" use:enhance class="space-y-6">
			<!-- Use the member ID from form data -->
			<input type="hidden" name="id" value={$formData.id} />

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Name *</Form.Label>
							<Input {...props} bind:value={$formData.name} />
						{/snippet}
					</Form.Control>
					<Form.Description>The member's full name.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="email">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Email *</Form.Label>
							<Input type="email" {...props} bind:value={$formData.email} />
						{/snippet}
					</Form.Control>
					<Form.Description>Primary email address.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="mbr">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Member Number *</Form.Label>
							<Input type="number" {...props} bind:value={$formData.mbr} />
						{/snippet}
					</Form.Control>
					<Form.Description>Unique member identifier.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="msd">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Member Since *</Form.Label>
							<Input type="date" {...props} bind:value={$formData.msd} />
						{/snippet}
					</Form.Control>
					<Form.Description>Date when membership started.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="phone">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Phone</Form.Label>
							<Input type="tel" {...props} bind:value={$formData.phone} />
						{/snippet}
					</Form.Control>
					<Form.Description>Contact phone number.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="role">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Role *</Form.Label>
							<Select.Root type="single" bind:value={$formData.role} name={props.name}>
								<Select.Trigger class="w-36" {...props}>
									{$formData.role
										? $formData.role.charAt(0).toUpperCase() + $formData.role.slice(1)
										: 'Select Role'}
								</Select.Trigger>
								<Select.Content>
									<Select.Group>
										<Select.Item value="guest" label="Guest">Guest</Select.Item>
										<Select.Item value="member" label="Member">Member</Select.Item>
										<Select.Item value="admin" label="Admin">Admin</Select.Item>
									</Select.Group>
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.Description
						>Changing this status will update member site privileges.</Form.Description
					>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<Form.Field {form} name="address">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Address</Form.Label>
						<Input {...props} bind:value={$formData.address} />
					{/snippet}
				</Form.Control>
				<Form.Description>Mailing address.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="sponsor">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Sponsor</Form.Label>
						<Input {...props} bind:value={$formData.sponsor} />
					{/snippet}
				</Form.Control>
				<Form.Description>Member's sponsor (if applicable).</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="bio">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Bio</Form.Label>
						<Textarea {...props} bind:value={$formData.bio} rows={4} />
					{/snippet}
				</Form.Control>
				<Form.Description>Member's biography or description.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="hobbies">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Hobbies</Form.Label>
						<Input {...props} bind:value={$formData.hobbies} />
					{/snippet}
				</Form.Control>
				<Form.Description>Member's hobbies and interests.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="likes">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Likes</Form.Label>
						<Input {...props} bind:value={$formData.likes} />
					{/snippet}
				</Form.Control>
				<Form.Description>Things the member likes.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<div class="flex justify-between gap-4">
				<div class="flex gap-4">
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Updating...' : 'Update Member'}
					</Button>
					<Button type="button" variant="outline" onclick={() => history.back()}
						>{$message ? 'Close' : 'Cancel'}</Button
					>
				</div>

				<!-- Admin Actions -->
				{#if isAdmin}
					<div class="flex gap-2">
						<Button
							type="button"
							variant="outline"
							onclick={openResetPasswordDialog}
							class="flex items-center gap-2"
						>
							<KeyRound class="size-4" />
							Reset Password
						</Button>
						<Button
							type="button"
							variant="destructive"
							onclick={openDeleteDialog}
							class="flex items-center gap-2"
						>
							<Trash2 class="size-4" />
							Delete Member
						</Button>
					</div>
				{/if}
			</div>
		</form>
	</Card.Content>
</Card.Root>

<!-- Delete Confirmation Dialog -->
<Dialog.Root bind:open={deleteDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="text-destructive flex items-center gap-2">
				<Trash2 class="size-5" />
				Delete Member
			</Dialog.Title>
			<Dialog.Description>
				This action cannot be undone. This will permanently delete {data.member.name}'s account and
				remove all associated data.
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/delete" use:enhanceDelete>
			<!-- Hidden input to pass the member ID -->
			<input type="hidden" name="id" value={data.member.id} />

			<div class="space-y-4">
				<div class="rounded-md bg-red-50 p-4">
					<div class="text-sm text-red-800">
						<strong>Warning:</strong> This will permanently delete:
						<ul class="mt-2 list-inside list-disc space-y-1">
							<li>Member profile and account</li>
							<li>All associated data</li>
							<li>Upload history and images</li>
						</ul>
					</div>
				</div>

				<div class="space-y-2">
					<label for="delete-confirm" class="text-sm font-medium">
						To confirm deletion, type <strong>DELETE</strong> in the box below:
					</label>
					<Input
						id="delete-confirm"
						name="confirmText"
						bind:value={deleteConfirmText}
						placeholder="Type DELETE to confirm"
						class="font-mono"
					/>
				</div>
			</div>

			<Dialog.Footer class="mt-4 flex gap-2">
				<Button type="button" variant="outline" onclick={closeDeleteDialog} disabled={$isDeleting}
					>Cancel</Button
				>
				<Button
					type="submit"
					variant="destructive"
					disabled={deleteConfirmText !== 'DELETE' || $isDeleting}
					class="flex items-center gap-2"
				>
					{#if $isDeleting}
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
						></div>
						Deleting...
					{:else}
						<Trash2 class="size-4" />
						Delete Member
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Password Reset Dialog -->
<Dialog.Root bind:open={resetPasswordDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<KeyRound class="size-5" />
				Reset Password
			</Dialog.Title>
			<Dialog.Description>
				{#if tempPassword}
					Password has been reset successfully for {data.member.name}.
				{:else}
					This will generate a new temporary password for {data.member.name}. The user will need to
					change it upon next login.
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		{#if tempPassword}
			<!-- Show generated password -->
			<div class="space-y-4">
				<div class="rounded-md bg-green-50 p-4 dark:bg-green-950">
					<div class="flex items-center justify-between">
						<div>
							<h4 class="text-sm font-medium text-green-800 dark:text-green-200">
								New Temporary Password
							</h4>
							<div class="mt-2 flex items-center gap-2">
								<code
									class="rounded bg-green-100 px-2 py-1 font-mono text-sm text-green-800 dark:bg-green-900 dark:text-green-200"
								>
									{tempPassword}
								</code>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onclick={() => copyToClipboard(tempPassword)}
									class="flex items-center gap-1"
								>
									<Copy class="size-3" />
									Copy
								</Button>
							</div>
						</div>
					</div>
				</div>

				<div class="rounded-md bg-amber-50 p-4 dark:bg-amber-950">
					<div class="text-sm text-amber-800 dark:text-amber-200">
						<strong>Important:</strong>
						<ul class="mt-2 list-inside list-disc space-y-1">
							<li>Share this password securely with the member</li>
							<li>The member should change this password immediately after logging in</li>
							<li>This password will not be shown again</li>
						</ul>
					</div>
				</div>
			</div>

			<Dialog.Footer class="mt-4">
				<Button type="button" onclick={closeResetPasswordDialog}>Close</Button>
			</Dialog.Footer>
		{:else}
			<!-- Confirmation before reset -->
			<form method="POST" action="?/resetPassword" use:enhanceResetPassword>
				<div class="space-y-4">
					<div class="rounded-md bg-amber-50 p-4 dark:bg-amber-950">
						<div class="text-sm text-amber-800 dark:text-amber-200">
							<strong>Warning:</strong> This will immediately invalidate the current password for {data
								.member.name}.
						</div>
					</div>
				</div>

				<Dialog.Footer class="mt-4 flex gap-2">
					<Button
						type="button"
						variant="outline"
						onclick={closeResetPasswordDialog}
						disabled={$isResettingPassword}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={$isResettingPassword} class="flex items-center gap-2">
						{#if $isResettingPassword}
							<div
								class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
							></div>
							Resetting...
						{:else}
							<KeyRound class="size-4" />
							Reset Password
						{/if}
					</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<Toaster closeButton />
