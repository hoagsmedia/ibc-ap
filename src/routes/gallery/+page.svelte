<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Separator from '$lib/components/ui/separator/index.js';
	import GalleryCarousel from './gallery-carousel.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let open = $state(false);
	let activeIndex = $state(0);

	function openDialog(index: number) {
		activeIndex = index;
		open = true;
	}
</script>

<svelte:head>
	<title>IBC Travel Gallery | Island Beer Club</title>
	<meta
		name="description"
		content="A global gallery of Island Beer Club adventures. See our members around the world!"
	/>
	<meta property="og:title" content="IBC Travel Gallery | Island Beer Club" />
	<meta
		property="og:description"
		content="A global gallery of Island Beer Club adventures. See our members around the world!"
	/>
</svelte:head>

<section class="mx-auto max-w-6xl px-4 py-8 sm:py-12">
	<div class="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
		<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">IBC Travel Gallery</h1>
		<p class="text-muted-foreground mt-3 text-sm sm:text-base">
			A simple mobile-first feed of Island Beer Club adventures from around the world.
		</p>
	</div>

	<div class="mx-auto flex max-w-xl flex-col gap-6 lg:max-w-5xl lg:grid lg:grid-cols-2 xl:grid-cols-3">
		{#each data.items as item, i (item.src)}
			<Card.Root class="overflow-hidden border-border/70 bg-card/95 shadow-sm">
				<button
					type="button"
					class="block w-full bg-muted focus:outline-none"
					onclick={() => openDialog(i)}
					aria-label={`Open ${item.title}`}
				>
					<img
						src={item.src}
						alt={item.title}
						class="w-full bg-muted object-cover"
						loading="lazy"
					/>
				</button>

				<Card.Content class="space-y-3 p-4 sm:p-5">
					<div class="flex items-center justify-between gap-3">
						<Badge variant="secondary">Travel Gallery</Badge>
						<span class="text-muted-foreground text-xs">#{i + 1}</span>
					</div>

					<div class="space-y-1">
						<h2 class="text-base font-semibold sm:text-lg">{item.title}</h2>
						<p class="text-muted-foreground text-sm">{item.details}</p>
					</div>

					{#if item.dateLabel}
						<Separator.Root />
						<p class="text-muted-foreground text-xs uppercase tracking-[0.2em]">
							Captured {item.dateLabel}
						</p>
					{/if}
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<Dialog.Root bind:open>
		<Dialog.Content class="flex max-h-[90vh] max-w-4xl flex-col items-center overflow-hidden">
			<Dialog.Header class="w-full">
				<Dialog.Title>{data.items[activeIndex]?.title ?? 'IBC Travel Gallery'}</Dialog.Title>
				<Dialog.Description>
					{data.items[activeIndex]?.details ?? 'Island Beer Club travel gallery'}
				</Dialog.Description>
			</Dialog.Header>

			<div class="w-full overflow-auto">
				<GalleryCarousel images={data.images} selected={activeIndex} />
			</div>
		</Dialog.Content>
	</Dialog.Root>
</section>
