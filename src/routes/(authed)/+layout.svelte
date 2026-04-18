<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<!-- Main content -->
<main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
	{@render children()}
</main>
