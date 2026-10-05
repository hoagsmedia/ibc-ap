<script lang="ts">
	/**
	 * Existing member rollout: active website accounts among numbered club members.
	 * Counts only; see `$lib/member-rollout-progress` for the population and dedup rules.
	 */
	import { formatRolloutPercent } from "$lib/member-rollout-progress";

	let {
		active,
		total
	}: {
		/** Distinct member numbers with an active website account */
		active: number;
		/** Distinct member numbers in the population */
		total: number;
	} = $props();

	const percent = $derived(formatRolloutPercent({ active, total }));
</script>

<div class="bg-muted/40 rounded-lg px-3 py-2 text-sm" data-testid="member-rollout-progress">
	<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
		Active website accounts
	</p>
	{#if percent === null}
		<p class="text-foreground mt-1">No members in scope yet.</p>
	{:else}
		<p class="text-foreground mt-1">
			<strong class="tabular-nums">{active}</strong> active of
			<strong class="tabular-nums">{total}</strong> members ·
			<strong class="tabular-nums">{percent}</strong>
		</p>
	{/if}
	<p class="text-muted-foreground mt-1 text-xs">
		Scope: numbered club members, admins included, excluding deceased members and prospects. Each
		member number counts once; members without an email are included.
	</p>
</div>
