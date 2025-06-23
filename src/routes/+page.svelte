<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { quotes } from '$lib/data/quotes.js';

	// Sort quotes by date descending, putting undated quotes last
	function parseDate(date?: string): number {
		if (!date) return 0;
		// Accepts formats like '30 Oct 09' or '24 Mar 10'
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
		title: 'Island Beer Club',
		description:
			'The official site of Island Beer Club. Learn about our members, events, and the spirit of craft beer on Coronado Island.',
		image: '/the-founders.png',
		url: 'https://islandbeerclub.com/'
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

<section class="relative flex min-h-[300px] items-center justify-center md:min-h-[500px]">
	<img
		src="/the-founders.png"
		alt="Island Beer Club founders"
		class="absolute inset-0 z-0 mt-2 h-full w-full rounded object-contain object-center brightness-75 md:object-cover"
		loading="eager"
		draggable="false"
	/>
	<div class="relative z-10 text-center">
		<h1 class="text-4xl font-bold text-white drop-shadow-lg md:text-6xl">
			Rule #1
			<span class="mt-2 block text-2xl font-normal md:text-4xl">There are no rules</span>
		</h1>
	</div>
</section>

<section class="py-12 text-center">
	<h1 class="mb-2 text-4xl font-bold">
		Rule #1<span class="ml-2 font-normal">There are no rules</span>
	</h1>
	<div class="mx-auto mt-6 max-w-xl">
		<h2 class="mb-2 text-2xl font-semibold">Why Island Beer Club?</h2>
		<p class="mb-6">
			We are a bunch of guys who grew up together and love beer. We’ve all gone off to school, have
			had successful careers and, in our later life, returned to our home town to reunite and share
			experiences. We’re posting this site to communicate and coordinate with our numerous members
			worldwide and with potential members wherever they may be. This is for our amusement and
			entertainment. If you like it please return.
		</p>
		<h2 class="mb-2 text-2xl font-semibold">We are Island Beer Club</h2>
		<img
			src="/videoImage.jpg"
			alt="IBC Group"
			class="mx-auto mb-6 h-auto max-w-full rounded shadow"
		/>
		<p class="mb-6">
			We believe that one of the best ways to enjoy craft beer is with good company. IBC meets every
			Wednesday at 4 pm. Guests, especially ladies are always welcome when accompanied by a Beer
			Club member.
		</p>
	</div>
</section>

<section class="bg-slate-50 py-12 text-center">
	<h2 class="mb-6 text-2xl font-semibold">Meet The Founders</h2>
	<div class="mb-8 flex flex-wrap justify-center gap-8">
		<div>
			<img
				src="/JeffWilkens.jpg"
				alt="Jeff Wilkens"
				class="mx-auto mb-2 h-40 w-40 rounded-full object-cover shadow"
			/>
			<div class="font-medium">Jeff Wilkens</div>
		</div>
		<div>
			<img
				src="/Morton.jpg"
				alt="John Morton"
				class="mx-auto mb-2 h-40 w-40 rounded-full object-cover shadow"
			/>
			<div class="font-medium">John Morton</div>
		</div>
		<div>
			<img
				src="/Muncey.jpg"
				alt="John Muncey"
				class="mx-auto mb-2 h-40 w-40 rounded-full object-cover shadow"
			/>
			<div class="font-medium">John Muncey</div>
		</div>
		<div>
			<img
				src="/Oly.jpg"
				alt="Wayne Oldendorph"
				class="mx-auto mb-2 h-40 w-40 rounded-full object-cover shadow"
			/>
			<div class="font-medium">Wayne Oldendorph</div>
		</div>
		<div>
			<img
				src="/Rob.jpg"
				alt="Rob Crenshaw"
				class="mx-auto mb-2 h-40 w-40 rounded-full object-cover shadow"
			/>
			<div class="font-medium">Rob Crenshaw</div>
		</div>
	</div>
</section>

<!-- Membership Callout Section -->
<section class="callout-section relative flex min-h-[320px] flex-col items-center justify-end">
	<!-- <img
		src="/mug-table-ibc-logo.svg"
		alt="IBC Beer Mug Logo"
		class="pointer-events-none mx-auto h-full w-full max-w-3xl object-contain select-none"
		draggable="false"
	/> -->
	<div
		class="absolute top-6 left-6 max-w-xs bg-transparent p-4 text-left text-white shadow-md md:top-10 md:left-10"
	>
		<h2 class="mb-1 text-xl font-bold md:text-2xl">How does one become a member?</h2>
		<p class="text-base md:text-lg">Buy a keg of hand-crafted beer</p>
	</div>
</section>

<!-- Welcome & Site Tips Section -->
<section class="bg-slate-100 py-12 text-black">
	<div class="mx-auto max-w-2xl space-y-6 px-4">
		<h2 class="mb-4 text-center text-2xl font-semibold">Welcome & Site Tips</h2>
		<p class="text-center text-base">
			While you are exploring the site, be mindful that there are pages imbedded throughout that are
			not accessible through the normal navigation buttons. Drag your cursor over pictures; if it
			changes to a pointing hand, you have found a hyperlink and you will find other hidden jewels.
			Also the <span class="font-semibold">"Fun" page changes daily</span>... come back often and
			please enjoy your visits.<br />
			<span class="mt-2 block font-bold">Remember, RULE #1: There ARE no rules.</span>
		</p>
		<p class="text-center text-base">
			How does one become a member? <span class="font-semibold"
				>Buy a keg of hand-crafted beer.</span
			>
		</p>
		<div class="border-t border-gray-300 pt-6">
			<h3 class="mb-2 text-lg font-semibold">Site Navigation</h3>
			<ul class="list-inside list-disc space-y-1">
				<li>
					Use the navigation buttons along the top or bottom of the page for subject grouping pages.
				</li>
				<li>Click on the hyperlinks for another means of travel to another page.</li>
				<li>
					Any time you see the <span class="font-medium text-blue-600">blue text</span>, click on it
					and see where it takes you.
				</li>
				<li>
					Dragging the cursor over pictures, where the cursor turns into a pointing hand, may also
					be fruitful.
				</li>
				<li>Please take a tour. We will be adding more areas as we grow.</li>
			</ul>
		</div>
		<div class="border-t border-gray-300 pt-6">
			<h3 class="mb-2 text-lg font-semibold">IBC Quick Links & Fun Facts</h3>
			<ul class="list-inside list-disc space-y-1">
				<li>
					<a
						href="https://www.kegworks.com/blog/guide-to-beer-keg-sizes/"
						target="_blank"
						rel="noopener noreferrer"
						class="text-blue-600 underline hover:text-blue-800"
					>
						How many pints in a half barrel? <span class="text-xs text-gray-500"
							>NEW-25 Feb 2017</span
						>
					</a>
				</li>
				<li>
					<a
						href="http://www.keithandthegirl.com/forums/f6/beer-flowchart-14399/"
						target="_blank"
						rel="noopener noreferrer"
						class="text-blue-600 underline hover:text-blue-800"
					>
						Want help choosing your next beer? CLICK HERE.
					</a>
				</li>
				<li>
					<a href="alert.html" class="text-blue-600 underline hover:text-blue-800"
						>We care about your safety. Check out our Alert Notification page.</a
					>
				</li>
				<li>
					<a
						href="http://www.bornagainamerican.org"
						target="_blank"
						rel="noopener noreferrer"
						class="text-blue-600 underline hover:text-blue-800"
					>
						Proud to be an American? Pass this link around.
					</a>
				</li>
				<li>
					<a href="profiles.htm" class="text-blue-600 underline hover:text-blue-800"
						>Meet our members. Watch our growth.</a
					>
				</li>
				<li>
					<a href="MM.htm" class="text-blue-600 underline hover:text-blue-800"
						>Know anything about Coronado and Some Like It Hot?</a
					>
				</li>
				<li>
					<a href="poem.htm" class="text-blue-600 underline hover:text-blue-800"
						>The Poem Stranger has blessed us with a poem.</a
					>
				</li>
				<li>
					<a href="styles.htm" class="text-blue-600 underline hover:text-blue-800"
						>Know anything about beer styles?</a
					>
				</li>
				<li>
					<a
						href="http://www.pintprice.com/"
						target="_blank"
						rel="noopener noreferrer"
						class="text-blue-600 underline hover:text-blue-800"
					>
						How much does beer cost world-wide?
					</a>
				</li>
				<li>
					<a href="ibuchart.htm" class="text-blue-600 underline hover:text-blue-800"
						>How bitter is your beer?</a
					>
				</li>
				<li>
					<a href="science.htm" class="text-blue-600 underline hover:text-blue-800"
						>IBC Science Corner.</a
					> Learn the physics of life.
				</li>
				<li>
					<a
						href="https://www.biorhythm-calculator.net/"
						target="_blank"
						rel="noopener noreferrer"
						class="text-blue-600 underline hover:text-blue-800"
					>
						Check your biorythms.
					</a>
				</li>
				<li>
					<a href="fun.htm" class="text-blue-600 underline hover:text-blue-800"
						>How long has it been since you've played Hangman?</a
					>
				</li>
				<li>
					<a href="links.htm" class="text-blue-600 underline hover:text-blue-800"
						>What's the oldest brewery in the U. S.?</a
					>
				</li>
				<li>
					<a href="stats.htm" class="text-blue-600 underline hover:text-blue-800"
						>How much beer has the IBC consumed?</a
					>
				</li>
				<li>
					<a href="/foodog" class="text-blue-600 underline hover:text-blue-800"
						>Do you know anything about Foo Dogs?</a
					>
				</li>
				<li>
					<a href="styles.htm" class="text-blue-600 underline hover:text-blue-800"
						>How much do you know about brewing?</a
					>
				</li>
			</ul>
		</div>
	</div>
</section>

<!-- Quotes Section -->
<section class="bg-white py-12 text-black">
	<div class="mx-auto max-w-2xl px-4">
		<h2 class="mb-8 text-center text-2xl font-semibold">Member Quotes</h2>
		<ul class="space-y-8">
			{#each sortedQuotes as quote}
				<li>
					<Card.Root class="bg-accent p-6 shadow-lg">
						<Card.Header>
							<Card.Title class="text-lg font-light whitespace-pre-line">{quote.text}</Card.Title>
							{#if quote.author || quote.submitter || quote.date}
								<Card.Description>
									<span>
										{#if quote.author}— {quote.author}{/if}
										{#if quote.submitter}<span class="ml-2">(Submitted by {quote.submitter})</span
											>{/if}
										{#if quote.date}<span class="ml-2">{quote.date}</span>{/if}
									</span>
								</Card.Description>
							{/if}
						</Card.Header>
					</Card.Root>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.callout-section {
		background-color: black;
		background-image: url('/mug-table-ibc-logo.svg');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		min-height: 320px;
		display: flex;
	}
</style>
