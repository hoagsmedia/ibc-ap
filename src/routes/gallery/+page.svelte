<script lang="ts">
	import { onMount } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import GalleryCarousel from './gallery-carousel.svelte';

	let images = $state<string[]>([]);
	let open = $state(false);
	let activeIndex = $state(0);

	onMount(async () => {
		// Fetch from the correct gallery endpoint
		const res = await fetch('/gallery');
		if (res.ok) {
			images = await res.json();
		}
	});

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

<section class="mx-auto max-w-6xl px-4 py-12">
	<h1 class="mb-8 text-4xl font-bold">IBC Travel Gallery</h1>
	<p class="mb-8 text-lg text-white">
		A global collection of Island Beer Club adventures. Click any photo to view full size.
	</p>
	<div class="columns-4 gap-4 [column-fill:_balance] sm:columns-2 md:columns-3">
		<!-- Masonry grid -->
		{#each images as img, i}
			<button
				type="button"
				class="mb-4 block w-full focus:outline-none"
				onclick={() => openDialog(i)}
			>
				<img
					src={img}
					alt="IBC Travel"
					class="w-full rounded-lg shadow transition hover:scale-105 hover:shadow-lg"
					loading="lazy"
				/>
			</button>
		{/each}
	</div>

	<Dialog.Root bind:open>
		<Dialog.Content class="flex  flex-col items-center  ">
			<Dialog.Header class="w-full">
				<Dialog.Title>IBC Travel Gallery</Dialog.Title>
				<Dialog.Description class="items-center ">
					<GalleryCarousel {images} selected={activeIndex} />
				</Dialog.Description>
			</Dialog.Header>
		</Dialog.Content>
	</Dialog.Root>
</section>
