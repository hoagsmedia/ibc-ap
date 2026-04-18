<script lang="ts">
	import { FlaskConical, Atom } from "@lucide/svelte/icons";
	import * as Card from "$lib/components/ui/card";
	import * as Alert from "$lib/components/ui/alert";
	import { Badge } from "$lib/components/ui/badge";
	import { Separator } from "$lib/components/ui/separator";

	const meta = {
		title: "IBC Science Corner | Island Beer Club",
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

<section class="w-full space-y-10 py-10 md:py-14">
	<header class="space-y-3 text-center">
		<div class="flex flex-wrap items-center justify-center gap-2">
			<Badge variant="secondary" class="gap-1">
				<FlaskConical class="size-3.5" aria-hidden="true" />
				Beer & physics
			</Badge>
			<Badge variant="outline" class="gap-1">
				<Atom class="size-3.5" aria-hidden="true" />
				Light & dark
			</Badge>
		</div>
		<h1 class="text-foreground text-3xl font-bold tracking-tight md:text-4xl">IBC Science Corner</h1>
		<p class="text-muted-foreground mx-auto max-w-2xl text-pretty text-sm md:text-base">
			Theory, everyday examples, and trivia—styled with shadcn-svelte so it reads clearly in both
			color modes.
		</p>
	</header>

	<!-- Legacy Science Primer -->
	<Card.Root class="shadow-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Island Beer Club Science Primer</Card.Title>
			<Card.Description>
				This is where we educate our readers with theory, along with everyday examples—stuff we can
				all relate to.
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-6">
			<div class="flex flex-col items-center gap-6 md:flex-row md:justify-center">
				<img
					src="/beer-smasher.gif"
					alt="Beer Smasher"
					class="bg-muted/30 max-w-xs rounded-lg border border-border shadow-sm"
					width="350"
					height="230"
				/>
			</div>
			<p class="text-card-foreground leading-relaxed">
				In <a
					href="https://en.wikipedia.org/wiki/Physics"
					class="text-primary underline underline-offset-4 hover:underline"
					target="_blank"
					rel="noopener">physics</a
				>, force is an
				<a
					href="https://en.wikipedia.org/wiki/Influence"
					class="text-primary underline underline-offset-4 hover:underline"
					target="_blank"
					rel="noopener">influence</a
				>
				that may cause a
				<a
					href="https://en.wikipedia.org/wiki/Physical_body"
					class="text-primary underline underline-offset-4 hover:underline"
					target="_blank"
					rel="noopener">body</a
				>
				to
				<a
					href="https://en.wikipedia.org/wiki/Acceleration"
					class="text-primary underline underline-offset-4 hover:underline"
					target="_blank"
					rel="noopener">accelerate</a
				>. It may be experienced as a lift, a push, or a pull. The actual acceleration of the body
				is determined by the vector sum of all forces acting on it (known as
				<a
					href="https://en.wikipedia.org/wiki/Net_force"
					class="text-primary underline underline-offset-4 hover:underline"
					target="_blank"
					rel="noopener">net force</a
				>
				or resultant force). In an extended body, force may also cause
				<a
					href="https://en.wikipedia.org/wiki/Rotate"
					class="text-primary underline underline-offset-4 hover:underline"
					target="_blank"
					rel="noopener">rotation</a
				>
				or
				<a
					href="https://en.wikipedia.org/wiki/Deformation"
					class="text-primary underline underline-offset-4 hover:underline"
					target="_blank"
					rel="noopener">deformation</a
				> of the body.
			</p>
			<div class="flex flex-col items-center md:flex-row md:justify-center">
				<img
					src="/wave.gif"
					alt="Wave Animation"
					class="bg-muted/30 max-w-lg rounded-lg border border-border shadow-sm"
					width="550"
					height="420"
				/>
			</div>
			<p class="text-card-foreground leading-relaxed">
				<a
					href="https://en.wikipedia.org/wiki/Hooke%27s_law"
					class="text-primary underline underline-offset-4 hover:underline"
					target="_blank"
					rel="noopener">Hooke's law</a
				>
				of
				<a
					href="https://en.wikipedia.org/wiki/Theory_of_elasticity"
					class="text-primary underline underline-offset-4 hover:underline"
					target="_blank"
					rel="noopener">elasticity</a
				>
				states that the extension of an elastic body (its distended length minus its relaxed length)
				is linearly proportional to its
				<a
					href="https://en.wikipedia.org/wiki/Tension_%28mechanics%29"
					class="text-primary underline underline-offset-4 hover:underline"
					target="_blank"
					rel="noopener">tension</a
				>, the
				<a
					href="https://en.wikipedia.org/wiki/Force"
					class="text-primary underline underline-offset-4 hover:underline"
					target="_blank"
					rel="noopener">force</a
				>
				used to stretch it. Similarly, the contraction (negative extension) is proportional to the
				<a
					href="https://en.wikipedia.org/wiki/Physical_compression"
					class="text-primary underline underline-offset-4 hover:underline"
					target="_blank"
					rel="noopener">compression</a
				> (negative tension).
			</p>
		</Card.Content>
	</Card.Root>

	<Separator class="bg-border" />

	<!-- Modern Science Content -->
	<Card.Root class="shadow-sm">
		<Card.Header class="text-center sm:text-left">
			<Card.Title class="text-xl">Physics, Beer, and the Pursuit of Happiness</Card.Title>
			<Card.Description>
				Welcome to the IBC Science Corner—chemistry of brewing, physics of foam, and trivia for
				your next pint.
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-8">
			<div class="space-y-4">
				<div class="flex flex-wrap items-center gap-2">
					<h2 class="text-foreground text-lg font-semibold">Fun Beer Science Facts</h2>
					<Badge variant="outline">Trivia</Badge>
				</div>
				<ul class="text-card-foreground space-y-4">
					<li class="border-border bg-muted/20 rounded-md border p-4">
						<strong class="text-foreground">Why does beer foam?</strong>
						The bubbles in beer are carbon dioxide, released during fermentation. Pouring beer releases
						these bubbles, creating foam (head). The proteins and hops in beer help stabilize the foam.
					</li>
					<li class="border-border bg-muted/20 rounded-md border p-4">
						<strong class="text-foreground">Why do bubbles rise?</strong>
						Bubbles are less dense than liquid, so they rise to the top. In some beers (like Guinness),
						nitrogen bubbles can appear to sink due to the glass shape and circulation currents.
					</li>
					<li class="border-border bg-muted/20 rounded-md border p-4">
						<strong class="text-foreground">Why does beer taste better in a glass?</strong>
						Pouring beer into a glass releases aromas and lets you see the color and clarity, enhancing
						the experience.
					</li>
					<li class="border-border bg-muted/20 rounded-md border p-4">
						<strong class="text-foreground">How cold should beer be?</strong>
						Most craft beers are best enjoyed between 45–55°F (7–13°C). Lighter beers can be colder, but
						too cold can mute flavors.
					</li>
					<li class="border-border bg-muted/20 rounded-md border p-4">
						<strong class="text-foreground">What is IBU?</strong>
						International Bitterness Units (IBU) measure the bitterness of beer, mostly from hops. The
						higher the IBU, the more bitter the beer.
					</li>
				</ul>
			</div>

			<Separator />

			<div class="space-y-4">
				<div class="flex flex-wrap items-center gap-2">
					<h2 class="text-foreground text-lg font-semibold">Physics of Life</h2>
					<Badge variant="secondary">— and Beer</Badge>
				</div>
				<ul class="text-card-foreground space-y-4">
					<li class="border-border bg-muted/20 rounded-md border p-4">
						<strong class="text-foreground">Conservation of Beer:</strong>
						Beer cannot be created or destroyed, only transferred from one container to another
						(preferably your glass).
					</li>
					<li class="border-border bg-muted/20 rounded-md border p-4">
						<strong class="text-foreground">Law of Gravity:</strong>
						What goes up must come down—especially true for beer foam and, occasionally, beer drinkers.
					</li>
					<li class="border-border bg-muted/20 rounded-md border p-4">
						<strong class="text-foreground">Thermodynamics:</strong>
						Cold beer warms up; warm beer does not cool down (unless you have a fridge).
					</li>
				</ul>
			</div>

			<Alert.Root>
				<FlaskConical class="size-4" aria-hidden="true" />
				<Alert.Title>Got a science question?</Alert.Title>
				<Alert.Description>
					Have a science question or fun fact? Let us know and we'll add it here!
				</Alert.Description>
			</Alert.Root>
		</Card.Content>
	</Card.Root>
</section>
