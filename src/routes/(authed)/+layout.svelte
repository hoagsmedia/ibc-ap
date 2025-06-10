<script lang="ts">
	import { enhance } from '$app/forms';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();
</script>

<!-- Main content -->
<main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
	{@render children()}
</main>
