<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import type { CarouselAPI } from '$lib/components/ui/carousel/context.js';

	let { images, selected } = $props<{ images: string[]; selected: number }>();
	let api = $state<CarouselAPI>();
	const count = $derived(api ? api.scrollSnapList().length : 0);
	let current = $state(0);

	$effect(() => {
		if (api) {
			// api.startIndex( selected ?? 0);
			api.scrollTo(selected ?? 0, true);
			current = api.selectedScrollSnap() + 1;
			api.on('select', () => {
				current = api!.selectedScrollSnap() + 1;
			});
		}
	});
</script>

<div>
	<Carousel.Root setApi={(emblaApi) => (api = emblaApi)} class="">
		<Carousel.Content>
			{#each images as img, i (i)}
				<Carousel.Item>
					<div class="p-1">
						<Card.Root>
							<Card.Content>
								<img src={img} class="" alt="IBC Travel Full Size" />
							</Card.Content>
						</Card.Root>
					</div>
				</Carousel.Item>
			{/each}
		</Carousel.Content>
		<Carousel.Previous />
		<Carousel.Next />
	</Carousel.Root>
	<div class="text-muted-foreground py-2 text-center text-sm">
		Slide {current} of {count}
	</div>
</div>
