<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { createMemberSchema } from "./create-member-schema";
	import HubBackLink from "$lib/components/HubBackLink.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { ArrowLeft, UserPlus } from "@lucide/svelte";
	import { toastAdminActionFailure } from "$lib/admin-action-toast";
	import type { PageData } from "./$types";

	const props: { data: PageData } = $props();

	const schema = createMemberSchema;

	const { form, errors, enhance, submitting } = superForm(props.data.form, {
		id: "dashboard-create-member",
		validators: zodClient(schema),
		onResult: ({ result }) => {
			if (result.type === "failure") {
				toastAdminActionFailure(result.data, "Could not create member. Check the form.", {
					duration: 8000
				});
			}
		}
	});
</script>

<svelte:head>
	<title>Add member | Island Beer Club</title>
</svelte:head>

<div class="mx-auto flex w-full min-w-0 max-w-lg flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h1 class="min-w-0 text-2xl font-bold tracking-tight sm:text-3xl">Add member</h1>
		<HubBackLink href="/dashboard/members" size="sm" class="shrink-0 gap-2">
			<ArrowLeft class="size-4" />
			Directory
		</HubBackLink>
	</div>

	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2 text-lg">
				<UserPlus class="size-5 shrink-0" />
				Add Current Member
			</CardTitle>
			<CardDescription>
				Use this only to add current members to the Member Directory. To invite someone new, use
				the <a href="/dashboard/invitations" class="underline underline-offset-4">Invitations page</a>.
				After you create this profile, use Reset password on their edit page before they can sign
				in.
			</CardDescription>
		</CardHeader>
		<CardContent>
			<form method="POST" action="?/create" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="name">Full name</Label>
					<Input id="name" name="name" autocomplete="name" bind:value={$form.name} />
					{#if $errors.name}
						<p class="text-destructive text-sm">{$errors.name}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input id="email" name="email" type="email" autocomplete="email" bind:value={$form.email} />
					{#if $errors.email}
						<p class="text-destructive text-sm">{$errors.email}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="mbr">Member number</Label>
					<Input id="mbr" name="mbr" type="number" min="1" bind:value={$form.mbr} />
					{#if $errors.mbr}
						<p class="text-destructive text-sm">{$errors.mbr}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="phone">Phone <span class="text-muted-foreground font-normal">(optional)</span></Label>
					<Input id="phone" name="phone" type="tel" autocomplete="tel" bind:value={$form.phone} />
					{#if $errors.phone}
						<p class="text-destructive text-sm">{$errors.phone}</p>
					{/if}
				</div>
				<Button type="submit" class="w-full sm:w-auto" disabled={$submitting}>
					{#if $submitting}
						Creating…
					{:else}
						Create profile
					{/if}
				</Button>
			</form>
		</CardContent>
	</Card>
</div>
