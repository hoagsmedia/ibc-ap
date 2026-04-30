<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";

	let {
		count,
		class: className = ""
	}: {
		count: number | null;
		class?: string;
	} = $props();
</script>

{#if count === null}
	<Badge
		variant="secondary"
		class={`text-muted-foreground/80 flex min-w-[1.5rem] shrink-0 justify-center rounded-sm px-1.5 py-0 text-[10px] tabular-nums ${className}`}
	>
		—
	</Badge>
{:else}
	<Badge
		variant="secondary"
		class={`flex min-w-[1.5rem] shrink-0 justify-center rounded-sm px-1.5 py-0 text-[10px] tabular-nums ${
			count === 3 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : ""
		} ${className}`}
	>
		{count}
	</Badge>
{/if}
