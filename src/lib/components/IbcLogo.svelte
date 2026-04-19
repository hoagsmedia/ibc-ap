<script lang="ts">
	import raw from "$lib/assets/ibc-logo.svg?raw";
	import { cn } from "$lib/utils.js";

	type Props = {
		class?: string;
		/** When true, hide from assistive tech (use if the surrounding link/heading names the club). */
		decorative?: boolean;
	};

	let { class: className = "", decorative = false }: Props = $props();

	const markup = $derived(raw.replace(/^<\?xml[^?]*\?>\s*/i, "").trim());
</script>

<span
	class={cn("ibc-logo-themed text-foreground [&>svg]:block [&>svg]:max-w-full", className)}
	aria-hidden={decorative ? true : undefined}
>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- bundled static SVG only -->
	{@html markup}
</span>
