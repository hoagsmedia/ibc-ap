<script lang="ts">
	import EventBrowseSections from "$lib/components/events/EventBrowseSections.svelte";
	import MemberHubPageHeader from "$lib/components/MemberHubPageHeader.svelte";
	import type { PageData } from "./$types.js";

	const { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Events | Island Beer Club</title>
	<meta name="description" content="Club events for members — Island Beer Club." />
</svelte:head>

<div class="mx-auto w-full max-w-6xl px-4 py-8">
	<MemberHubPageHeader
		title="Club events"
		description="Live calendar from the club database. Full members see every published event (open and members-only). Prospects see open events only."
	>
		{#snippet descriptionExtra()}
			{#if !data.canViewMembersOnly}
				<p class="text-muted-foreground text-sm">
					You’re only seeing events that aren’t marked members-only. Full members see the complete
					calendar here.
				</p>
			{/if}
		{/snippet}
	</MemberHubPageHeader>

	<EventBrowseSections events={data.events} showAccessLegend={data.canViewMembersOnly} />
</div>
