<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import { profileSchema, type ProfileSchema } from './settings-schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';

	let {
		data
	}: {
		data: { form: SuperValidated<Infer<ProfileSchema>>; user: { email?: string | null; username?: string | null; role: string } };
	} = $props();

	const form = superForm(data.form, {
		validators: zodClient(profileSchema),
		resetForm: false,
		onUpdated: ({ form: f }) => {
			if (f.message) {
				const isError = f.message.includes('Failed to update');
				if (isError) toast.error(f.message);
				else toast.success(f.message);
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

	const { form: formData, enhance, submitting } = form;
</script>

<Card.Root class="ibc-hub-surface bg-card/50 rounded-lg p-6 shadow-sm dark:bg-card/35">
	<Card.Header class="text-card-foreground mb-4 text-lg font-medium"
		>Profile Information</Card.Header
	>
	<Card.Content>
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
							rows={6}
							class="min-h-0 h-32 resize-none overflow-y-auto [field-sizing:fixed]"
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
				<label for="username" class="text-card-foreground block text-sm font-medium">Username</label>
				<Input
					id="username"
					value={data.user.username ?? ''}
					disabled
					class="bg-muted text-muted-foreground"
				/>
				<p class="text-muted-foreground mt-1 text-xs">Username cannot be changed here.</p>
			</div>

			<div>
				<label for="email" class="text-card-foreground block text-sm font-medium">Email</label>
				<Input id="email" value={data.user.email ?? ''} disabled class="bg-muted text-muted-foreground" />
				<p class="text-muted-foreground mt-1 text-xs">Contact identifier cannot be changed here</p>
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

				<Button href="/dashboard" variant="ghost" class="ibc-hub-back-link">
					← Back to Dashboard
				</Button>
			</div>
		</form>
	</Card.Content>
</Card.Root>
