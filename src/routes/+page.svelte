<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { quotes } from "$lib/data/quotes.js";
	import { founders } from "$lib/data/founders";
	import { cn } from "$lib/utils.js";

	function parseDate(date?: string): number {
		if (!date) return 0;
		const d = Date.parse(
			date.replace(/(\d{2}) (\w{3}) (\d{2})/, (m, day, mon, yr) => `${day} ${mon} 20${yr}`)
		);
		return isNaN(d) ? 0 : d;
	}
	const sortedQuotes = [...quotes].sort((a, b) => {
		const da = parseDate(a.date);
		const db = parseDate(b.date);
		if (da && db) return db - da;
		if (da) return -1;
		if (db) return 1;
		return 0;
	});

	const meta = {
		title: "Island Beer Club",
		description:
			"The official site of Island Beer Club. Learn about our members, events, and the spirit of craft beer on Coronado Island.",
		image: "/the-founders.png",
		url: "https://islandbeerclub.com/"
	};

	const linkClass =
		"text-primary font-medium underline decoration-primary/35 underline-offset-[3px] transition-colors hover:text-primary/90 hover:decoration-primary/60";
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

<div class="home-root overflow-x-clip text-foreground">
	<!-- Hero -->
	<section
		class="home-bleed relative flex min-h-[min(78vh,640px)] items-end justify-center overflow-hidden pb-16 pt-28 md:min-h-[min(85vh,760px)] md:items-center md:pb-24 md:pt-32"
	>
		<div class="absolute inset-0 z-0">
			<img
				src="/the-founders.png"
				alt="Island Beer Club founders"
				class="h-full w-full scale-105 object-cover object-[center_20%] brightness-[0.72] md:object-center"
				loading="eager"
				draggable="false"
			/>
			<div
				class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/15 md:bg-gradient-to-r md:from-black/82 md:via-black/38 md:to-black/5"
				aria-hidden="true"
			></div>
		</div>
		<div class="relative z-10 mx-auto max-w-4xl px-4 text-center md:px-6">
			<p
				class="mb-3 text-xs font-semibold tracking-[0.22em] text-white/90 drop-shadow-md md:text-sm"
			>
				Coronado · Since the beginning
			</p>
			<h1 class="text-balance text-4xl font-semibold tracking-tight text-white drop-shadow-md md:text-6xl md:leading-[1.05]">
				Rule #1
				<span class="mt-3 block text-2xl font-normal tracking-normal text-white/95 md:mt-4 md:text-4xl"
					>There are no rules</span
				>
			</h1>
		</div>
	</section>

	<!-- Story -->
	<section class="border-border/60 bg-background border-b py-14 md:py-20">
		<div class="mx-auto max-w-xl px-4 md:px-6">
			<h2 class="text-foreground mb-2 text-3xl font-semibold tracking-tight md:text-4xl">
				Why Island Beer Club?
			</h2>
			<p class="text-muted-foreground leading-relaxed">
				We are a bunch of guys who grew up together and love beer. We’ve all gone off to school, have
				had successful careers and, in our later life, returned to our home town to reunite and share
				experiences. We’re posting this site to communicate and coordinate with our numerous members
				worldwide and with potential members wherever they may be. This is for our amusement and
				entertainment. If you like it please return.
			</p>
		</div>
	</section>

	<section class="py-14 md:py-20">
		<div class="mx-auto max-w-xl px-4 md:px-6">
			<h2 class="text-foreground mb-6 text-center text-2xl font-semibold tracking-tight md:text-3xl">
				We are Island Beer Club
			</h2>
			<figure class="overflow-hidden rounded-2xl border border-border/60 shadow-lg shadow-black/10">
				<img
					src="/videoImage.jpg"
					alt="IBC group"
					class="h-auto w-full object-cover"
					loading="lazy"
				/>
			</figure>
			<p class="text-muted-foreground mt-8 leading-relaxed">
				We believe that one of the best ways to enjoy craft beer is with good company. IBC meets every
				Wednesday at 4 pm. Guests, especially ladies are always welcome when accompanied by a Beer
				Club member.
			</p>
		</div>
	</section>

	<!-- Founders -->
	<section
		class="home-bleed border-border/50 from-muted/40 to-muted/15 bg-gradient-to-b border-y py-14 md:py-20"
	>
		<div class="mx-auto max-w-5xl px-4 md:px-6">
			<h2 class="text-foreground mb-10 text-center text-2xl font-semibold tracking-tight md:text-3xl">
				Meet the founders
			</h2>
			<div class="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-5">
				{#each founders as founder (founder.name)}
					<div class="flex flex-col items-center text-center">
						<div
							class="ring-border mb-3 aspect-square w-full max-w-[7.5rem] overflow-hidden rounded-2xl ring-1 shadow-md"
						>
							<img src={founder.photo} alt={founder.name} class="h-full w-full object-cover" loading="lazy" />
						</div>
						<p class="text-foreground text-sm font-medium leading-snug">{founder.name}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Membership callout -->
	<section
		class="home-bleed relative flex min-h-[min(52vh,440px)] flex-col justify-end bg-black bg-[url('/mug-table-ibc-logo.svg')] bg-cover bg-center bg-no-repeat pb-10 md:min-h-[420px] md:pb-14"
	>
		<div
			class="from-background/15 absolute inset-0 bg-gradient-to-t to-transparent md:bg-gradient-to-r md:from-transparent md:via-background/25 md:to-background/70"
			aria-hidden="true"
		></div>
		<div class="relative z-10 mx-auto w-full max-w-5xl px-4 md:px-6">
			<div
				class="border-border/30 bg-background/75 supports-[backdrop-filter]:bg-background/55 max-w-md rounded-2xl border p-6 shadow-xl backdrop-blur-md md:p-8"
			>
				<h2 class="text-foreground mb-2 text-xl font-semibold md:text-2xl">
					How does one become a member?
				</h2>
				<p class="text-muted-foreground text-base leading-relaxed md:text-lg">
					Buy a keg of hand-crafted beer.
				</p>
			</div>
		</div>
	</section>

	<!-- Welcome & tips -->
	<section class="bg-muted/35 py-14 md:py-20">
		<div class="mx-auto max-w-2xl space-y-10 px-4 md:px-6">
			<div class="space-y-4 text-center">
				<h2 class="text-foreground text-2xl font-semibold tracking-tight md:text-3xl">
					Welcome & site tips
				</h2>
				<p class="text-muted-foreground leading-relaxed">
					While you are exploring the site, be mindful that there are pages embedded throughout that are
					not accessible through the normal navigation buttons. Drag your cursor over pictures; if it
					changes to a pointing hand, you have found a hyperlink and you will find other hidden jewels.
					Also the <span class="text-foreground font-medium">“Fun” page changes daily</span> — come back
					often and please enjoy your visits.
				</p>
				<p class="text-foreground text-base font-medium">
					Remember, Rule #1: there are no rules.
				</p>
				<p class="text-muted-foreground">
					How does one become a member?
					<span class="text-foreground font-semibold">Buy a keg of hand-crafted beer.</span>
				</p>
			</div>

			<div class="border-border/60 space-y-3 border-t pt-10">
				<h3 class="text-foreground text-lg font-semibold">Site navigation</h3>
				<ul class="text-muted-foreground list-inside list-disc space-y-2 leading-relaxed marker:text-primary/70">
					<li>Use the navigation along the top or bottom of the page for subject grouping.</li>
					<li>Follow hyperlinks for another way to move between pages.</li>
					<li>
						Any time you see <span class="text-primary font-medium">accent-colored text</span>, click it
						and see where it takes you.
					</li>
					<li>
						Hovering over pictures where the cursor becomes a pointer can also lead somewhere good.
					</li>
					<li>Please take a tour — we will be adding more areas as we grow.</li>
				</ul>
			</div>

			<div class="border-border/60 space-y-3 border-t pt-10">
				<h3 class="text-foreground text-lg font-semibold">IBC quick links & fun facts</h3>
				<ul class="text-muted-foreground list-inside list-disc space-y-2.5 leading-relaxed marker:text-primary/70">
					<li>
						<a
							href="https://www.kegworks.com/blog/guide-to-beer-keg-sizes/"
							target="_blank"
							rel="noopener noreferrer"
							class={linkClass}
						>
							How many pints in a half barrel?
						</a>
						<span class="text-muted-foreground/80 text-xs"> · Feb 2017</span>
					</li>
					<li>
						<a
							href="http://www.keithandthegirl.com/forums/f6/beer-flowchart-14399/"
							target="_blank"
							rel="noopener noreferrer"
							class={linkClass}
						>
							Want help choosing your next beer?
						</a>
					</li>
					<li>
						<a href="/contact" class={linkClass}>We care about your safety — get in touch anytime.</a>
					</li>
					<li>
						<a
							href="http://www.bornagainamerican.org"
							target="_blank"
							rel="noopener noreferrer"
							class={linkClass}
						>
							Proud to be an American? Pass this link around.
						</a>
					</li>
					<li><a href="/members" class={linkClass}>Meet our members. Watch our growth.</a></li>
					<li>
						<a href="/history" class={linkClass}>Know anything about Coronado and Some Like It Hot?</a>
					</li>
					<li><a href="/founders-day/knox-poem" class={linkClass}>The Poem Stranger has blessed us with a poem.</a></li>
					<li><a href="/styles" class={linkClass}>Know anything about beer styles?</a></li>
					<li>
						<a href="http://www.pintprice.com/" target="_blank" rel="noopener noreferrer" class={linkClass}>
							How much does beer cost world-wide?
						</a>
					</li>
					<li><a href="/stats" class={linkClass}>How much beer has the IBC consumed?</a></li>
					<li><a href="/foodog" class={linkClass}>Do you know anything about Foo Dogs?</a></li>
					<li><a href="/science" class={linkClass}>IBC science corner — learn the physics of life.</a></li>
					<li>
						<a
							href="https://www.biorhythm-calculator.net/"
							target="_blank"
							rel="noopener noreferrer"
							class={linkClass}
						>
							Check your biorhythms.
						</a>
					</li>
					<li><a href="/fun" class={linkClass}>How long has it been since you've played Hangman?</a></li>
					<li><a href="/links" class={linkClass}>What's the oldest brewery in the U. S.?</a></li>
					<li><a href="/gallery" class={linkClass}>Gallery & moments from the club.</a></li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Quotes -->
	<section class="bg-background py-14 md:py-20">
		<div class="mx-auto max-w-2xl px-4 md:px-6">
			<h2 class="text-foreground mb-10 text-center text-2xl font-semibold tracking-tight md:text-3xl">
				Member quotes
			</h2>
			<ul class="space-y-6">
				{#each sortedQuotes as quote, i (quote.date + quote.text.slice(0, 24) + i)}
					<li>
						<Card.Root
							class={cn(
								"border-border/60 bg-card/80 shadow-sm transition-shadow hover:shadow-md",
								"supports-[backdrop-filter]:bg-card/70 backdrop-blur-sm"
							)}
						>
							<Card.Header class="gap-3 p-6 md:p-7">
								<Card.Title class="text-foreground text-lg font-normal leading-relaxed whitespace-pre-line">
									{quote.text}
								</Card.Title>
								{#if quote.author || quote.submitter || quote.date}
									<Card.Description class="text-muted-foreground text-sm">
										{#if quote.author}<span>— {quote.author}</span>{/if}
										{#if quote.submitter}<span class="ml-2">(Submitted by {quote.submitter})</span>{/if}
										{#if quote.date}<span class="ml-2 tabular-nums">{quote.date}</span>{/if}
									</Card.Description>
								{/if}
							</Card.Header>
						</Card.Root>
					</li>
				{/each}
			</ul>
		</div>
	</section>
</div>

<style>
	/* Full-bleed inside layout max-width wrapper */
	.home-root :global(.home-bleed) {
		width: 100vw;
		margin-left: calc(50% - 50vw);
	}
</style>
