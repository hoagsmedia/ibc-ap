<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { kegCreditsFormSchema } from "$lib/keg-credits-form-schema.js";
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
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import { ArrowLeft } from "@lucide/svelte";
	import type { PageData } from "./$types.js";

	const { data }: { data: PageData } = $props();

	const schema = kegCreditsFormSchema;

	const { form, errors, enhance, submitting } = superForm(data.form, {
		validators: zodClient(schema)
	});
</script>

<svelte:head>
	<title>Add keg credit row | IBC Admin</title>
</svelte:head>

<div class="container mx-auto max-w-lg py-8">
	<HubBackLink href="/admin/stats/keg-credits" class="mb-4 gap-2">
		<ArrowLeft class="h-4 w-4" />
		Keg credits
	</HubBackLink>
	<Card>
		<CardHeader>
			<CardTitle>Add credit row</CardTitle>
			<CardDescription>Rank = display order (who buys next).</CardDescription>
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
					<Label for="member_label">Member name</Label>
					<Input id="member_label" name="member_label" bind:value={$form.member_label} />
					{#if $errors.member_label}
						<p class="text-destructive text-sm">{$errors.member_label}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="member_number">Member #</Label>
					<Input
						id="member_number"
						name="member_number"
						type="number"
						min="1"
						step="1"
						placeholder="Optional"
						bind:value={$form.member_number}
					/>
					{#if $errors.member_number}
						<p class="text-destructive text-sm">{$errors.member_number}</p>
					{/if}
					<p class="text-muted-foreground text-xs">Parsed from legacy `#123` or `#123-1Nov17` on import.</p>
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
