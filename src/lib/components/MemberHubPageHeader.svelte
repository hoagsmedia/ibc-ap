<script lang="ts">
	import HubBackLink from "$lib/components/HubBackLink.svelte";
	import { ArrowLeft } from "@lucide/svelte/icons";
	import type { Snippet } from "svelte";

	let {
		title,
		description,
		backHref = "/dashboard",
		backLabel = "Back to dashboard",
		descriptionExtra
	}: {
		title: string;
		description: string;
		backHref?: string;
		backLabel?: string;
		/** Optional block below the main description (e.g. conditional notes). */
		descriptionExtra?: Snippet;
	} = $props();
</script>

<div class="mb-8 flex flex-wrap items-start justify-between gap-4">
	<div class="min-w-0">
		<h1 class="text-foreground text-3xl font-bold">{title}</h1>
		<p class="text-muted-foreground mt-2 text-sm">{description}</p>
		{#if descriptionExtra}
			<div class="mt-2">
				{@render descriptionExtra()}
			</div>
		{/if}
	</div>
	<HubBackLink href={backHref} size="sm" class="shrink-0 gap-2">
		<ArrowLeft class="size-4" />
		{backLabel}
	</HubBackLink>
</div>
