<script lang="ts">
	import * as Form from "$lib/components/ui/form/index.js";
	import Avatar from "$lib/components/Avatar.svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import HubBackLink from "$lib/components/HubBackLink.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import { Toaster } from "$lib/components/ui/sonner/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import DatePickerField from "$lib/components/DatePickerField.svelte";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import {
		ArrowLeft,
		Check,
		Trash2,
		KeyRound,
		ShieldCheck,
		UserRound,
		NotebookPen
	} from "@lucide/svelte";
	import { toast } from "svelte-sonner";
	import { toastAdminActionFailure } from "$lib/admin-action-toast";
	import { memberSchema } from "./edit-member-schema";
	import { superForm } from "sveltekit-superforms";
	import { createUploadThing } from "$lib/utils";
	import { beforeNavigate, goto } from "$app/navigation";
	import { zodClient } from "sveltekit-superforms/adapters";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
	let uploading = $state(false);
	let fileInput = $state<HTMLInputElement | null>(null);
	let deleteDialogOpen = $state(false);
	let deleteConfirmText = $state("");
	let resetPasswordDialogOpen = $state(false);
	let deleteProfileImageDialogOpen = $state(false);
	let deletingProfileImage = $state(false);
	let unsavedDialogOpen = $state(false);
	let pendingNavigationHref = $state<string | null>(null);
	let memberEditFormEl = $state<HTMLFormElement | null>(null);

	type EditableMemberFields = {
		name: string;
		email: string;
		phone: string;
		address: string;
		bio: string;
		hobbies: string;
		img: string;
		role: string;
		likes: string;
		mbr: number;
		msd: string;
		dops: boolean;
		dops_date: string;
		rung_in_date: string;
		sponsor: string;
	};

	function getEditableSnapshot(member: Partial<EditableMemberFields>): EditableMemberFields {
		return {
			name: member.name ?? "",
			email: member.email ?? "",
			phone: member.phone ?? "",
			address: member.address ?? "",
			bio: member.bio ?? "",
			hobbies: member.hobbies ?? "",
			img: member.img ?? "",
			role: member.role ?? "",
			likes: member.likes ?? "",
			mbr: member.mbr ?? 0,
			msd: member.msd ?? "",
			dops: Boolean(member.dops),
			dops_date: member.dops_date ?? "",
			rung_in_date: member.rung_in_date ?? "",
			sponsor: member.sponsor ?? ""
		};
	}

	function isEqualSnapshot(a: EditableMemberFields, b: EditableMemberFields): boolean {
		return JSON.stringify(a) === JSON.stringify(b);
	}

	// Check if current user is admin (for delete access)
	const isAdmin = $derived.by(() => data.user?.role === "admin");

	// Update form (explicit id: same page uses multiple superForms with the same `data.form`)
	const form = superForm(data.form, {
		id: "member-edit",
		validators: zodClient(memberSchema),
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === "redirect" || result.type === "success") {
				suppressUnsavedPrompt = true;
				baselineSnapshot = getEditableSnapshot($formData);
				toast.success("Member updated successfully!", {
					icon: Check,
					duration: 3000,
					position: "bottom-right",
					class: "bg-green-50 text-green-800",
					action: {
						label: "Close",
						onClick: () => toast.dismiss()
					}
				});

				if (pendingNavigationHref) {
					const targetHref = pendingNavigationHref;
					pendingNavigationHref = null;
					void goto(targetHref, { noScroll: true });
				}
			} else if (result.type === "failure") {
				toastAdminActionFailure(result.data, "Could not save changes. Check the form for errors.", {
					duration: 8000
				});
			}
		}
	});

	const { form: formData, enhance, submitting, message } = form;
	let baselineSnapshot = $state(getEditableSnapshot(data.form.data));
	const hasUnsavedChanges = $derived(
		!isEqualSnapshot(getEditableSnapshot($formData), baselineSnapshot)
	);
	let suppressUnsavedPrompt = $state(false);

	// Delete form
	const deleteForm = superForm(data.form, {
		id: "delete-member",
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === "success") {
				toast.success("Member deleted successfully!", {
					icon: Check,
					duration: 3000,
					position: "bottom-right"
				});
				// Redirect to members list after successful deletion
				window.location.href = "/dashboard/members";
			} else if (result.type === "failure") {
				toastAdminActionFailure(result.data, "Could not delete this member.");
			} else if (result.type === "error") {
				toast.error("Failed to delete member. Please try again.", {
					duration: 5000,
					position: "bottom-right"
				});
			}
			// Close dialog regardless
			deleteDialogOpen = false;
			deleteConfirmText = "";
		}
	});

	const { enhance: enhanceDelete, submitting: isDeleting } = deleteForm;

	// Reset password form
	const resetPasswordForm = superForm(data.form, {
		id: "member-edit-reset-password",
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === "success" && result.data?.success) {
				resetPasswordDialogOpen = false;
				toast.success(result.data.message ?? "Reset link sent.", {
					icon: Check,
					duration: 6000,
					position: "bottom-right"
				});
			} else if (result.type === "failure") {
				toastAdminActionFailure(result.data, "Failed to send password reset. Please try again.", {
					duration: 5000
				});
			} else if (result.type === "error") {
				toast.error("Failed to send password reset. Please try again.", {
					duration: 5000,
					position: "bottom-right"
				});
			}
		}
	});

	const { enhance: enhanceResetPassword, submitting: isResettingPassword } = resetPasswordForm;

	// Create UploadThing helper
	const { startUpload } = createUploadThing("updateMemberImage", {
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
				console.error("Upload failed:", error);
			}
		}
	}

	async function confirmDeleteProfileImage() {
		deletingProfileImage = true;
		try {
			const response = await fetch("/api/profile-image/delete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ memberId: data.member.id })
			});

			if (!response.ok) {
				const data = (await response.json().catch(() => ({}))) as { message?: string };
				throw new Error(data.message || "Failed to delete profile image");
			}

			window.location.reload();
		} catch (error) {
			deletingProfileImage = false;
			toast.error(error instanceof Error ? error.message : "Failed to delete profile image", {
				duration: 5000,
				position: "bottom-right"
			});
		}
	}

	function openDeleteDialog() {
		deleteConfirmText = "";
		deleteDialogOpen = true;
	}

	function closeDeleteDialog() {
		deleteDialogOpen = false;
		deleteConfirmText = "";
	}

	function openResetPasswordDialog() {
		resetPasswordDialogOpen = true;
	}

	function closeResetPasswordDialog() {
		resetPasswordDialogOpen = false;
	}

	beforeNavigate((nav) => {
		if (!hasUnsavedChanges || suppressUnsavedPrompt) return;
		if (nav.willUnload) return;
		nav.cancel();
		pendingNavigationHref = nav.to?.url
			? `${nav.to.url.pathname}${nav.to.url.search}${nav.to.url.hash}`
			: null;
		unsavedDialogOpen = true;
	});

	$effect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (!hasUnsavedChanges || suppressUnsavedPrompt) return;
			event.preventDefault();
			event.returnValue = "";
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	});

	function stayOnPage(): void {
		unsavedDialogOpen = false;
		pendingNavigationHref = null;
	}

	function discardAndLeave(): void {
		if (!pendingNavigationHref) {
			unsavedDialogOpen = false;
			return;
		}
		suppressUnsavedPrompt = true;
		const targetHref = pendingNavigationHref;
		pendingNavigationHref = null;
		unsavedDialogOpen = false;
		void goto(targetHref, { noScroll: true });
	}

	function saveAndLeave(): void {
		if (!memberEditFormEl) return;
		unsavedDialogOpen = false;
		memberEditFormEl.requestSubmit();
	}
