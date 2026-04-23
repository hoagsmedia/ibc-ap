<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import type { Snippet } from "svelte";

	let {
		href,
		ariaLabel,
		class: className = "",
		children
	}: {
		href: string;
		ariaLabel?: string;
		class?: string;
		children?: Snippet;
	} = $props();

	const baseClass =
		"border-border/55 bg-muted/20 text-foreground hover:bg-muted/35 h-auto min-h-12 justify-start gap-3 px-3 py-2.5 font-medium shadow-sm";
</script>

<Button href={href} variant="outline" aria-label={ariaLabel} class={`${baseClass} ${className}`.trim()}>
	{@render children?.()}
</Button>
