<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	const meta = {
		title: "IBCsScience Corner | Island Beer Club",
		description:
			"Explore the science of beer and life with Island Beer Club. Fun facts, physics, and more for the curious drinker. Have a science question or fun fact? Let us know and we'll add it here!"
	};
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<section class="mx-auto max-w-4xl px-4 py-12">
	<h1 class="text-foreground mb-8 text-center text-4xl font-bold">IBC Science Corner</h1>

	<!-- Legacy Science Primer Section -->
	<Card.Root class="bg-card mb-10 rounded-lg border p-6 shadow-md">
		<Card.Header class="text-primary mb-4 text-2xl font-semibold"
			>Island Beer Club Science Primer
			<p class="text-muted-foreground text-sm">
				This is where we educate our readers with theory, along with everyday examples... Stuff we
				can all relate to.
			</p>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col items-center gap-6 md:flex-row md:justify-center">
				<img
					src="/beer-smasher.gif"
					alt="Beer Smasher"
					class="max-w-xs rounded-lg border shadow-sm"
					width="350"
					height="230"
				/>
			</div>
			<p class="text-card-foreground mt-6 leading-relaxed">
				In <a
					href="https://en.wikipedia.org/wiki/Physics"
					class="text-primary hover:text-primary/80 underline underline-offset-2"
					target="_blank"
					rel="noopener">physics</a
				>, force is an
				<a
					href="https://en.wikipedia.org/wiki/Influence"
					class="text-primary hover:text-primary/80 underline underline-offset-2"
					target="_blank"
					rel="noopener">influence</a
				>
				that may cause a
				<a
					href="https://en.wikipedia.org/wiki/Physical_body"
					class="text-primary hover:text-primary/80 underline underline-offset-2"
					target="_blank"
					rel="noopener">body</a
				>
				to
				<a
					href="https://en.wikipedia.org/wiki/Acceleration"
					class="text-primary hover:text-primary/80 underline underline-offset-2"
					target="_blank"
					rel="noopener">accelerate</a
				>. It may be experienced as a lift, a push, or a pull. The actual acceleration of the body
				is determined by the vector sum of all forces acting on it (known as
				<a
					href="https://en.wikipedia.org/wiki/Net_force"
					class="text-primary hover:text-primary/80 underline underline-offset-2"
					target="_blank"
					rel="noopener">net force</a
				>
				or resultant force). In an extended body, force may also cause
				<a
					href="https://en.wikipedia.org/wiki/Rotate"
					class="text-primary hover:text-primary/80 underline underline-offset-2"
					target="_blank"
					rel="noopener">rotation</a
				>
				or
				<a
					href="https://en.wikipedia.org/wiki/Deformation"
					class="text-primary hover:text-primary/80 underline underline-offset-2"
					target="_blank"
					rel="noopener">deformation</a
				> of the body.
			</p>
			<div class="my-6 flex flex-col items-center md:flex-row md:justify-center">
				<img
					src="/wave.gif"
					alt="Wave Animation"
					class="max-w-lg rounded-lg border shadow-sm"
					width="550"
					height="420"
				/>
			</div>
			<p class="text-card-foreground mt-6 leading-relaxed">
				<a
					href="https://en.wikipedia.org/wiki/Hooke%27s_law"
					class="text-primary hover:text-primary/80 underline underline-offset-2"
					target="_blank"
					rel="noopener">Hooke's law</a
				>
				of
				<a
					href="https://en.wikipedia.org/wiki/Theory_of_elasticity"
					class="text-primary hover:text-primary/80 underline underline-offset-2"
					target="_blank"
					rel="noopener">elasticity</a
				>
				states that the extension of an elastic body (its distended length minus its relaxed length)
				is linearly proportional to its
				<a
					href="https://en.wikipedia.org/wiki/Tension_%28mechanics%29"
					class="text-primary hover:text-primary/80 underline underline-offset-2"
					target="_blank"
					rel="noopener">tension</a
				>, the
				<a
					href="https://en.wikipedia.org/wiki/Force"
					class="text-primary hover:text-primary/80 underline underline-offset-2"
					target="_blank"
					rel="noopener">force</a
				>
				used to stretch it. Similarly, the contraction (negative extension) is proportional to the
				<a
					href="https://en.wikipedia.org/wiki/Physical_compression"
					class="text-primary hover:text-primary/80 underline underline-offset-2"
					target="_blank"
					rel="noopener">compression</a
				> (negative tension).
			</p>
		</Card.Content>
	</Card.Root>

	<!-- Modern Science Content -->
	<Card.Root>
		<Card.Header>
			<p class="text-primary text-center text-lg font-semibold">
				Physics, Beer, and the Pursuit of Happiness
			</p>
		</Card.Header>
		<Card.Content>
			<p class="text-card-foreground leading-relaxed">
				Welcome to the IBC Science Corner! Here we explore the fun side of science, physics, and
				beer. Whether you're curious about the chemistry of brewing, the physics of foam, or just
				want to impress your friends with beer trivia, you're in the right place.
			</p>
			<h2 class="text-foreground mt-8 mb-4 text-xl font-semibold">Fun Beer Science Facts</h2>
			<ul class="text-card-foreground space-y-3">
				<li>
					<strong class="text-foreground">Why does beer foam?</strong> The bubbles in beer are carbon
					dioxide, released during fermentation. Pouring beer releases these bubbles, creating foam (head).
					The proteins and hops in beer help stabilize the foam.
				</li>
				<li>
					<strong class="text-foreground">Why do bubbles rise?</strong> Bubbles are less dense than liquid,
					so they rise to the top. In some beers (like Guinness), nitrogen bubbles can appear to sink
					due to the glass shape and circulation currents.
				</li>
				<li>
					<strong class="text-foreground">Why does beer taste better in a glass?</strong> Pouring beer
					into a glass releases aromas and lets you see the color and clarity, enhancing the experience.
				</li>
				<li>
					<strong class="text-foreground">How cold should beer be?</strong> Most craft beers are best
					enjoyed between 45–55°F (7–13°C). Lighter beers can be colder, but too cold can mute flavors.
				</li>
				<li>
					<strong class="text-foreground">What is IBU?</strong> International Bitterness Units (IBU)
					measure the bitterness of beer, mostly from hops. The higher the IBU, the more bitter the beer.
				</li>
			</ul>
			<h2 class="text-foreground mt-8 mb-4 text-xl font-semibold">
				Physics of Life <span class="text-muted-foreground text-md"> - and Beer</span>
			</h2>
			<ul class="text-card-foreground space-y-3">
				<li>
					<strong class="text-foreground">Conservation of Beer:</strong> Beer cannot be created or destroyed,
					only transferred from one container to another (preferably your glass).
				</li>
				<li>
					<strong class="text-foreground">Law of Gravity:</strong> What goes up must come down—especially
					true for beer foam and, occasionally, beer drinkers.
				</li>
				<li>
					<strong class="text-foreground">Thermodynamics:</strong> Cold beer warms up, warm beer does
					not cool down (unless you have a fridge).
				</li>
			</ul>
			<p class="text-muted-foreground mt-6 italic">
				Have a science question or fun fact? Let us know and we'll add it here!
			</p>
		</Card.Content>
	</Card.Root>
</section>