</script>

<div class="flex w-full min-w-0 flex-col gap-6">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div class="min-w-0">
			<h1 class="min-w-0 text-3xl font-bold">Edit Member Profile</h1>
			<p class="text-muted-foreground text-sm">Update member information and account details.</p>
		</div>
		<div class="flex items-center gap-2">
			<Button
				href={`/members/${data.member.id}?back=${data.backLink.key}`}
				variant="outline"
				size="sm">View Member Profile</Button
			>
			<HubBackLink href={data.backLink.href} size="sm" class="shrink-0 gap-2">
				<ArrowLeft class="size-4" />
				{data.backLink.label}
			</HubBackLink>
		</div>
	</div>

	<!-- Profile Image Section -->
	<Card.Root class="mb-6">
		<Card.Header>
			<Card.Title>Profile Image</Card.Title>
			<Card.Description>Update the member's profile picture</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
				<!-- Current member image -->
				<Avatar
					class="size-24"
					name={data.member?.name}
					img={data.member?.img || $formData.img}
					dops={$formData.dops}
				/>

				<Field.Set class="flex-1">
					<Field.Group>
						<Field.Field>
							<Field.Label for="profile-image-upload">Upload new profile image</Field.Label>
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
										<Button variant="outline" onclick={handleUploadClick} type="button">
											Choose Image
										</Button>
										{#if data.member?.img || $formData.img}
											<Button
												variant="destructive"
												onclick={() => (deleteProfileImageDialogOpen = true)}
												type="button"
											>
												<Trash2 class="size-4" />
												Delete Image
											</Button>
										{/if}
									</div>
								{/if}
							</div>
							<Field.Description>PNG, JPG, GIF up to 8MB</Field.Description>
						</Field.Field>
					</Field.Group>
				</Field.Set>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Member Details Form -->
	<form bind:this={memberEditFormEl} method="POST" action="?/update" use:enhance class="space-y-6">
		<input type="hidden" name="id" value={$formData.id} />

		<div class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<UserRound class="text-muted-foreground size-4" />
						Member Information
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-6">
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
									<Input type="number" step="0.1" {...props} bind:value={$formData.mbr} />
								{/snippet}
							</Form.Control>
							<Form.Description>Unique member identifier.</Form.Description>
							<Form.FieldErrors />
						</Form.Field>

						<Form.Field {form} name="msd" class="min-w-0">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Member Since *</Form.Label>
									<DatePickerField
										id={props.id}
										name={props.name}
										aria-invalid={props["aria-invalid"]}
										bind:value={$formData.msd}
										class="max-w-full min-w-0"
									/>
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
										<Select.Trigger class="w-40" {...props}>
											{$formData.role
												? $formData.role.charAt(0).toUpperCase() + $formData.role.slice(1)
												: "Select Role"}
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
								>Changing this status updates member site privileges.</Form.Description
							>
							<Form.FieldErrors />
						</Form.Field>

						<Form.Field {form} name="dops_date" class="min-w-0">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>DOPS</Form.Label>
									<Input
										type="text"
										{...props}
										bind:value={$formData.dops_date}
										placeholder="YYYY-MM-DD"
										inputmode="numeric"
										pattern="\\d{4}-\\d{2}-\\d{2}"
										autocomplete="off"
										spellcheck={false}
										class="h-8 w-full max-w-full min-w-0 text-sm"
									/>
								{/snippet}
							</Form.Control>
							<Form.Description>Date of Permanent Sobriety.</Form.Description>
							<Form.FieldErrors />
						</Form.Field>

						<Form.Field {form} name="rung_in_date" class="min-w-0">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Had Rung In Date</Form.Label>
									<DatePickerField
										id={props.id}
										name={props.name}
										aria-invalid={props["aria-invalid"]}
										bind:value={$formData.rung_in_date}
										class="max-w-full min-w-0"
									/>
								{/snippet}
							</Form.Control>
							<Form.Description>Date this member officially rang in.</Form.Description>
							<Form.FieldErrors />
						</Form.Field>

						<Form.Field {form} name="dops">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Passed away (DOPS)</Form.Label>
									<Checkbox {...props} bind:checked={$formData.dops} />
								{/snippet}
							</Form.Control>
							<Form.Description>
								Deceased members are excluded from keg duty on public stats.
							</Form.Description>
							<Form.FieldErrors />
						</Form.Field>
					</div>

					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
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
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<ShieldCheck class="text-muted-foreground size-4" />
						Account &amp; Status
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<Field.Set>
						<Field.Group>
							<Field.Field class="bg-muted/40 rounded-lg border p-3">
								<Field.Label class="text-xs">Account status</Field.Label>
								<Field.Description class="text-foreground mt-1 text-sm font-semibold capitalize">
									{$formData.role}
								</Field.Description>
							</Field.Field>

							<Field.Field>
								<Field.Label class="text-xs">Username</Field.Label>
								<Field.Description class="text-foreground text-sm">
									{data.member.username || "Not set"}
								</Field.Description>
							</Field.Field>

							<Field.Field>
								<Field.Label class="text-xs">Password</Field.Label>
								<Button
									type="button"
									variant="outline"
									onclick={openResetPasswordDialog}
									class="mt-1 flex w-full items-center justify-center gap-2"
								>
									<KeyRound class="size-4" />
									Reset Password
								</Button>
							</Field.Field>
						</Field.Group>

						<Field.Separator />

						<Field.Group>
							<Field.Field>
								<Field.Label class="text-xs">Last login</Field.Label>
								<Field.Description class="text-foreground text-sm">
									{data.member.updated_at?.toLocaleString?.() ?? "Unknown"}
								</Field.Description>
							</Field.Field>
							<Field.Field>
								<Field.Label class="text-xs">Created</Field.Label>
								<Field.Description class="text-foreground text-sm">
									{data.member.created_at?.toLocaleString?.() ?? "Unknown"}
								</Field.Description>
							</Field.Field>
							<Field.Field>
								<Field.Label class="text-xs">Updated</Field.Label>
								<Field.Description class="text-foreground text-sm">
									{data.member.updated_at?.toLocaleString?.() ?? "Unknown"}
								</Field.Description>
							</Field.Field>
						</Field.Group>
					</Field.Set>
				</Card.Content>
			</Card.Root>
		</div>

		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<NotebookPen class="text-muted-foreground size-4" />
					About the Member
				</Card.Title>
			</Card.Header>
			<Card.Content class="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<Form.Field {form} name="bio">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Bio</Form.Label>
							<Textarea
								{...props}
								bind:value={$formData.bio}
								rows={6}
								maxlength={300}
								class="min-h-36"
							/>
						{/snippet}
					</Form.Control>
					<Form.Description>Member biography — up to 300 characters.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="hobbies">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Hobbies</Form.Label>
							<Textarea
								{...props}
								bind:value={$formData.hobbies}
								rows={6}
								maxlength={300}
								class="min-h-36"
							/>
						{/snippet}
					</Form.Control>
					<Form.Description>Hobbies and interests — up to 300 characters.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="likes">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Likes</Form.Label>
							<Textarea
								{...props}
								bind:value={$formData.likes}
								rows={6}
								maxlength={300}
								class="min-h-36"
							/>
						{/snippet}
					</Form.Control>
					<Form.Description>Things the member likes — up to 300 characters.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
			</Card.Content>
		</Card.Root>

		{#if isAdmin}
			<div class="flex flex-col gap-4 md:flex-row md:justify-between">
				<div class="flex flex-col gap-3 sm:flex-row">
					<Button type="submit" disabled={$submitting}
						>{$submitting ? "Updating..." : "Update Member"}</Button
					>
					<Button type="button" variant="outline" onclick={() => history.back()}
						>{$message ? "Close" : "Cancel"}</Button
					>
				</div>

				<div class="flex gap-2">
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
			</div>
		{/if}
	</form>
</div>

<Dialog.Root bind:open={deleteProfileImageDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="text-destructive flex items-center gap-2">
				<Trash2 class="size-5" />
				Delete profile image?
			</Dialog.Title>
			<Dialog.Description>
				This will remove {data.member.name}'s current profile image. You can upload a new one
				anytime.
			</Dialog.Description>
		</Dialog.Header>

		<Dialog.Footer class="mt-4 flex gap-2">
			<Button
				type="button"
				variant="outline"
				onclick={() => (deleteProfileImageDialogOpen = false)}
				disabled={deletingProfileImage}
			>
				No
			</Button>
			<Button
				type="button"
				variant="destructive"
				onclick={confirmDeleteProfileImage}
				disabled={deletingProfileImage}
			>
				{deletingProfileImage ? "Deleting..." : "Yes, delete it"}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

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
					disabled={deleteConfirmText !== "DELETE" || $isDeleting}
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

<!-- Unsaved Changes Navigation Guard -->
<Dialog.Root bind:open={unsavedDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Unsaved changes</Dialog.Title>
			<Dialog.Description>
				You have unsaved changes on this member profile. Save before leaving, or discard your edits.
			</Dialog.Description>
		</Dialog.Header>

		<Dialog.Footer class="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
			<Button type="button" variant="outline" onclick={stayOnPage}>Stay on page</Button>
			<Button type="button" variant="destructive" onclick={discardAndLeave}
				>Discard and leave</Button
			>
			<Button type="button" onclick={saveAndLeave} disabled={$submitting}>
				{$submitting ? "Saving..." : "Save and leave"}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Password Reset Dialog — sends member a one-time email link (Resend) -->
<Dialog.Root bind:open={resetPasswordDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<KeyRound class="size-5" />
				Send password reset
			</Dialog.Title>
			<Dialog.Description>
				We will email {data.member.name} a one-time link to choose a new password. The link expires in
				one hour. Their current password keeps working until they complete the reset.
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/resetPassword" use:enhanceResetPassword>
			<input type="hidden" name="userId" value={data.member.id} />
			<div class="space-y-4">
				{#if !data.member.email?.trim()}
					<div class="bg-destructive/10 text-destructive rounded-md p-4 text-sm">
						This member has no email on file. Add an email to the profile before sending a reset.
					</div>
				{:else}
					<div class="bg-muted/50 rounded-md p-4 text-sm">
						<strong class="text-foreground">To:</strong>
						<span class="text-muted-foreground ml-1">{data.member.email}</span>
					</div>
				{/if}
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
				<Button
					type="submit"
					disabled={$isResettingPassword || !data.member.email?.trim()}
					class="flex items-center gap-2"
				>
					{#if $isResettingPassword}
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
						></div>
						Sending…
					{:else}
						<KeyRound class="size-4" />
						Send reset email
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Toaster closeButton />
