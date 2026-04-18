<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";

	const meta = {
		title: "Founders Day | Island Beer Club",
		description:
			"Celebrating the founding of Island Beer Club on March 22, 2004. Learn about our history and annual Founders Day traditions.",
		image: "/the-founders.png",
		url: "https://islandbeerclub.com/founders-day"
	};

	// Founders Day events data
	const foundersData = {
		foundingDate: "March 22, 2004",
		firstBeer: "Ballast Point Pale Ale",
		foundersEvents: [
			{
				year: 2013,
				date: "March 20, 2013",
				title: "Founders Day I",
				description:
					"The first Founders Day celebration where the IBC Lutetium and Ytterbium Clans banded together to host a solemnization and tribute in honor of the five Founders.",
				organizers: [
					"Tony Russell (Mbr 165)",
					"Rod Neilson (Mbr 169)",
					"John Parma (Mbr 176, not in attendance)",
					"Jon Sanchioli (Mbr 177)",
					"Tim Sexton (Mbr 174)",
					"John Sexton (Mbr 172)",
					"Jason Anderson (Mbr 166)"
				],
				poeticSupport: 'Jim "Poem Stranger" Knox (Mbr 141)',
				image: "/founders-day/founders-day-20MAR13.jpg"
			},
			{
				year: 2014,
				date: "March 19, 2014",
				title: "Founders Day II",
				description:
					"Organized by the Ytterbium, Zirconium and other clans to continue the tradition.",
				organizers: ["The Ytterbium Clan", "The Zirconium Clan", "Other participating clans"],
				image: "/founders-day/founders-day-12MAR14.jpg"
			}
		]
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

<div class="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
	<div class="mx-auto max-w-4xl px-4 py-12">
		<!-- Hero Section -->
		<div class="mb-12 text-center">
			<h1 class="text-foreground mb-4 text-4xl font-bold md:text-5xl">IBC Founders Day</h1>
			<p class="text-muted-foreground mx-auto max-w-2xl text-xl">
				Celebrating the founding of Island Beer Club and honoring our heritage since 2004
			</p>
		</div>

		<!-- Founding Information Card -->
		<div class="mb-8">
			<Card.Root>
				<Card.Content class="p-8">
					<div class="mb-8 text-center">
						<img
							src="/the-founders.png"
							alt="The Founders"
							class="mx-auto mb-6 w-full max-w-md rounded-lg shadow-sm"
						/>
					</div>

					<div class="grid gap-8 md:grid-cols-2">
						<div class="bg-primary/5 border-primary/20 rounded-lg border p-6 text-center">
							<h3 class="text-primary mb-2 text-2xl font-semibold">Founded</h3>
							<p class="text-card-foreground text-xl font-medium">{foundersData.foundingDate}</p>
						</div>
						<div class="bg-primary/5 border-primary/20 rounded-lg border p-6 text-center">
							<h3 class="text-primary mb-2 text-2xl font-semibold">First Beer</h3>
							<p class="text-card-foreground text-xl font-medium">{foundersData.firstBeer}</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Founders Day History -->
		<div class="mb-8">
			<Card.Root>
				<Card.Content class="p-8">
					<Card.Header class="px-0 pt-0">
						<Card.Title class="text-3xl font-bold">Founders Day History</Card.Title>
					</Card.Header>
					<div class="prose prose-lg dark:prose-invert max-w-none">
						<p class="text-card-foreground mb-6 leading-relaxed">
							IBC was founded on <strong class="text-primary">March 22, 2004</strong>. The first
							beer purchased was
							<strong class="text-primary">Ballast Point Pale Ale</strong>, marking the beginning of
							our journey into craft beer appreciation.
						</p>

						<h3 class="text-foreground mb-4 text-xl font-semibold">Founders Day Beginnings</h3>
						<p class="text-card-foreground leading-relaxed">
							On March 20, 2013, the IBC Lutetium and Ytterbium Clans banded together to host a
							solemnization and tribute in honor of the five Founders of our august creation. Thus
							started the tradition of Founders Day.
						</p>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Events Timeline -->
		<div class="space-y-6">
			<h2 class="text-foreground mb-6 text-3xl font-bold">Founders Day Celebrations</h2>

			{#each foundersData.foundersEvents as event, index (event.title + event.date)}
				<Card.Root>
					<!-- Event Header -->
					{#if event.image}
						<Card.Header class="relative -mt-6 p-0">
							<img
								src={event.image}
								alt="{event.title} celebration photo"
								class="h-64 w-full rounded-t-lg object-cover object-top md:h-80"
							/>
							<div class="absolute top-4 left-4">
								<div
									class="bg-primary/90 flex h-12 w-12 items-center justify-center rounded-full shadow-lg backdrop-blur-sm"
								>
									<span class="text-primary-foreground text-lg font-bold">{index + 1}</span>
								</div>
							</div>
						</Card.Header>
					{:else}
						<div class="p-8 pb-0">
							<div class="bg-primary mb-4 flex h-12 w-12 items-center justify-center rounded-full">
								<span class="text-primary-foreground text-lg font-bold">{index + 1}</span>
							</div>
						</div>
					{/if}
					<Card.Content class="p-0">
						<!-- Content Section -->
						<div class="p-8">
							<div class="mb-6">
								<div class="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
									<Card.Title class="text-2xl font-bold">{event.title}</Card.Title>
									<span class="text-primary text-lg font-semibold">{event.date}</span>
								</div>

								<Card.Description class="text-base leading-relaxed">
									{event.description}
								</Card.Description>
							</div>

							<div class="grid gap-6 md:grid-cols-2">
								<div>
									<h4 class="text-foreground mb-3 font-semibold">Organizers:</h4>
									<ul class="space-y-2">
										{#each event.organizers as organizer (organizer)}
											<li class="text-muted-foreground flex items-center gap-2 text-sm">
												<div class="bg-primary h-1.5 w-1.5 flex-shrink-0 rounded-full"></div>
												{organizer}
											</li>
										{/each}
									</ul>
								</div>

								{#if event.poeticSupport}
									<div>
										<h4 class="text-foreground mb-3 font-semibold">Poetic Support:</h4>
										<p class="text-muted-foreground text-sm leading-relaxed">
											{event.poeticSupport}
										</p>
									</div>
								{/if}
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}

			<!-- Historical Documents -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-3xl font-bold">Historical Documents</Card.Title>
					<Card.Description>
						Explore the original ceremony script and poetic tribute from the first Founders Day
						celebration in 2013.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="grid gap-6 md:grid-cols-2">
						<!-- Original Ceremony Script -->
						<Card.Root>
							<Card.Header>📜 Original Ceremony Script</Card.Header>
							<Card.Content class="space-y-4">
								<p>
									The complete ceremony script featuring setup instructions, historical readings,
									founder limericks, and the introduction of the Founder's Bell tradition.
								</p>
								<Button class="w-full">
									<a href="/founders-day/original-script"> Read Complete Script </a>
								</Button>
							</Card.Content>
						</Card.Root>

						<!-- Poetic Tribute -->
						<Card.Root>
							<Card.Header class="text-primary text-xl font-semibold"
								>🎭 "Ode to Our Founders"</Card.Header
							>
							<Card.Content class="space-y-4">
								<p>
									Jim Knox's poetic retelling of the IBC founding story, complete with humor,
									history, and the legendary journey from Coronado to Ballast Point.
								</p>
								<Button variant="outline" class="w-full">
									<a href="/founders-day/knox-poem"> Read the Poem </a>
								</Button>
							</Card.Content>
						</Card.Root>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Call to Action -->
			<Card.Root>
				<Card.Content class="p-8">
					<Card.Header class="px-0 pt-0 pb-6">
						<Card.Title class="text-2xl font-bold">Join the Tradition</Card.Title>
						<Card.Description class="mx-auto max-w-2xl">
							Founders Day continues to be celebrated annually, bringing together members from all
							clans to honor our heritage and celebrate the spirit of craft beer appreciation that
							defines the Island Beer Club.
						</Card.Description>
					</Card.Header>
					<div class="flex flex-col justify-center gap-4 sm:flex-row">
						<Button>
							<a href="/events">View Upcoming Events</a>
						</Button>
						<Button variant="outline">
							<a href="/history">Learn More About Our History</a>
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
