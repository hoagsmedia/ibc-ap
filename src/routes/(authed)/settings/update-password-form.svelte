<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Card from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { updatePasswordSchema, type UpdatePasswordSchema } from './settings-schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';

	const { data }: { data: { updatePasswordForm: SuperValidated<Infer<UpdatePasswordSchema>> } } =
		$props();

	// Initialize superform
	const form = superForm(data.updatePasswordForm, {
		validators: zodClient(updatePasswordSchema),
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
				toast.error('An error occurred while updating your password');
			}
		}
	});

	const { form: formData, enhance, submitting } = form;
</script>

<!-- Update Password Section -->
<Card.Root class="bg-card rounded-lg p-6 shadow">
	<Card.Header class="text-card-foreground mb-4 text-lg font-medium">Update Password</Card.Header>
	<Card.Content>
		<form method="POST" action="?/updatePassword" use:enhance>
			<Form.Field {form} name="currentPassword">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Current Password</Form.Label>
						<Input
							{...props}
							type="password"
							bind:value={$formData.currentPassword}
							disabled={$submitting}
							placeholder="Your current password"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="newPassword">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>New Password</Form.Label>
						<Input
							{...props}
							type="password"
							bind:value={$formData.newPassword}
							disabled={$submitting}
							placeholder="Your new password"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="confirmPassword">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Confirm New Password</Form.Label>
						<Input
							{...props}
							type="password"
							bind:value={$formData.confirmPassword}
							disabled={$submitting}
							placeholder="Confirm your new password"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Button type="submit" disabled={$submitting} class="mt-4 w-full">
				{$submitting ? 'Updating Password...' : 'Update Password'}
			</Button>
		</form>
	</Card.Content>
</Card.Root>
