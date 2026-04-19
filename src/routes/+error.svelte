<script lang="ts">
	import { page } from "$app/state";
	import { Button } from "$lib/components/ui/button";
	import Home from "@lucide/svelte/icons/home";
	import Beer from "@lucide/svelte/icons/beer";

	const status = $derived(page.status);
	const is404 = $derived(status === 404);
	const headline = $derived(is404 ? "This tap’s empty" : "Something went wrong");
	const subtext = $derived(
		page.error && typeof page.error === "object" && "message" in page.error && typeof page.error.message === "string"
			? page.error.message
			: is404
				? "We couldn’t find that page — it may have been moved or the link is off."
				: "Try again in a moment. If this keeps happening, head home and we’ll pour you a fresh page."
	);
</script>

<svelte:head>
	<title>{status} — Island Beer Club</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div
	class="relative flex min-h-[min(72vh,560px)] flex-col items-center justify-center overflow-hidden px-4 py-16 text-center"
>
	<div
		class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_85%_60%_at_50%_-10%,oklch(0.52_0.15_72/0.18),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_100%,oklch(0.65_0.08_145/0.1),transparent_50%),radial-gradient(ellipse_60%_45%_at_0%_80%,oklch(0.55_0.12_72/0.08),transparent_50%)] dark:bg-[radial-gradient(ellipse_85%_60%_at_50%_-10%,oklch(0.76_0.12_72/0.12),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_100%,oklch(0.4_0.06_145/0.15),transparent_50%)]"
		aria-hidden="true"
	></div>

	<div
		class="border-border/50 bg-card/80 text-card-foreground mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm backdrop-blur-sm"
	>
		<Beer class="text-primary size-4 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden="true" />
		<span class="text-muted-foreground font-normal">Error</span>
		<span class="tabular-nums text-foreground">{status}</span>
	</div>

	<h1 class="text-foreground max-w-lg text-balance text-3xl font-bold tracking-tight sm:text-4xl">
		{headline}
	</h1>

	<p class="text-muted-foreground mx-auto mt-4 max-w-md text-pretty text-base leading-relaxed sm:text-lg">
		{subtext}
	</p>

	<div class="mt-10 flex flex-wrap items-center justify-center gap-3">
		<Button href="/" size="lg" class="gap-2 font-semibold">
			<Home class="size-4" strokeWidth={2} aria-hidden="true" />
			Back to home
		</Button>
	</div>
</div>
