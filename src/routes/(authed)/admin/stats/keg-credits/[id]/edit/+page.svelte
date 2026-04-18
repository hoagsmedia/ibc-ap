<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { z } from "zod";
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
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import { ArrowLeft } from "@lucide/svelte";
	import type { PageData } from "./$types.js";

	const { data }: { data: PageData } = $props();

	const schema = z.object({
		sort_order: z.coerce.number().int(),
		member_label: z.string().min(1),
		credits: z.coerce.number().nonnegative(),
		is_cik: z.boolean().default(false)
	});

	const { form, errors, enhance, submitting } = superForm(data.form, {
		validators: zodClient(schema)
	});
</script>

<svelte:head>
	<title>Edit keg credit | IBC Admin</title>
</svelte:head>

<div class="container mx-auto max-w-lg py-8">
	<Button href="/admin/stats/keg-credits" variant="ghost" class="mb-4 gap-2">
		<ArrowLeft class="h-4 w-4" />
		Keg credits
	</Button>
	<Card>
		<CardHeader>
			<CardTitle>Edit credit row</CardTitle>
			<CardDescription>Update rank, label, credits, or CIK.</CardDescription>
		</CardHeader>
		<CardContent>
			<form method="POST" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="sort_order">Rank (sort order)</Label>
					<Input id="sort_order" name="sort_order" type="number" bind:value={$form.sort_order} />
					{#if $errors.sort_order}
						<p class="text-destructive text-sm">{$errors.sort_order}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="member_label">Member label</Label>
					<Input id="member_label" name="member_label" bind:value={$form.member_label} />
					{#if $errors.member_label}
						<p class="text-destructive text-sm">{$errors.member_label}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="credits">Credits</Label>
					<Input id="credits" name="credits" type="number" step="any" bind:value={$form.credits} />
					{#if $errors.credits}
						<p class="text-destructive text-sm">{$errors.credits}</p>
					{/if}
				</div>
				<div class="flex items-center gap-2">
					<Checkbox id="is_cik" name="is_cik" bind:checked={$form.is_cik} />
					<Label for="is_cik">Credits in kind (CIK)</Label>
				</div>
				<Button type="submit" disabled={$submitting} class="w-full">Save</Button>
			</form>
		</CardContent>
	</Card>
</div>
