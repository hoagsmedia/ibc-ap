<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import { Beer, Building2, ExternalLink, Link2, Sparkles } from "@lucide/svelte/icons";

	const meta = {
		title: "Beer Links & Resources | Island Beer Club",
		description:
			"A curated list of beer resources, breweries, and fun links for Island Beer Club members and visitors.",
		image: "/logo-ibc.webp",
		url: "https://islandbeerclub.com/links"
	};

	const sections = [
		{
			category: "Beer resources",
			description: "Reference sites, homebrewing, and beer nerdery from around the web.",
			icon: Beer,
			items: [
				{ name: "Beer Advocate", url: "https://www.beeradvocate.com/" },
				{ name: "RateBeer", url: "https://www.ratebeer.com/" },
				{ name: "Brewers Association", url: "https://www.brewersassociation.org/" },
				{ name: "Homebrew Talk", url: "https://www.homebrewtalk.com/" },
				{ name: "Pint Price (World Beer Prices)", url: "http://www.pintprice.com/" },
				{
					name: "KegWorks Keg Sizes",
					url: "https://www.kegworks.com/blog/guide-to-beer-keg-sizes/"
				},
				{
					name: "Beer Flowchart",
					url: "http://www.keithandthegirl.com/forums/f6/beer-flowchart-14399/"
				}
			]
		},
		{
			category: "Breweries",
			description: "Local favorites and legendary San Diego–area craft brands.",
			icon: Building2,
			items: [
				{ name: "Stone Brewing", url: "https://www.stonebrewing.com/" },
				{ name: "Coronado Brewing", url: "https://coronadobrewing.com/" },
				{ name: "Ballast Point", url: "https://www.ballastpoint.com/" },
				{ name: "Karl Strauss", url: "https://www.karlstrauss.com/" }
			]
		},
		{
			category: "Fun & miscellaneous",
			description: "Club pages, games, and rabbit holes worth bookmarking.",
			icon: Sparkles,
			items: [
				{ name: "Biorhythm Calculator", url: "https://www.biorhythm-calculator.net/" },
				{ name: "Born Again American", url: "http://www.bornagainamerican.org" },
				{ name: "Hangman Game", url: "/fun" },
				{ name: "Foo Dogs", url: "/foodog" },
				{ name: "IBC Science Corner", url: "/science" },
				{ name: "Beer Styles", url: "/styles" },
				{ name: "IBC Stats", url: "/stats" }
			]
		}
	] as const;

	function isExternal(url: string): boolean {
		return url.startsWith("http://") || url.startsWith("https://");
	}
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

<div class="from-muted/40 bg-gradient-to-b via-background to-background">
	<div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
		<header class="mb-12 text-center sm:mb-14">
			<p
				class="text-primary mb-3 text-xs font-semibold tracking-[0.2em] uppercase"
			>
				Island Beer Club
			</p>
			<h1 class="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
				Beer links &amp; resources
			</h1>
			<p class="text-muted-foreground mx-auto max-w-xl text-pretty text-base leading-relaxed sm:text-lg">
				A living list of bookmarks for tastings, travel, and late-night rabbit holes — plus a few IBC
				pages we keep coming back to.
			</p>
		</header>

		<div class="flex flex-col gap-8">
			{#each sections as section (section.category)}
				{@const Icon = section.icon}
				<Card.Root class="border-border/60 shadow-sm transition-shadow hover:shadow-md">
					<Card.Header class="pb-4">
						<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
							<div
								class="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-xl"
							>
								<Icon class="size-6" />
							</div>
							<div class="min-w-0 space-y-1.5 text-left">
								<Card.Title class="text-xl font-semibold tracking-tight">{section.category}</Card.Title>
								<Card.Description class="text-base leading-relaxed">
									{section.description}
								</Card.Description>
							</div>
						</div>
					</Card.Header>
					<Card.Content class="pt-0">
						<ul class="divide-border/60 divide-y rounded-xl border">
							{#each section.items as item (item.url + item.name)}
								<li>
									<a
										href={item.url}
										target={isExternal(item.url) ? "_blank" : undefined}
										rel={isExternal(item.url) ? "noopener noreferrer" : undefined}
										class="text-foreground hover:bg-muted/50 group flex items-center justify-between gap-3 px-4 py-3.5 text-sm font-medium transition-colors sm:px-5 sm:text-[0.9375rem]"
									>
										<span class="min-w-0 flex-1 leading-snug">{item.name}</span>
										<span
											class="text-muted-foreground group-hover:text-primary shrink-0 transition-colors"
										>
											{#if isExternal(item.url)}
												<ExternalLink class="size-4" aria-hidden="true" />
												<span class="sr-only">Opens in a new tab</span>
											{:else}
												<Link2 class="size-4" aria-hidden="true" />
												<span class="sr-only">On this site</span>
											{/if}
										</span>
									</a>
								</li>
							{/each}
						</ul>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		<p class="text-muted-foreground mt-12 text-center text-sm leading-relaxed">
			Found a broken link?
			<a href="/contact" class="text-primary font-medium underline-offset-4 hover:underline">
				Let us know
			</a>
			— we’ll fix it when we’re back from the bar.
		</p>
	</div>
</div>
