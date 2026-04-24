<script lang="ts">
	import { ExternalLink } from "@lucide/svelte/icons";
	import { Badge } from "$lib/components/ui/badge";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Separator } from "$lib/components/ui/separator";

	type BeerStyle = {
		title: string;
		description: string;
		body: string;
		family: string;
		abv: string;
		note: string;
		headerClass: string;
		badgeClass: string;
		noteClass: string;
	};

	const beerStyles: BeerStyle[] = [
		{
			title: "What's an Ale?",
			description: "Top-fermenting yeast, fruity and aromatic.",
			body: "This category of beer uses yeast that ferments at the top of the vessel, typically at higher temperatures (60°-75°F), resulting in a quicker fermentation and estery, fruity aromas.",
			family: "Ale",
			abv: "Core style",
			note: "Bright fermentation character",
			headerClass: "from-amber-700 via-orange-600 to-yellow-500",
			badgeClass: "bg-white/16 text-white border-white/20",
			noteClass: "text-orange-700 dark:text-orange-300"
		},
		{
			title: "What's a Lager?",
			description: "Bottom-fermenting yeast, clean and crisp.",
			body: "Lagers are brewed with yeast that works slowly at cool temperatures (~34°F) and are stored to mature. They have a soft, clean taste and are generally more refreshing and less diverse than ales.",
			family: "Lager",
			abv: "Core style",
			note: "Cold-conditioned and smooth",
			headerClass: "from-yellow-300 via-amber-200 to-sky-200",
			badgeClass: "bg-white/70 text-slate-800 border-white/70",
			noteClass: "text-sky-700 dark:text-sky-300"
		},
		{
			title: "Barley Wine",
			description: "Strong ale, 8–12% ABV.",
			body: "Very strong, rich, and malty. Sipped and savored.",
			family: "Ale",
			abv: "8–12% ABV",
			note: "Rich and contemplative",
			headerClass: "from-amber-900 via-red-900 to-orange-800",
			badgeClass: "bg-white/14 text-white border-white/20",
			noteClass: "text-amber-700 dark:text-amber-300"
		},
		{
			title: "Bitter",
			description: "British-style, hoppy ale.",
			body: "High hop content, causing bitterness. Classic UK pub style.",
			family: "Ale",
			abv: "Session to medium",
			note: "Pub-friendly snap",
			headerClass: "from-amber-700 via-lime-700 to-emerald-700",
			badgeClass: "bg-white/14 text-white border-white/20",
			noteClass: "text-lime-700 dark:text-lime-300"
		},
		{
			title: "Bock / Doppelbock",
			description: "Strong, dark German lagers.",
			body: "Bock is strong and dark; Doppelbock is an extra-strong version.",
			family: "Lager",
			abv: "Strong",
			note: "Deep malt warmth",
			headerClass: "from-red-950 via-amber-900 to-stone-700",
			badgeClass: "bg-white/14 text-white border-white/20",
			noteClass: "text-red-700 dark:text-red-300"
		},
		{
			title: "Brown Ale",
			description: "Mild, brown UK beer.",
			body: "Gentle, malty, and easy-drinking. Associated with the UK.",
			family: "Ale",
			abv: "Easy-drinking",
			note: "Nutty and cozy",
			headerClass: "from-stone-700 via-amber-800 to-orange-950",
			badgeClass: "bg-white/14 text-white border-white/20",
			noteClass: "text-amber-800 dark:text-amber-200"
		},
		{
			title: "Czech Pilsner",
			description: "Light, hoppy, and floral.",
			body: "Bohemian style, spicy bitterness, and floral Saaz hops.",
			family: "Lager",
			abv: "Classic continental",
			note: "Floral and spicy",
			headerClass: "from-yellow-300 via-lime-300 to-emerald-300",
			badgeClass: "bg-white/70 text-emerald-950 border-white/70",
			noteClass: "text-emerald-700 dark:text-emerald-300"
		},
		{
			title: "Dortmunder / Export Lager",
			description: "Pale golden, dry, and biscuity.",
			body: "Classic German lager, firm mouthfeel, dry finish, aromatic.",
			family: "Lager",
			abv: "Balanced export",
			note: "Dry with a grainy snap",
			headerClass: "from-yellow-200 via-amber-200 to-orange-300",
			badgeClass: "bg-white/70 text-stone-800 border-white/70",
			noteClass: "text-amber-700 dark:text-amber-300"
		},
		{
			title: "Imperial Stout",
			description: "Very strong, dark stout.",
			body: "Originally brewed for export to Russia. 7–10% ABV, rich and intense.",
			family: "Stout",
			abv: "7–10% ABV",
			note: "Dense and decadent",
			headerClass: "from-zinc-950 via-stone-900 to-amber-800",
			badgeClass: "bg-white/12 text-white border-white/20",
			noteClass: "text-stone-700 dark:text-stone-300"
		},
		{
			title: "India Pale Ale (IPA)",
			description: "Strong, hoppy, historic export ale.",
			body: "Originated in the UK for export to India. Strong, bitter, and aromatic.",
			family: "Ale",
			abv: "Hop-forward",
			note: "Aromatic bitterness",
			headerClass: "from-orange-500 via-amber-500 to-lime-500",
			badgeClass: "bg-white/16 text-white border-white/20",
			noteClass: "text-lime-700 dark:text-lime-300"
		},
		{
			title: "Marzenbier",
			description: "Medium-strong, malty lager.",
			body: "Associated with Oktoberfest and the fall. Malty and smooth.",
			family: "Lager",
			abv: "Festbier cousin",
			note: "Toasty autumn malt",
			headerClass: "from-orange-700 via-amber-700 to-yellow-600",
			badgeClass: "bg-white/14 text-white border-white/20",
			noteClass: "text-orange-700 dark:text-orange-300"
		},
		{
			title: "Pale Ale",
			description: "Fruity, milder IPA.",
			body: "Milder and fruitier than IPA, with a balanced hop profile.",
			family: "Ale",
			abv: "Balanced hop bill",
			note: "Classic everyday hop balance",
			headerClass: "from-amber-400 via-orange-400 to-rose-400",
			badgeClass: "bg-white/20 text-white border-white/20",
			noteClass: "text-rose-700 dark:text-rose-300"
		},
		{
			title: "Pilsner",
			description: "Clear, carbonated, hoppy lager.",
			body: "The most imitated beer style in the world. Crisp and refreshing.",
			family: "Lager",
			abv: "World classic",
			note: "Clear and crisp",
			headerClass: "from-yellow-200 via-yellow-300 to-cyan-200",
			badgeClass: "bg-white/70 text-cyan-950 border-white/70",
			noteClass: "text-cyan-700 dark:text-cyan-300"
		},
		{
			title: "Porter",
			description: "Very dark, bitter English ale.",
			body: "First brewed in 1730. Robust, roasty, and full-bodied.",
			family: "Ale",
			abv: "Roasty",
			note: "Chocolate and toast",
			headerClass: "from-stone-950 via-neutral-900 to-amber-950",
			badgeClass: "bg-white/12 text-white border-white/20",
			noteClass: "text-stone-700 dark:text-stone-300"
		},
		{
			title: "Scottish Ale",
			description: "Sweeter, less hoppy pale ale.",
			body: "Darker malt, stronger, and less hoppy than English pale ales.",
			family: "Ale",
			abv: "Malt-leaning",
			note: "Caramel-forward comfort",
			headerClass: "from-red-800 via-orange-800 to-amber-700",
			badgeClass: "bg-white/14 text-white border-white/20",
			noteClass: "text-red-700 dark:text-red-300"
		},
		{
			title: "Stout",
			description: "Very dark, heavy, and sweet.",
			body: "See Oatmeal, Imperial, Dry, Sweet, and Milk for substyles. Rich and bold.",
			family: "Stout",
			abv: "Dark beer family",
			note: "Bold roast and body",
			headerClass: "from-black via-zinc-900 to-stone-800",
			badgeClass: "bg-white/12 text-white border-white/20",
			noteClass: "text-zinc-700 dark:text-zinc-300"
		},
		{
			title: "Trappist Ale",
			description: "Strong, fruity Belgian ales.",
			body: "Made by Trappist monks, bottled with active yeast. Complex and unique.",
			family: "Belgian ale",
			abv: "Monastic tradition",
			note: "Layered yeast character",
			headerClass: "from-yellow-500 via-orange-500 to-violet-600",
			badgeClass: "bg-white/16 text-white border-white/20",
			noteClass: "text-violet-700 dark:text-violet-300"
		},
		{
			title: "Wheat Beer (Weisse)",
			description: "Cloudy, refreshing, clove-like bouquet.",
			body: "20–60% wheat, often garnished with lemon. Light and lively.",
			family: "Wheat beer",
			abv: "Soft and lively",
			note: "Cloudy citrus lift",
			headerClass: "from-yellow-100 via-amber-200 to-slate-200",
			badgeClass: "bg-white/75 text-slate-800 border-white/75",
			noteClass: "text-amber-700 dark:text-amber-300"
		}
	];
