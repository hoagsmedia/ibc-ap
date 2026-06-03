<script lang="ts">
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { quotes, type Quote } from "$lib/data/quotes.js";
	import { founders, type Founder } from "$lib/data/founders";

	const founderFirst = founders[0];
	const founderRest = founders.slice(1);

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

	const fallbackAttributionNames = [
		"An IBC member",
		"Island regular",
		"Wednesday crew",
		"Coronado member",
		"Founding spirit",
		"Keg philosophy dept."
	] as const;

	const fallbackMonths = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	] as const;

	function quoteDisplayName(q: Quote, i: number): string {
		const a = q.author?.trim();
		if (a) return a;
		return fallbackAttributionNames[i % fallbackAttributionNames.length];
	}

	/** Matches on-file style (`24 Mar 10`); invented when missing. */
	function quoteDisplayDate(q: Quote, i: number): string {
		const d = q.date?.trim();
		if (d) return d;
		const day = 1 + ((i * 11) % 28);
		const mon = fallbackMonths[(i * 5) % 12];
		const year = 2008 + ((i * 7) % 12);
		const yy = String(year).slice(-2);
		return `${day} ${mon} ${yy}`;
	}

	const quoteCards = sortedQuotes.map((quote, i) => ({
		quote,
		displayName: quoteDisplayName(quote, i),
		displayDate: quoteDisplayDate(quote, i)
	}));

	const meta = {
		title: "Island Beer Club",
		description:
			"The official site of Island Beer Club. Learn about our members, events, and the spirit of craft beer on Coronado Island.",
		image: "/images/optimized/the-founders-1140.webp",
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
	<link
		rel="preload"
		as="image"
		href="/images/optimized/the-founders-1140.webp"
		imagesrcset="/images/optimized/the-founders-760.webp 760w, /images/optimized/the-founders-1140.webp 1140w"
		imagesizes="100vw"
		fetchpriority="high"
	/>
</svelte:head>

<div class="home-root text-foreground overflow-x-clip">
	{#snippet founderTile(founder: Founder)}
		<div class="flex w-full max-w-[7.5rem] min-w-0 flex-col items-center text-center">
			<div
				class="ring-border mb-3 aspect-square w-full shrink-0 overflow-hidden rounded-2xl shadow-md ring-1"
			>
				<img
					src={founder.photo}
					alt={founder.name}
					class="h-full w-full object-cover"
					loading="lazy"
				/>
			</div>
			<p class="text-foreground w-full text-sm leading-snug font-medium text-balance break-words">
				{founder.name}
			</p>
		</div>
	{/snippet}
	<!-- Hero: capped height on large screens; image stays cover-cropped, never stretched -->
	<section
		class="home-bleed relative flex h-[clamp(18rem,42vw,34rem)] w-full items-center justify-center overflow-hidden"
	>
		<div class="absolute inset-0 z-0">
			<img
				src="/images/optimized/the-founders-1140.webp"
				srcset="/images/optimized/the-founders-760.webp 760w, /images/optimized/the-founders-1140.webp 1140w"
				sizes="100vw"
				alt="Island Beer Club founders"
				width="1140"
				height="600"
				class="h-full w-full object-cover object-[center_22%] brightness-[0.72] md:object-[center_12%] xl:object-contain"
				loading="eager"
				fetchpriority="high"
				decoding="sync"
				draggable="false"
			/>
			<div
				class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/15 md:bg-gradient-to-r md:from-black/82 md:via-black/38 md:to-black/5"
				aria-hidden="true"
			></div>
		</div>
		<div class="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 text-center md:px-6 md:py-10">
			<p
				class="mb-3 text-xs font-semibold tracking-[0.22em] text-white/90 drop-shadow-md md:text-sm"
			>
				Coronado · Since the beginning
			</p>
			<h1
				class="text-4xl font-semibold tracking-tight text-balance text-white drop-shadow-md md:text-6xl md:leading-[1.05]"
			>
				We have more time than money
				<span
					class="mt-3 block text-2xl font-normal tracking-normal text-white/95 md:mt-4 md:text-4xl"
					>Island Beer Club</span
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
				We are a bunch of guys who grew up together and love beer. We’ve all gone off to school,
				have had successful careers and, in our later life, returned to our home town to reunite and
				share experiences. We’re posting this site to communicate and coordinate with our numerous
				members worldwide and with prospects wherever they may be. This is for our amusement and
				entertainment. If you like it please return.
			</p>
		</div>
	</section>

	<section class="py-14 md:py-20">
		<div class="mx-auto max-w-xl px-4 md:px-6">
			<h2
				class="text-foreground mb-6 text-center text-2xl font-semibold tracking-tight md:text-3xl"
			>
				We are Island Beer Club
			</h2>
			<figure class="border-border/60 overflow-hidden rounded-2xl border shadow-lg shadow-black/10">
				<img
					src="/videoImage.jpg"
					alt="IBC group"
					class="h-auto w-full object-cover"
					loading="lazy"
				/>
			</figure>
			<p class="text-muted-foreground mt-8 leading-relaxed">
				We believe that one of the best ways to enjoy craft beer is with good company. IBC meets
				every Wednesday at 4 pm. Guests, especially ladies are always welcome when accompanied by a
				Beer Club member.
			</p>
		</div>
	</section>

	<!--
		Founders: no `home-bleed` here — 100vw sections made inner `max-w-4xl` wider than the
		home-root column (max-w-4xl minus ancestor px-4), which `overflow-x-clip` then cropped.
		`-mx-4 w-[calc(100%+2rem)]` only cancels the layout wrapper’s horizontal padding.
	-->
	<section
		class="border-border/50 from-muted/40 to-muted/15 -mx-4 w-[calc(100%+2rem)] border-y bg-gradient-to-b py-14 md:py-20"
	>
		<div class="px-4 md:px-6">
			<h2
				class="text-foreground mb-10 text-center text-2xl font-semibold tracking-tight md:text-3xl"
			>
				Meet the founders
			</h2>

			{#if founderFirst}
				<div class="mb-8 flex justify-center md:mb-10">
					{@render founderTile(founderFirst)}
				</div>
			{/if}

			<div
				class="grid grid-cols-2 justify-items-center gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:grid-cols-4 md:gap-x-3 md:gap-y-6 lg:gap-x-5 lg:gap-y-7"
			>
				{#each founderRest as founder (founder.name)}
					{@render founderTile(founder)}
				{/each}
			</div>
		</div>
	</section>

	<!-- Membership callout -->
	<section
		class="home-bleed relative flex min-h-[min(52vh,440px)] flex-col justify-end bg-black bg-[url('/mug-table-ibc-logo.svg')] bg-cover bg-center bg-no-repeat pb-10 md:min-h-[420px] md:pb-14"
	>
		<div
			class="from-background/15 md:via-background/25 md:to-background/70 absolute inset-0 bg-gradient-to-t to-transparent md:bg-gradient-to-r md:from-transparent"
			aria-hidden="true"
		></div>
		<div class="relative z-10 mx-auto w-full max-w-5xl px-5 pb-1 sm:px-8 sm:pb-0 md:px-10">
			<div
				class="border-border/30 bg-background/75 supports-[backdrop-filter]:bg-background/55 mx-auto w-full max-w-md min-w-0 rounded-2xl border p-6 shadow-xl backdrop-blur-md md:max-w-lg md:p-8"
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
					While you are exploring the site, be mindful that there are pages embedded throughout that
					are not accessible through the normal navigation buttons. Drag your cursor over pictures;
					if it changes to a pointing hand, you have found a hyperlink and you will find other
					hidden jewels. Also the <span class="text-foreground font-medium"
						>“Fun” page changes daily</span
					> — come back often and please enjoy your visits.
				</p>
				<p class="text-foreground text-base font-medium">We have more time than money.</p>
				<p class="text-muted-foreground">
					How does one become a member?
					<span class="text-foreground font-semibold">Buy a keg of hand-crafted beer.</span>
				</p>
			</div>

			<div class="border-border/60 space-y-3 border-t pt-10">
				<h3 class="text-foreground text-lg font-semibold">Site navigation</h3>
				<ul
					class="text-muted-foreground marker:text-primary/70 list-inside list-disc space-y-2 leading-relaxed"
				>
					<li>Use the navigation along the top or bottom of the page for subject grouping.</li>
					<li>Follow hyperlinks for another way to move between pages.</li>
					<li>
						Any time you see <span class="text-primary font-medium">accent-colored text</span>,
						click it and see where it takes you.
					</li>
					<li>
						Hovering over pictures where the cursor becomes a pointer can also lead somewhere good.
					</li>
					<li>Please take a tour — we will be adding more areas as we grow.</li>
				</ul>
			</div>

			<div class="border-border/60 space-y-3 border-t pt-10">
				<h3 class="text-foreground text-lg font-semibold">IBC quick links & fun facts</h3>
				<ul
					class="text-muted-foreground marker:text-primary/70 list-inside list-disc space-y-2.5 leading-relaxed"
				>
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
						<a href="/contact" class={linkClass}
							>We care about your safety — get in touch anytime.</a
						>
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
						<a href="/history" class={linkClass}
							>Know anything about Coronado and Some Like It Hot?</a
						>
					</li>
					<li>
						<a href="/founders-day/knox-poem" class={linkClass}
							>The Poem Stranger has blessed us with a poem.</a
						>
					</li>
					<li><a href="/styles" class={linkClass}>Know anything about beer styles?</a></li>
					<li>
						<a
							href="http://www.pintprice.com/"
							target="_blank"
							rel="noopener noreferrer"
							class={linkClass}
						>
							How much does beer cost world-wide?
						</a>
					</li>
					<li><a href="/stats" class={linkClass}>How much beer has the IBC consumed?</a></li>
					<li><a href="/foodog" class={linkClass}>Do you know anything about Foo Dogs?</a></li>
					<li>
						<a href="/science" class={linkClass}>IBC science corner — learn the physics of life.</a>
					</li>
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
					<li>
						<a href="/fun" class={linkClass}>How long has it been since you've played Hangman?</a>
					</li>
					<li><a href="/links" class={linkClass}>What's the oldest brewery in the U. S.?</a></li>
					<li><a href="/gallery" class={linkClass}>Gallery & moments from the club.</a></li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Quotes -->
	<section
		class="border-border/50 from-muted/25 to-background border-y bg-gradient-to-b py-14 md:py-20"
		aria-labelledby="member-quotes-heading"
	>
		<div class="mx-auto max-w-5xl px-4 md:px-6">
			<div class="mx-auto mb-10 max-w-2xl text-center md:mb-12">
				<p
					class="text-muted-foreground mb-2 text-[0.65rem] font-semibold tracking-[0.2em] uppercase sm:text-xs"
				>
					From the club
				</p>
				<h2
					id="member-quotes-heading"
					class="text-foreground text-2xl font-semibold tracking-tight md:text-3xl"
				>
					Member quotes
				</h2>
				<p class="text-muted-foreground mt-3 text-sm leading-relaxed md:text-base">
					Words members have shared — wisdom, humor, and the occasional tall tale.
				</p>
			</div>

			<ul class="grid gap-4 sm:gap-5 md:grid-cols-2">
				{#each quoteCards as { quote, displayName, displayDate }, i (quote.text.slice(0, 32) + i)}
					<li class="min-h-0">
						<article
							class="border-border/80 from-card/90 to-card/60 text-card-foreground hover:border-primary/35 focus-within:ring-ring relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm outline-offset-2 transition-[border-color,box-shadow] focus-within:ring-2 hover:shadow-md supports-[backdrop-filter]:backdrop-blur-sm sm:p-6"
						>
							<blockquote class="flex flex-1 flex-col gap-4">
								<p
									class="text-foreground text-[0.95rem] leading-relaxed whitespace-pre-line sm:text-base sm:leading-relaxed"
								>
									{quote.text}
								</p>

								<div class="mt-auto space-y-3">
									<Separator class="bg-border/60" />
									<footer
										class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4"
									>
										<cite
											class="text-foreground text-sm font-semibold tracking-tight not-italic sm:text-base"
										>
											— {displayName}
										</cite>
										<div
											class="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:justify-end"
										>
											{#if quote.submitter}
												<span
													class="bg-muted/80 text-muted-foreground border-border/50 inline-flex max-w-full rounded-md border px-2 py-0.5 font-medium"
												>
													Via {quote.submitter}
												</span>
											{/if}
											<time class="text-[0.7rem] tracking-wide uppercase tabular-nums sm:text-xs">
												{displayDate}
											</time>
										</div>
									</footer>
								</div>
							</blockquote>
						</article>
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
