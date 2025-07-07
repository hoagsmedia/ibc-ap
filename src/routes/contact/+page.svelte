<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Field, Control, Label, FieldErrors, Description } from 'formsnap';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { toast } from 'svelte-sonner';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { superForm } from 'sveltekit-superforms';
	import { contactSchema } from './contact-schema';
	import logo from '$lib/assets/ibc-logo.svg';
	import SuperDebug from 'sveltekit-superforms';

	let { data }: { data: PageData } = $props();

	const form = superForm(data.form, {
		validators: zodClient(contactSchema),
		resetForm: true,
		onUpdate: ({ form: f }) => {
			if (f.valid) {
				toast.success(`You submitted ${JSON.stringify(f.data, null, 2)}`);
			} else {
				toast.error('Please fix the errors in the form.');
			}
		}
	});

	const { form: formData, enhance, errors, submitting } = form;
</script>

<div class="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
	<div class="flex w-full max-w-sm flex-col gap-3">
		<a href="##" class="flex items-center self-center font-medium">
			<div class="flex size-24 items-center justify-center rounded-md">
				<img src={logo} alt="Island Beer Club Logo" class="w-[90px] object-contain px-2" />
			</div>
		</a>
		<div class="flex flex-col gap-6">
			<Card.Root>
				<Card.Header class="text-center">
					<Card.Title class="text-xl">Contact Us</Card.Title>
					<Card.Description>We're here to help!</Card.Description>
				</Card.Header>
				<Card.Content>
					<form method="POST" use:enhance>
						<div class="grid gap-6">
							<Field {form} name="name">
								<Control>
									{#snippet children({ props })}
										<Label>Name</Label>
										<Input {...props} bind:value={$formData.name} />
									{/snippet}
								</Control>
								<FieldErrors />
							</Field>
							<Field {form} name="email">
								<Control>
									{#snippet children({ props })}
										<Label>Email</Label>
										<Input {...props} bind:value={$formData.email} />
									{/snippet}
								</Control>
								<FieldErrors />
							</Field>
							<Field {form} name="message">
								<Control>
									{#snippet children({ props })}
										<Label>Message</Label>
										<Textarea {...props} bind:value={$formData.message} />
									{/snippet}
								</Control>
								<FieldErrors />
							</Field>
							<Button type="submit" class="w-full">Send Message</Button>
						</div>
					</form>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
<!-- <SuperDebug data={$formData} /> -->
