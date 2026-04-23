<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Separator } from "$lib/components/ui/separator";
	import { ExternalLink, FileText, ScrollText, Video } from "@lucide/svelte/icons";

	const meta = {
		title: "Founders Day | Island Beer Club",
		description:
			"IBC Founders Day — honoring our March 22, 2004 founding, the 2013 and 2014 celebrations, videos, poems, and traditions.",
		image: "/the-founders.png",
		url: "https://islandbeerclub.com/founders-day"
	};

	const linkBtn =
		"inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground";

	const founding = {
		date: "March 22, 2004",
		firstBeer: "Ballast Point Pale Ale",
	};

	const traditionDecree = {
		title: "How Founders Day is observed",
		body: [
			"By decree, as witnessed by all in attendance at the first celebration, Founder's Day is to be celebrated on the Wednesday closest to the date of our founding — 22 March.",
			"Since St. Patrick's Day is nearby, the club celebrates that as well."
		]
	};

	const foundersDay2013 = {
		title: "Founders Day I",
		subtitle: "First ever — Wednesday, 20 March 2013",
		intro:
			"On Wednesday, 20 March 2013, the first Founders Day was cleverly contrived, precisely planned, and exceptionally executed by our most junior members.",
		organizingClans:
			"The IBC Lutetium and Ytterbium Clans banded together to host a solemnization and tribute in honor of the five Founders — thus starting the tradition of Founders Day.",
		organizers: [
			"Tony Russell — Mbr 165",
			"Rod Neilson — Mbr 169",
			"John Parma — Mbr 176 (not in attendance)",
			"Jon Sanchioli — Mbr 177",
			"Tim Sexton — Mbr 174",
			"John Sexton — Mbr 172",
			"Jason Anderson — Mbr 166"
		],
		poeticSupport: 'Poetically supported by Jim “Poem Stranger” Knox — Mbr 141 (IBC Poet Laureate).',
		image: "/founders-day/founders-day-20MAR13.jpg",
		videos: [
			{ label: "Filmed by Ed Weisbrod", href: "https://youtu.be/e3RnAUvCS2Q" },
			{ label: "Filmed by Scott Kaye", href: "https://www.youtube.com/watch?v=LJyrCm8Vq2w" },
			{ label: "Filmed by Wayne Strickland", href: "https://www.youtube.com/watch?v=4VGagVrj3nc" }
		],
		chimeNote:
			"20 March 2013 — first ever Beer Fairy Chime (see ceremony script and poems below)."
	};

	const foundersDay2014 = {
		title: "Founders Day II",
		subtitle: "Tenth anniversary — Wednesday, 19 March 2014",
		intro:
			"Organized by the Ytterbium, Zirconium, and Double Centurion Clans (ceremony described as Zirconium Exquisite and Double Centurion).",
		emcee: "Alisa Kerr — Mbr 193 (emcee).",
		participants: [
			"Kippy — #12 (food and band)",
			"Fargy — #47 (absolution keg)",
			"Noah — #195",
			"Lordy — #190",
			"Sandke — #182",
			"JJ — #205 (beer runs for founders)",
			"Lorentzen — #199",
			"Rod — #169 (video)",
			"Roger — #171 (tiles)",
			"Bear — #179",
			"Canty — #186",
			"Plunkett — #184",
			"Delo — #202",
			'Jim — #141 (IBC poet laureate)'
		],
		notPresent: [
			"Doc Seibert — #196",
			"Josh Flage — #198",
			"Jason Anderson — #166",
			"Paul Bandini — #204"
		],
		notPresentNote: "Helped with planning but were not able to attend the event.",
		image: "/founders-day/founders-day-12MAR14.jpg",
		video: {
			label: "Founders Day II video (Rod Neilson — Mbr 169)",
			href: "https://www.youtube.com/watch?v=nPCawAq0P6M"
		},
		pdfPoem: {
			label: "Founders Tribute Poem (2014) — PDF",
			href: "https://islandbeerclub.com/PDFs/FoundersTributePoem2014.pdf"
		},
		quote: "With Mariachis, tacos, beer, ladies and cake; life doesn't get much better."
	};

	const triviaQuestions = [
		"What gift did Loie get?",
		"Which Founder was missing?",
		"Why was Jon Sanchioli chosen as emcee?",
		"Who is the official IBC Poet Laureate?",
		"What's the purpose of the Beer Fairy Chimes?",
		"Why were the Founders wearing green hats?",
		"How many official IBC members were there on Founders Day?",
		"Where does IBC keep a tally of beer consumed?"
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

<div class="border-border/40 from-muted/20 to-background border-b bg-gradient-to-b">
	<div class="mx-auto max-w-3xl px-4 py-10 md:py-14">
		<p class="text-muted-foreground mb-2 text-center text-xs font-medium tracking-wide uppercase">
			Tradition since 2013
		</p>
		<h1 class="text-foreground text-center text-3xl font-semibold tracking-tight md:text-4xl">
			IBC Founders Day
		</h1>
		<p class="text-muted-foreground mx-auto mt-3 max-w-xl text-center text-pretty md:text-lg">
			Honoring the five founders and the annual celebration on the Wednesday nearest 22 March — preserved
			from the original club site and member archives.
		</p>
	</div>
</div>

<div class="mx-auto max-w-3xl px-4 py-10 md:py-12">
	<!-- Founding -->
	<section class="mb-12">
		<Card.Root class="overflow-hidden border-border/70 p-0 shadow-sm gap-0">
			<img
				src="/the-founders.png"
				alt="The five founders of Island Beer Club"
				class="aspect-[21/9] w-full rounded-t-xl object-cover object-top md:aspect-[2.4/1]"
			/>
			<Card.Content class="space-y-0 p-0 px-0">
				<div class="grid gap-4 border-b border-border/50 p-6 sm:grid-cols-2 sm:p-8">
					<div class="rounded-xl border border-border/60 bg-card/80 p-5 text-center">
						<p class="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Founded</p>
						<p class="text-foreground mt-1 text-xl font-semibold tabular-nums">{founding.date}</p>
					</div>
					<div class="rounded-xl border border-border/60 bg-card/80 p-5 text-center">
						<p class="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
							First keg
						</p>
						<p class="text-foreground mt-1 text-lg font-semibold leading-snug">{founding.firstBeer}</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	<!-- Decree -->
	<section class="mb-12">
		<h2 class="text-foreground mb-4 text-xl font-semibold">{traditionDecree.title}</h2>
		<Card.Root class="border-border/70">
			<Card.Content class="space-y-4 p-6 text-muted-foreground leading-relaxed">
				{#each traditionDecree.body as para (para)}
					<p>{para}</p>
				{/each}
			</Card.Content>
		</Card.Root>
	</section>

	<!-- 2013 -->
	<section class="mb-12">
		<div class="mb-6 flex flex-col gap-1">
			<h2 class="text-foreground text-xl font-semibold">{foundersDay2013.title}</h2>
			<p class="text-primary text-sm font-medium">{foundersDay2013.subtitle}</p>
		</div>

		<Card.Root class="overflow-hidden border-border/70 p-0 shadow-sm gap-0">
			<img
				src={foundersDay2013.image}
				alt="Founders Day I gathering"
				class="aspect-[21/9] w-full rounded-t-xl object-cover object-top md:aspect-[2.4/1]"
			/>
			<Card.Content class="space-y-6 p-6 md:p-8">
				<p class="text-muted-foreground leading-relaxed">{foundersDay2013.intro}</p>
				<p class="text-muted-foreground leading-relaxed">{foundersDay2013.organizingClans}</p>

				<div class="grid gap-8 md:grid-cols-2">
					<div>
						<h3 class="text-foreground mb-3 text-sm font-semibold">Organizers &amp; crew</h3>
						<ul class="text-muted-foreground space-y-2 text-sm">
							{#each foundersDay2013.organizers as line (line)}
								<li class="flex gap-2">
									<span class="bg-primary/70 mt-2 h-1 w-1 shrink-0 rounded-full"></span>
									{line}
								</li>
							{/each}
						</ul>
					</div>
					<div>
						<h3 class="text-foreground mb-3 text-sm font-semibold">Poetry</h3>
						<p class="text-muted-foreground text-sm leading-relaxed">
							{foundersDay2013.poeticSupport}
						</p>
						<p class="text-muted-foreground mt-4 text-sm italic">{foundersDay2013.chimeNote}</p>
					</div>
				</div>

				<Separator />

				<div>
					<h3 class="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
						<Video class="size-4 opacity-80" aria-hidden="true" />
						Videos — Founders Day I
					</h3>
					<ul class="flex flex-col gap-2">
						{#each foundersDay2013.videos as v (v.href)}
							<li>
								<a
									href={v.href}
									target="_blank"
									rel="noopener noreferrer"
									class="text-primary inline-flex items-center gap-2 text-sm font-medium underline decoration-primary/35 underline-offset-4 hover:decoration-primary"
								>
									{v.label}
									<ExternalLink class="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	<!-- 2014 -->
	<section class="mb-12">
		<div class="mb-6 flex flex-col gap-1">
			<h2 class="text-foreground text-xl font-semibold">{foundersDay2014.title}</h2>
			<p class="text-primary text-sm font-medium">{foundersDay2014.subtitle}</p>
		</div>

		<Card.Root class="overflow-hidden border-border/70 p-0 shadow-sm gap-0">
			<img
				src={foundersDay2014.image}
				alt="Founders Day II gathering"
				class="aspect-[21/9] w-full rounded-t-xl object-cover object-top md:aspect-[2.4/1]"
			/>
			<Card.Content class="space-y-6 p-6 md:p-8">
				<p class="text-muted-foreground leading-relaxed">{foundersDay2014.intro}</p>
				<p class="text-foreground text-sm font-medium">{foundersDay2014.emcee}</p>

				<blockquote
					class="border-primary/30 text-foreground/90 border-l-4 py-1 pl-4 text-lg font-medium italic md:text-xl"
				>
					{foundersDay2014.quote}
				</blockquote>

				<div>
					<h3 class="text-foreground mb-3 text-sm font-semibold">Participants</h3>
					<ul class="text-muted-foreground grid gap-2 text-sm sm:grid-cols-2">
						{#each foundersDay2014.participants as line (line)}
							<li class="flex gap-2">
								<span class="bg-primary/70 mt-2 h-1 w-1 shrink-0 rounded-full"></span>
								{line}
							</li>
						{/each}
					</ul>
				</div>

				<div class="bg-muted/40 rounded-lg border border-border/50 p-4">
					<h3 class="text-foreground mb-2 text-sm font-semibold">Planning, not present</h3>
					<p class="text-muted-foreground mb-3 text-xs">{foundersDay2014.notPresentNote}</p>
					<ul class="text-muted-foreground space-y-1 text-sm">
						{#each foundersDay2014.notPresent as line (line)}
							<li class="flex gap-2">
								<span class="bg-muted-foreground/50 mt-2 h-1 w-1 shrink-0 rounded-full"></span>
								{line}
							</li>
						{/each}
					</ul>
				</div>

				<div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
					<Button
						variant="default"
						class="gap-2"
						href={foundersDay2014.video.href}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Video class="size-4" aria-hidden="true" />
						{foundersDay2014.video.label}
					</Button>
					<Button
						variant="outline"
						class="gap-2"
						href={foundersDay2014.pdfPoem.href}
						target="_blank"
						rel="noopener noreferrer"
					>
						<FileText class="size-4" aria-hidden="true" />
						{foundersDay2014.pdfPoem.label}
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	<!-- Trivia -->
	<section class="mb-12">
		<h2 class="text-foreground mb-4 text-xl font-semibold">From the first celebration</h2>
		<p class="text-muted-foreground mb-4 text-sm leading-relaxed">
			The original site invited guests to puzzle over these moments from Founders Day I — answers live in
			the stories, script, and club lore.
		</p>
		<Card.Root class="border-dashed border-border/80 bg-muted/20">
			<Card.Content class="p-6">
				<ol class="text-muted-foreground list-decimal space-y-3 pl-5 text-sm leading-relaxed">
					{#each triviaQuestions as q, i (i)}
						<li>{q}</li>
					{/each}
				</ol>
				<p class="text-muted-foreground mt-6 text-sm">
					<strong class="text-foreground font-medium">Beer tally:</strong>
					Today we publish club stats on
					<a
						href="/stats"
						class="text-primary font-medium underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
						>/stats</a
					>
					(legacy link pointed to stats.htm).
				</p>
			</Card.Content>
		</Card.Root>
	</section>

	<!-- Documents -->
	<section class="mb-12">
		<h2 class="text-foreground mb-4 text-xl font-semibold">Ceremony &amp; poems</h2>
		<p class="text-muted-foreground mb-6 text-sm leading-relaxed">
			Original script (operations-order style, timing, limericks, Beer Fairy Chime) and Knox’s
			<em>Ode to Our Founders</em> — hosted on this site.
		</p>
		<div class="grid gap-4 md:grid-cols-2">
			<Card.Root class="border-border/70">
				<Card.Header class="pb-2">
					<Card.Title class="flex items-center gap-2 text-lg">
						<ScrollText class="text-primary size-5" aria-hidden="true" />
						Original ceremony script
					</Card.Title>
					<Card.Description>
						OPORD-style run of show: timing, readings, founder limericks, traditions.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<a href="/founders-day/original-script" class={linkBtn}> Read full script </a>
				</Card.Content>
			</Card.Root>
			<Card.Root class="border-border/70">
				<Card.Header class="pb-2">
					<Card.Title class="flex items-center gap-2 text-lg">
						<ScrollText class="text-primary size-5" aria-hidden="true" />
						<em>Ode to Our Founders</em>
					</Card.Title>
					<Card.Description> Jim Knox — IBC Poet Laureate, Mbr 141. </Card.Description>
				</Card.Header>
				<Card.Content>
					<Button variant="outline" class="w-full" href="/founders-day/knox-poem">Read the poem</Button>
				</Card.Content>
			</Card.Root>
		</div>
	</section>

	<!-- CTA -->
	<section>
		<Card.Root class="border-primary/25 bg-primary/5">
			<Card.Content class="p-6 md:p-8">
				<h2 class="text-foreground text-lg font-semibold">Carry on the tradition</h2>
				<p class="text-muted-foreground mt-2 max-w-prose text-sm leading-relaxed">
					Founders Day continues each March around the founding anniversary. Check club events and
					history for the latest gatherings.
				</p>
				<div class="mt-6 flex flex-wrap gap-3">
					<Button href="/events">Upcoming events</Button>
					<Button variant="outline" href="/history">Club history</Button>
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	<p class="text-muted-foreground mt-10 text-center text-xs">
		Content consolidated from the legacy IBC Founders Day page (last archived update August 2014).
	</p>
</div>
