<script lang="ts">
	import type { PageData } from "./$types";
	import { Field, Control, Label, FieldErrors } from "formsnap";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import { toast } from "svelte-sonner";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { superForm } from "sveltekit-superforms";
	import { CONTACT_HONEYPOT_FIELD, CONTACT_LOADED_AT_FIELD } from "$lib/contact-honeypot";
	import { onMount, untrack } from "svelte";
	import { fromAction } from "svelte/attachments";
	import MemberHubPageHeader from "$lib/components/MemberHubPageHeader.svelte";
	import Send from "@lucide/svelte/icons/send";
	import { contactSchema } from "./contact-schema";

	let { data }: { data: PageData } = $props();

	let formLoadedAtMs = $state(Date.now());

	onMount(() => {
		formLoadedAtMs = Date.now();
	});

	// superForm owns the form state after initialisation; it reads the server data only once.
	const form = superForm(
		untrack(() => data.form),
		{
			validators: zodClient(contactSchema),
			resetForm: true,
			onUpdated: ({ form: f }) => {
				if (!f.message) return;
				if (f.message.startsWith("Thank you")) {
					formLoadedAtMs = Date.now();
					toast.success(f.message);
				} else {
					toast.error(f.message);
				}
			},
			onError: ({ result }) => {
				toast.error(result.error?.message ?? "Something went wrong. Please try again.");
			}
		}
	);

	const { form: formData, enhance } = form;
</script>

<svelte:head>
	<title>Contact the club | Island Beer Club</title>
</svelte:head>

<div class="mx-auto w-full max-w-2xl space-y-8 py-6 md:py-10">
	<MemberHubPageHeader
		title="Contact the club"
		description="Questions, ideas or problems with the site — send a note to the club inbox. Replies go to the email address below."
	/>

	<Card.Root>
		<Card.Content class="pt-6">
			<form
				method="POST"
				{@attach fromAction(enhance)}
				class="relative space-y-5"
				autocomplete="off"
			>
				<input type="hidden" name={CONTACT_LOADED_AT_FIELD} value={formLoadedAtMs} />
				<!-- Honeypot: leave empty. readonly + off-screen reduces autofill. -->
				<div
					class="pointer-events-none absolute -left-[10000px] h-px w-px overflow-hidden opacity-0"
					aria-hidden="true"
				>
					<input
						type="text"
						name={CONTACT_HONEYPOT_FIELD}
						value=""
						tabindex={-1}
						autocomplete="off"
						readonly
						data-1p-ignore
						data-lpignore="true"
					/>
				</div>

				<Field {form} name="name">
					<Control>
						{#snippet children({ props })}
							<Label class="mb-1.5 block text-sm font-medium">Name</Label>
							<Input {...props} bind:value={$formData.name} autocomplete="name" />
						{/snippet}
					</Control>
					<FieldErrors class="text-destructive mt-1.5 text-sm" />
				</Field>

				<Field {form} name="email">
					<Control>
						{#snippet children({ props })}
							<Label class="mb-1.5 block text-sm font-medium">Reply-to email</Label>
							<Input {...props} type="email" bind:value={$formData.email} autocomplete="email" />
						{/snippet}
					</Control>
					<FieldErrors class="text-destructive mt-1.5 text-sm" />
				</Field>

				<Field {form} name="message">
					<Control>
						{#snippet children({ props })}
							<Label class="mb-1.5 block text-sm font-medium">Message</Label>
							<Textarea
								{...props}
								bind:value={$formData.message}
								placeholder="How can we help?"
								rows={5}
								class="min-h-[140px] resize-none"
							/>
						{/snippet}
					</Control>
					<FieldErrors class="text-destructive mt-1.5 text-sm" />
				</Field>

				<Button type="submit" class="gap-2">
					<Send class="size-4" />
					Send message
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
