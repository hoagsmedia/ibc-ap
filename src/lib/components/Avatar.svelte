<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar";
	import { generateUsername } from "$lib/utils";
	import reef from "$lib/assets/dops-reef.svg";

	const {
		name,
		img,
		class: className,
		dops
	}: { name: string; img?: string; class?: string; dops?: string } = $props();
</script>

{#if dops}
	<div class="relative flex items-center justify-center">
		<img src={reef} alt="Reef overlay" class="absolute z-10 -mb-2 object-fill" />
		<Avatar.Root class={className}>
			{#if img}
				<Avatar.Image class="z-0 object-cover object-top" src={img} alt={name} />
			{/if}
			<Avatar.Fallback>{generateUsername(name)}</Avatar.Fallback>
		</Avatar.Root>
	</div>
{:else}
	<Avatar.Root class={className}>
		{#if img}
			<Avatar.Image class="z-0 object-cover object-top" src={img} alt={name} />
		{/if}
		<Avatar.Fallback>{generateUsername(name)}</Avatar.Fallback>
	</Avatar.Root>
{/if}
