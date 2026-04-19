<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { z } from "zod";
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
	import { ArrowLeft } from "@lucide/svelte";
	import type { PageData } from "./$types.js";

	const { data }: { data: PageData } = $props();

	const schema = z.object({
		keg_number: z.coerce.number().int().positive(),
		beer_name: z.string().optional(),
		purchased_on: z.string().optional(),
		delivered_on: z.string().optional(),
		finished_on: z.string().optional(),
		gallons: z.coerce.number().positive()
	});

	const { form, errors, enhance, submitting } = superForm(data.form, {
		validators: zodClient(schema)
	});
</script>

<svelte:head>
	<title>Edit keg consumption | IBC Admin</title>
</svelte:head>

<div class="container mx-auto max-w-lg py-8">
	<HubBackLink href="/admin/stats/beer-consumed" class="mb-4 gap-2">
		<ArrowLeft class="h-4 w-4" />
		Beer consumed
	</HubBackLink>
	<Card>
		<CardHeader>
			<CardTitle>Edit keg row</CardTitle>
			<CardDescription>Update keg #, dates, gallons, or beer name.</CardDescription>
		</CardHeader>
		<CardContent>
			<form method="POST" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="keg_number">Keg #</Label>
					<Input id="keg_number" name="keg_number" type="number" bind:value={$form.keg_number} />
					{#if $errors.keg_number}
						<p class="text-destructive text-sm">{$errors.keg_number}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="gallons">Gallons</Label>
					<Input id="gallons" name="gallons" type="number" step="any" bind:value={$form.gallons} />
					{#if $errors.gallons}
						<p class="text-destructive text-sm">{$errors.gallons}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="beer_name">Beer name</Label>
					<Input id="beer_name" name="beer_name" bind:value={$form.beer_name} />
				</div>
				<div class="space-y-2">
					<Label for="purchased_on">Purchased</Label>
					<Input id="purchased_on" name="purchased_on" type="date" bind:value={$form.purchased_on} />
				</div>
				<div class="space-y-2">
					<Label for="delivered_on">Delivered</Label>
					<Input id="delivered_on" name="delivered_on" type="date" bind:value={$form.delivered_on} />
				</div>
				<div class="space-y-2">
					<Label for="finished_on">Finished</Label>
					<Input id="finished_on" name="finished_on" type="date" bind:value={$form.finished_on} />
				</div>
				<Button type="submit" disabled={$submitting} class="w-full">Save</Button>
			</form>
		</CardContent>
	</Card>
</div>
