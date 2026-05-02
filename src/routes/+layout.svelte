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
			p.startsWith("/test") ||
			p === "/events" ||
			p.startsWith("/events/")
		);
	});

	/** Contact page includes its own footer to match the full-page design. */
	const hidePublicFooter = $derived(page.url.pathname === "/contact");

	// Skip in dev: avoids loading va.vercel-scripts.com debug script + page subscription overhead.
	if (!dev) {
		injectAnalytics();
	}
</script>

<div class="bg-background relative mx-auto flex min-h-dvh w-full flex-col">
	{#if !memberHubShell}
		<Navbar />
	{/if}
	<main class="w-full flex-1">
		{#if memberHubShell}
			<MemberHubShell>
				{@render children()}
			</MemberHubShell>
		{:else}
			<div class="mx-auto max-w-4xl px-4">
				{@render children()}
			</div>
		{/if}
	</main>
	{#if !memberHubShell && !hidePublicFooter}
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
