<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import type { ComponentProps } from "svelte";
	import type { Snippet } from "svelte";

	type Btn = ComponentProps<typeof Button>;

	let {
		class: className,
		children,
		...rest
	}: Omit<Btn, "variant" | "class" | "children"> & {
		class?: string;
		children: Snippet;
	} = $props();
</script>

<!--
	Glass “chip” back / up navigation for member hub routes.
	Place in the page body beside the main heading (hub shell header stays title-only).
	Uses outline as a structural base; `.hub-back-chip` overrides with frosted glass (see app.css).
-->
<Button variant="outline" class={cn("hub-back-chip", className)} {...rest}>
	{@render children()}
</Button>
