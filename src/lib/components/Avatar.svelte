<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar";
	import { generateUsername } from "$lib/utils";
	import reef from "$lib/assets/dops-reef.svg";
	import { cn, type WithElementRef } from "$lib/utils";

	const {
		name,
		img,
		class: className,
		dops
	}: {
		name: string;
		img?: string;
		class?: string;
		dops?: string;
	} & WithElementRef<HTMLImageElement> = $props();
</script>

{#if dops}
	<div class="relative flex items-center justify-center">
		<img
			src={reef}
			alt="Reef overlay"
			class={cn("absolute z-10 -mb-[17%] scale-125", className)}
			style="filter: var(--reef-filter);"
		/>
		<Avatar.Root class={className}>
			{#if img}
				<Avatar.Image class="object-cover object-top" src={img} alt={name} />
			{/if}
			<Avatar.Fallback>{generateUsername(name)}</Avatar.Fallback>
		</Avatar.Root>
	</div>
{:else}
	<div class="flex items-center justify-center">
		<Avatar.Root class={cn("relative flex items-center justify-center ", className)}>
			{#if img}
				<Avatar.Image class="absolute object-cover object-top" src={img} alt={name} />
			{/if}
			<Avatar.Fallback>{generateUsername(name)}</Avatar.Fallback>
		</Avatar.Root>
	</div>
{/if}
