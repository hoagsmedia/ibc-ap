<script lang="ts">
	const meta = {
		title: 'Beer Links & Resources | Island Beer Club',
		description:
			'A curated list of beer resources, breweries, and fun links for Island Beer Club members and visitors.',
		image: '/logo-ibc.webp',
		url: 'https://islandbeerclub.com/links'
	};

	const links = [
		{
			category: 'Beer Resources',
			items: [
				{ name: 'Beer Advocate', url: 'https://www.beeradvocate.com/' },
				{ name: 'RateBeer', url: 'https://www.ratebeer.com/' },
				{ name: 'Brewers Association', url: 'https://www.brewersassociation.org/' },
				{ name: 'Homebrew Talk', url: 'https://www.homebrewtalk.com/' },
				{ name: 'Pint Price (World Beer Prices)', url: 'http://www.pintprice.com/' },
				{
					name: 'KegWorks Keg Sizes',
					url: 'https://www.kegworks.com/blog/guide-to-beer-keg-sizes/'
				},
				{
					name: 'Beer Flowchart',
					url: 'http://www.keithandthegirl.com/forums/f6/beer-flowchart-14399/'
				}
			]
		},
		{
			category: 'Breweries',
			items: [
				{ name: 'Stone Brewing', url: 'https://www.stonebrewing.com/' },
				{ name: 'Coronado Brewing', url: 'https://coronadobrewing.com/' },
				{ name: 'Ballast Point', url: 'https://www.ballastpoint.com/' },
				{ name: 'Karl Strauss', url: 'https://www.karlstrauss.com/' }
			]
		},
		{
			category: 'Fun & Miscellaneous',
			items: [
				{ name: 'Biorhythm Calculator', url: 'https://www.biorhythm-calculator.net/' },
				{ name: 'Born Again American', url: 'http://www.bornagainamerican.org' },
				{ name: 'Hangman Game', url: '/fun.htm' },
				{ name: 'Foo Dogs', url: '/foodog' },
				{ name: 'IBC Science Corner', url: '/science.htm' },
				{ name: 'Beer Styles', url: '/styles.htm' },
				{ name: 'IBC Stats', url: '/stats.htm' }
			]
		}
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

<section class="mx-auto max-w-2xl px-4 py-12 text-black">
	<h1 class="mb-6 text-center text-3xl font-bold">Beer Links & Resources</h1>
	{#each links as section (section.category)}
		<div class="mb-8">
			<h2 class="mb-2 text-xl font-semibold">{section.category}</h2>
			<ul class="space-y-2">
				{#each section.items as item (item.url + item.name)}
					<li>
						<a
							href={item.url}
							target={item.url.startsWith('http') ? '_blank' : undefined}
							rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}
							class="text-blue-600 underline hover:text-blue-800"
						>
							{item.name}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</section>
