<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";

	const meta = {
		title: "Ode to Our Founders | Jim Knox | Island Beer Club",
		description:
			'The complete poem "Ode to Our Founders" by Jim "Poem Stranger" Knox, IBC Poet Laureate, from the first Founders Day celebration in 2013.',
		image: "/the-founders.png",
		url: "https://islandbeerclub.com/founders-day/knox-poem"
	};

	const poemData = {
		title: "Ode to Our Founders",
		event: "IBC Founder's Day",
		date: "20 March 2013",
		author: "Jim Knox, CHS '60, IBC Poet Laureate",
		aka: "The Poem Stranger"
	};

	const poemStanzas = [
		"Beer ye Beer ye, gather near to hear me. There's tales men and beer.\nFrom glen to glen there and back again, to our founders near and dear.",

		"Some time ago as legends grow, five warriors parched and dry,\nBemoaned the facts their urinary tracts could not a drop let fly.",

		"Their desert isle of one square mile, had not a trace of beer nor ale.\nWhat passed for swill from a radiator grill, would gag a humpback whale.",

		'Bones, it seems was a man of schemes. He posed a question vague.\nNone had thought of this novel plot. "Why don\'t we buy a keg?"',

		'"Let\'s leave this rock in quest of stock, where the beer is actually brewed."\nThe band of brothers left their mothers and agreed that Bones was shrewd.',

		"Every now and then, Bones led his men as they wandered too and fro.\nLike Moses smelling roses to many a brewery on skid row.",

		"At that fabled joint on Ballast Point, their senses were accosted,\nThey drank their fill of golden swill until their shoulders were exhausted.",

		'Morton was the first, to aptly quench his thirst and proclaim it fit for soul.\n"This brew is medicinal and chemically vicinal. We men have met our goal."',

		'Doc Morton dared as the conference aired as physician in attendance,\nHis speech impaired when he declared, "We\'ve found our independence."',

		'Then Muncy chimed as the alcohol climbed, "We need a kegerator."\nAnd he staked his claim on the path to fame and became the liberator.',

		'The last of the dregs from the first of kegs to be followed by so many,\nWas consumed in style by our friend erstwhile, Naval Commander "Crenny".',

		'"Big Oly" mused as he became confused, "It appears we are a Club.\nIf that\'s true we need to fund our brew to make it cheaper than a pub"',

		'"The problem lies, we must devise, since our funds are so austere,\nA novel way for others to pay and provide us with free beer."',

		"The men agreed to their noble creed and launched their Ponzi Scheme.\nAnd men like us jumped on the bus to continue with the dream.",

		"So hoist'em high and shout to the sky and give yourselves a cheer.\nLet's toast those five who did connive, a way for us to buy their beer."
	];
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

<div class="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
	<div class="mx-auto max-w-4xl px-4 py-12">
		<!-- Header -->
		<div class="mb-8 text-center">
			<a
				href="/founders-day"
				class="text-primary hover:text-primary/80 mb-4 inline-flex items-center gap-2 text-sm font-medium transition-colors"
			>
				← Back to Founders Day
			</a>
			<h1 class="text-foreground mb-2 text-4xl font-bold md:text-5xl">
				{poemData.title}
			</h1>
			<div class="text-muted-foreground space-y-1">
				<p class="text-lg">{poemData.event}</p>
				<p class="text-lg font-medium">{poemData.date}</p>
			</div>
		</div>

		<!-- Author Information -->
		<div class="mb-8">
			<Card.Root>
				<Card.Content class="p-8 text-center">
					<div class="mb-6">
						<div
							class="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
						>
							<svg
								class="text-primary h-8 w-8"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
								/>
							</svg>
						</div>
						<Card.Title class="mb-2 text-2xl font-bold">By {poemData.author}</Card.Title>
						<Badge variant="secondary" class="text-lg">AKA: {poemData.aka}</Badge>
					</div>

					<Card.Description class="text-base">
						Jim Knox provided the poetic support for the first Founders Day celebration, crafting
						this epic tale of our founders' quest for quality beer and the birth of the Island Beer
						Club.
					</Card.Description>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- The Poem -->
		<div class="mb-8">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-center text-3xl font-bold">The Complete Poem</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="space-y-6">
						{#each poemStanzas as stanza, index}
							<div class="bg-muted/30 border-primary rounded-lg border-l-4 p-6">
								<div
									class="text-card-foreground font-mono text-lg leading-relaxed whitespace-pre-line"
								>
									{stanza}
								</div>
							</div>
						{/each}
					</div>

					<!-- Signature -->
					<div class="mt-8 text-center">
						<Badge variant="outline" class="px-6 py-4 text-lg font-semibold">Poem Stranger</Badge>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Historical Context -->
		<div class="mb-8">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-2xl font-bold">Historical Context</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="prose prose-lg dark:prose-invert max-w-none">
						<p class="text-card-foreground mb-4 leading-relaxed">
							This poem was written specifically for the first Founders Day celebration on March 20,
							2013. Jim Knox, known as "The Poem Stranger," served as the IBC Poet Laureate and
							provided poetic support for the ceremony organized by the Lutetium and Ytterbium
							Clans.
						</p>

						<p class="text-card-foreground mb-4 leading-relaxed">
							The poem captures the legendary founding story of the Island Beer Club, weaving
							together the actual history with humor and poetic license. It chronicles the founders'
							journey from Coronado ("their desert isle of one square mile") to Ballast Point
							Brewing Company, where they discovered their first keg and established the traditions
							that continue today.
						</p>

						<div class="bg-primary/10 border-primary/20 mt-6 rounded-lg border p-6">
							<h3 class="text-primary mb-3 font-semibold">The Five Founders Referenced:</h3>
							<ul class="space-y-2">
								<li class="flex items-center gap-2">
									<Badge variant="outline" class="h-2 w-2 rounded-full p-0"></Badge>
									<span class="text-card-foreground"
										><strong>Bones</strong> - Jeff "Bones" Wilkens (Mbr #1)</span
									>
								</li>
								<li class="flex items-center gap-2">
									<Badge variant="outline" class="h-2 w-2 rounded-full p-0"></Badge>
									<span class="text-card-foreground"
										><strong>Morton/Doc</strong> - John "Old Doc" Morton (Mbr #2)</span
									>
								</li>
								<li class="flex items-center gap-2">
									<Badge variant="outline" class="h-2 w-2 rounded-full p-0"></Badge>
									<span class="text-card-foreground"
										><strong>Muncy</strong> - John "Cruncher" Muncy (Mbr #3)</span
									>
								</li>
								<li class="flex items-center gap-2">
									<Badge variant="outline" class="h-2 w-2 rounded-full p-0"></Badge>
									<span class="text-card-foreground"
										><strong>Big Oly</strong> - Wayne "Big Oly" Oldendorph (Mbr #4)</span
									>
								</li>
								<li class="flex items-center gap-2">
									<Badge variant="outline" class="h-2 w-2 rounded-full p-0"></Badge>
									<span class="text-card-foreground"
										><strong>Crenny</strong> - Rob "Crenny" Crenshaw (Mbr #5)</span
									>
								</li>
							</ul>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Back Navigation -->
		<div class="text-center">
			<Button variant="outline">
				<a href="/founders-day">← Back to Founders Day</a>
			</Button>
		</div>
	</div>
</div>
