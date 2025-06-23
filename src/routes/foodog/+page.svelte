<script lang="ts">
	const meta = {
		title: 'Foo Dogs | Island Beer Club',
		description:
			'Learn about Foo Dogs (Chinese guardian lions) and their meaning for Island Beer Club. See photos and history of Foo Dogs in our club.',
		image: '/FoDog1.jpg',
		url: 'https://islandbeerclub.com/foodog'
	};
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:image" content={meta.image} />
	<meta property="og:url" content={meta.url} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<section class="text-foreground mx-auto max-w-4xl px-4 py-12">
	<h1 class="text-foreground mb-6 text-center text-3xl font-bold">Foo Dogs</h1>
	<!-- Top image -->
	<figure class="mb-8 flex flex-col items-center">
		<img src="/FoDog1.jpg" alt="Foo Dog 1" class="mb-2 size-64 max-w-full rounded-lg shadow-md" />
	</figure>
	<!-- Responsive two-column layout -->
	<div class="flex flex-col gap-8 md:flex-row md:items-start">
		<figure class="flex flex-col items-center md:w-1/3">
			<img src="/FoDog2.jpg" alt="Foo Dog 2" class="mb-2 size-64 max-w-full rounded-lg shadow-md" />
		</figure>
		<div class="text-muted-foreground max-w-none space-y-4 md:w-2/3">
			<p class="text-base leading-relaxed">
				Foo Dogs, also known as Chinese guardian lions, are a common representation of protection in
				Chinese culture. Traditionally placed in front of palaces, temples, and homes, Foo Dogs are
				believed to ward off evil spirits and bring good fortune. Despite their name, Foo Dogs are
				actually lions, not dogs.
			</p>
			<p class="text-base leading-relaxed">
				The male Foo Dog is typically depicted with a ball under his paw, symbolizing the world or
				power, while the female often has a cub, representing nurture and the cycle of life. Foo
				Dogs are always presented in pairs, with the male on the right and the female on the left
				when facing the entrance.
			</p>
			<p class="text-base leading-relaxed">
				In the context of Island Beer Club, Foo Dogs are a fun nod to tradition and
				protection—guarding our gatherings and ensuring good times for all. Next time you see a Foo
				Dog, give it a nod for good luck!
			</p>
		</div>
	</div>
</section>
