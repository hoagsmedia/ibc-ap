<script module>
	import "../app.css";
</script>

<script lang="ts">
	import Navbar from "$lib/components/Navbar.svelte";
	import MemberHubShell from "$lib/components/MemberHubShell.svelte";
	import { dev } from "$app/environment";
	import { page } from "$app/state";
	import { ModeWatcher } from "mode-watcher";
	import { Toaster } from "$lib/components/ui/sonner";
	import { injectAnalytics } from "@vercel/analytics/sveltekit";
	import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";

	let { children } = $props();

	/** Logged-in member hub: same sidebar + top bar as /dashboard for linked app sections. */
	const memberHubShell = $derived.by(() => {
		if (!page.data.user) return false;
		const p = page.url.pathname;
		return (
			p.startsWith("/dashboard") ||
			(p !== "/members" && p.startsWith("/members")) ||
			p.startsWith("/settings") ||
			p.startsWith("/admin") ||
			p.startsWith("/test")
		);
	});

	// Skip in dev: avoids loading Vercel analytics/speed-insights scripts locally.
	if (!dev) {
		injectAnalytics();
		injectSpeedInsights();
	}
</script>

<div class="bg-background relative mx-auto flex min-h-dvh w-full flex-col">
	{#if memberHubShell}
		<MemberHubShell>
			{@render children()}
		</MemberHubShell>
	{:else}
		<Navbar />
		<main id="main-content" class="w-full flex-1">
			<div class="mx-auto max-w-4xl px-4">
				{@render children()}
			</div>
		</main>
		<footer class="py-6 md:px-8 md:py-0">
			<div class="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
				<p
					class="text-muted-foreground text-center text-sm leading-loose text-balance md:text-left"
				>
					© {new Date().getFullYear()} Island Beer Club. All rights reserved.
				</p>
			</div>
		</footer>
	{/if}
</div>

<Toaster />
<ModeWatcher defaultMode="light" />
