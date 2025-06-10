<script lang="ts">
	const meta = {
		title: 'IBC Science Corner | Island Beer Club',
		description:
			'Explore the science of beer and life with Island Beer Club. Fun facts, physics, and more for the curious drinker.',
		image: '/groupGarage.jpg',
		url: 'https://islandbeerclub.com/science'
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

<section class="mx-auto max-w-2xl px-4 py-12 text-black">
	<h1 class="mb-6 text-center text-3xl font-bold">IBC Science Corner</h1>

	<!-- Legacy Science Primer Section -->
	<div class="mb-10 rounded-lg bg-white/80 p-6 shadow">
		<h2 class="mb-2 text-2xl font-semibold text-yellow-700">Island Beer Club Science Primer...</h2>
		<p class="mb-4 text-base text-gray-700">
			This is where we educate our readers with theory, along with everyday examples... Stuff we can
			all relate to.
		</p>
		<hr class="my-4 border-yellow-300" />
		<div class="flex flex-col items-center gap-6 md:flex-row md:justify-center">
			<img
				src="/beer-smasher.gif"
				alt="Beer Smasher"
				class="max-w-xs rounded shadow"
				width="350"
				height="230"
			/>
		</div>
		<p class="mt-6 text-base text-gray-700">
			In <a
				href="https://en.wikipedia.org/wiki/Physics"
				class="text-blue-700 underline"
				target="_blank"
				rel="noopener">physics</a
			>, force is an
			<a
				href="https://en.wikipedia.org/wiki/Influence"
				class="text-blue-700 underline"
				target="_blank"
				rel="noopener">influence</a
			>
			that may cause a
			<a
				href="https://en.wikipedia.org/wiki/Physical_body"
				class="text-blue-700 underline"
				target="_blank"
				rel="noopener">body</a
			>
			to
			<a
				href="https://en.wikipedia.org/wiki/Acceleration"
				class="text-blue-700 underline"
				target="_blank"
				rel="noopener">accelerate</a
			>. It may be experienced as a lift, a push, or a pull. The actual acceleration of the body is
			determined by the vector sum of all forces acting on it (known as
			<a
				href="https://en.wikipedia.org/wiki/Net_force"
				class="text-blue-700 underline"
				target="_blank"
				rel="noopener">net force</a
			>
			or resultant force). In an extended body, force may also cause
			<a
				href="https://en.wikipedia.org/wiki/Rotate"
				class="text-blue-700 underline"
				target="_blank"
				rel="noopener">rotation</a
			>
			or
			<a
				href="https://en.wikipedia.org/wiki/Deformation"
				class="text-blue-700 underline"
				target="_blank"
				rel="noopener">deformation</a
			> of the body.
		</p>
		<hr class="my-4 border-yellow-300" />
		<div class="flex flex-col items-center gap-6 md:flex-row md:justify-center">
			<img
				src="/wave.gif"
				alt="Wave Animation"
				class="max-w-lg rounded shadow"
				width="550"
				height="420"
			/>
		</div>
		<p class="mt-6 text-base text-gray-700">
			<a
				href="https://en.wikipedia.org/wiki/Hooke%27s_law"
				class="text-blue-700 underline"
				target="_blank"
				rel="noopener">Hooke's law</a
			>
			of
			<a
				href="https://en.wikipedia.org/wiki/Theory_of_elasticity"
				class="text-blue-700 underline"
				target="_blank"
				rel="noopener">elasticity</a
			>
			states that the extension of an elastic body (its distended length minus its relaxed length)
			is linearly proportional to its
			<a
				href="https://en.wikipedia.org/wiki/Tension_%28mechanics%29"
				class="text-blue-700 underline"
				target="_blank"
				rel="noopener">tension</a
			>, the
			<a
				href="https://en.wikipedia.org/wiki/Force"
				class="text-blue-700 underline"
				target="_blank"
				rel="noopener">force</a
			>
			used to stretch it. Similarly, the contraction (negative extension) is proportional to the
			<a
				href="https://en.wikipedia.org/wiki/Physical_compression"
				class="text-blue-700 underline"
				target="_blank"
				rel="noopener">compression</a
			> (negative tension).
		</p>
		<hr class="my-4 border-yellow-300" />
	</div>

	<!-- Modern Science Content -->
	<div class="prose prose-slate max-w-none">
		<p class="text-center font-semibold">Physics, Beer, and the Pursuit of Happiness</p>
		<p>
			Welcome to the IBC Science Corner! Here we explore the fun side of science, physics, and beer.
			Whether you're curious about the chemistry of brewing, the physics of foam, or just want to
			impress your friends with beer trivia, you're in the right place.
		</p>
		<h2>Fun Beer Science Facts</h2>
		<ul>
			<li>
				<strong>Why does beer foam?</strong> The bubbles in beer are carbon dioxide, released during
				fermentation. Pouring beer releases these bubbles, creating foam (head). The proteins and hops
				in beer help stabilize the foam.
			</li>
			<li>
				<strong>Why do bubbles rise?</strong> Bubbles are less dense than liquid, so they rise to the
				top. In some beers (like Guinness), nitrogen bubbles can appear to sink due to the glass shape
				and circulation currents.
			</li>
			<li>
				<strong>Why does beer taste better in a glass?</strong> Pouring beer into a glass releases aromas
				and lets you see the color and clarity, enhancing the experience.
			</li>
			<li>
				<strong>How cold should beer be?</strong> Most craft beers are best enjoyed between 45–55°F (7–13°C).
				Lighter beers can be colder, but too cold can mute flavors.
			</li>
			<li>
				<strong>What is IBU?</strong> International Bitterness Units (IBU) measure the bitterness of
				beer, mostly from hops. The higher the IBU, the more bitter the beer.
			</li>
		</ul>
		<h2>Physics of Life (and Beer)</h2>
		<ul>
			<li>
				<strong>Conservation of Beer:</strong> Beer cannot be created or destroyed, only transferred
				from one container to another (preferably your glass).
			</li>
			<li>
				<strong>Law of Gravity:</strong> What goes up must come down—especially true for beer foam and,
				occasionally, beer drinkers.
			</li>
			<li>
				<strong>Thermodynamics:</strong> Cold beer warms up, warm beer does not cool down (unless you
				have a fridge).
			</li>
		</ul>
		<p class="italic">Have a science question or fun fact? Let us know and we’ll add it here!</p>
	</div>
</section>
