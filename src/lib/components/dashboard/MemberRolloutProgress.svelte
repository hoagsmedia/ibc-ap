<script lang="ts">
	/**
	 * Compact rollout metric badge: "65/546 active · 11.9%".
	 * Counts only; see `$lib/member-rollout-progress` for the population and dedup rules.
	 */
	import { Badge } from "$lib/components/ui/badge";
	import { formatRolloutPercent } from "$lib/member-rollout-progress";

	let {
		active,
		total,
		class: className = ""
	}: {
		/** Distinct member numbers with an active website account */
		active: number;
		/** Distinct member numbers in the population */
		total: number;
		class?: string;
	} = $props();

	const percent = $derived(formatRolloutPercent({ active, total }));
	const spoken = $derived(
		percent === null
			? "No members to count yet"
			: `${active} of ${total} members have an active website account, ${percent}`
	);
</script>

<Badge
	variant="secondary"
	class="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-emerald-800 tabular-nums dark:text-emerald-300 {className}"
	data-testid="member-rollout-progress"
>
	<span aria-hidden="true">
		{#if percent === null}
			No members
		{:else}
			{active}/{total} active · {percent}
		{/if}
	</span>
	<span class="sr-only">{spoken}</span>
</Badge>
