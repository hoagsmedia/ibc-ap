<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import { generateUsername } from '$lib/utils';

	const { name, img, class: className }: { name: string; img?: string; class?: string } = $props();
</script>

<Avatar.Root class={className}>
	{#if img}
		<Avatar.Image class="object-cover object-top" src={img} alt={name} />
	{/if}
	<Avatar.Fallback>{generateUsername(name)}</Avatar.Fallback>
</Avatar.Root>
