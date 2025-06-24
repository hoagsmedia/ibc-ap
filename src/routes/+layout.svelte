<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	let { children } = $props();
</script>

<div class="bg-background relative mx-auto flex min-h-dvh w-full flex-col">
	<Navbar />
	<main class="w-full flex-1">
		<div class="mx-auto max-w-4xl px-4">
			{@render children()}
		</div>
	</main>
	<footer class="py-6 md:px-8 md:py-0">
		<div class="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
			<p class="text-muted-foreground text-center text-sm leading-loose text-balance md:text-left">
				© {new Date().getFullYear()} Island Beer Club. All rights reserved.
			</p>
		</div>
	</footer>
</div>

<Toaster />
<ModeWatcher />