</script>

<svelte:head>
	<title>IBC Beer Styles | Island Beer Club</title>
	<meta
		name="description"
		content="Explore the beer styles enjoyed by the Island Beer Club. From classic lagers to bold stouts, see what our members love!"
	/>
	<meta property="og:title" content="IBC Beer Styles | Island Beer Club" />
	<meta
		property="og:description"
		content="Explore the beer styles enjoyed by the Island Beer Club. From classic lagers to bold stouts, see what our members love!"
	/>
</svelte:head>

<section class="w-full py-10 md:py-14">
	<header class="space-y-4 text-center">
		<p class="text-muted-foreground font-medium tracking-[0.22em] uppercase">Style guide</p>
		<h1 class="text-foreground text-4xl font-bold tracking-tight md:text-5xl">
			Brewing Process and Beer Styles
		</h1>
		<p class="text-muted-foreground mx-auto max-w-2xl text-pretty text-sm leading-relaxed md:text-base">
			A quick tour through the beer families and classics that shape what ends up in the glass.
			Each card gives the short version first, then the flavor identity that makes the style worth
			remembering.
		</p>
		<Separator class="bg-border/80 mx-auto max-w-[5rem]" />
	</header>

	<div class="mt-10 grid gap-6 lg:grid-cols-12 lg:items-start">
		<div class="grid gap-6 sm:grid-cols-2 lg:col-span-7">
			<Card.Root class="border-border/60 bg-card/70 rounded-2xl py-5 shadow-sm">
				<Card.Header class="space-y-3">
					<div class="flex items-center justify-between gap-3">
						<Badge variant="outline">Brewing process</Badge>
						<ExternalLink class="text-muted-foreground size-4" aria-hidden="true" />
					</div>
					<Card.Title class="text-2xl">Start with the how</Card.Title>
					<Card.Description class="text-sm leading-relaxed">
						Learn from the experts with an illustrated brewing walkthrough.
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4 pt-0">
					<p class="text-muted-foreground leading-relaxed">
						From grain and mash to yeast and conditioning, this is the easiest way to connect process
						with flavor.
					</p>
					<a
						href="https://science.howstuffworks.com/innovation/edible-innovations/beer.htm"
						class="text-primary inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
						target="_blank"
						rel="noopener"
					>
						Visit How Stuff Works
						<ExternalLink class="size-4" aria-hidden="true" />
					</a>
				</Card.Content>
			</Card.Root>

			<Card.Root class="border-border/60 bg-card/70 rounded-2xl py-5 shadow-sm">
				<Card.Header class="space-y-3">
					<div class="flex items-center justify-between gap-3">
						<Badge variant="secondary">{beerStyles.length} styles</Badge>
						<ExternalLink class="text-muted-foreground size-4" aria-hidden="true" />
					</div>
					<Card.Title class="text-2xl">Keep exploring</Card.Title>
					<Card.Description class="text-sm leading-relaxed">
						Use this page for the highlights, then go deeper into the wider beer world.
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4 pt-0">
					<p class="text-muted-foreground leading-relaxed">
						For a broader overview and more extensive list, Beer Advocate remains a solid rabbit hole.
					</p>
					<a
						href="https://www.beeradvocate.com/beer/styles/"
						class="text-primary inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
						target="_blank"
						rel="noopener"
					>
						Browse Beer Advocate
						<ExternalLink class="size-4" aria-hidden="true" />
					</a>
				</Card.Content>
			</Card.Root>
		</div>

		<Card.Root class="border-border/60 bg-card/45 lg:col-span-5 overflow-hidden rounded-2xl py-0 shadow-sm">
			<div class="p-5 pb-0">
				<p class="text-muted-foreground text-xs font-medium tracking-[0.16em] uppercase">
					Process visuals
				</p>
				<h2 class="text-foreground mt-1 text-lg font-semibold">Brew house to hop character</h2>
			</div>
			<div class="grid gap-3 p-5 pt-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
				<figure class="relative overflow-hidden rounded-xl border border-border/60">
					<img
						src="/brewhouse.jpg"
						alt="Brewhouse equipment"
						class="aspect-[5/4] w-full object-cover"
						loading="lazy"
						decoding="async"
					/>
					<figcaption
						class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3 text-xs font-medium text-white"
					>
						Brewhouse foundations
					</figcaption>
				</figure>
				<figure class="relative overflow-hidden rounded-xl border border-border/60">
					<img
						src="/hops.jpg"
						alt="Fresh hops"
						class="aspect-[5/4] w-full object-cover"
						loading="lazy"
						decoding="async"
					/>
					<figcaption
						class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3 text-xs font-medium text-white"
					>
						The aroma side of the story
					</figcaption>
				</figure>
			</div>
		</Card.Root>
	</div>

	<div class="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
		{#each beerStyles as style (style.title)}
			<Card.Root
				class="border-border/60 bg-card/90 group gap-0 overflow-hidden rounded-3xl py-0 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
			>
				<div class="border-border/40 bg-muted/35 relative overflow-hidden border-b">
					<div class={["absolute inset-0 bg-gradient-to-br opacity-25", style.headerClass]}></div>
					<div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_36%)]"></div>
					<Card.Header class="relative min-h-36 justify-between p-5 text-foreground">
						<div class="flex items-start justify-between gap-3">
							<Badge
								variant="outline"
								class="border-border/60 bg-background/70 text-foreground backdrop-blur-xs"
							>
								{style.family}
							</Badge>
							<span
								class="text-muted-foreground text-right text-xs font-medium tracking-[0.16em] uppercase"
							>
								{style.abv}
							</span>
						</div>
						<div class="space-y-2">
							<Card.Title class="text-balance text-2xl leading-tight text-foreground">
								{style.title}
							</Card.Title>
							<Card.Description class="text-muted-foreground max-w-[24rem] text-sm leading-relaxed">
								{style.description}
							</Card.Description>
						</div>
					</Card.Header>
				</div>

				<Card.Content class="space-y-4 p-5 pt-5">
					<p class="text-muted-foreground leading-relaxed">{style.body}</p>
					<div class="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
						<span class={["text-sm font-medium", style.noteClass]}>{style.note}</span>
						<span class="text-muted-foreground text-xs tracking-[0.18em] uppercase">IBC guide</span>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</section>
