<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
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

<section class="mx-auto max-w-3xl px-4 py-12">
	<h1 class="mb-6 text-4xl font-bold">Brewing Process and Beer Styles</h1>
	<p class="mb-4 text-lg">
		<strong>Brewing Process:</strong> Learn from the experts. Visit
		<a
			href="https://science.howstuffworks.com/innovation/edible-innovations/beer.htm"
			class="underline"
			target="_blank"
			rel="noopener">How Stuff Works</a
		> for an illustrative presentation on the brewing process.
	</p>

	<p class="mb-8 text-lg">
		Below is a short list of beer styles available worldwide. For a broader overview and more
		extensive list, visit
		<a
			href="https://www.beeradvocate.com/beer/styles/"
			class="underline"
			target="_blank"
			rel="noopener">Beer Advocate</a
		>.
	</p>
	<div class="mb-8 flex flex-col items-center gap-4 md:flex-row md:justify-center">
		<img src="/brewhouse.jpg" alt="Brewhouse" class="h-40 w-auto rounded shadow" />
		<img src="/hops.jpg" alt="Hops" class="h-40 w-auto rounded shadow" />
	</div>
	<div class="grid gap-6 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>What's an Ale?</Card.Title>
				<Card.Description>Top-fermenting yeast, fruity and aromatic.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>
					This category of beer uses yeast that ferments at the top of the vessel, typically at
					higher temperatures (60°-75°F), resulting in a quicker fermentation and estery, fruity
					aromas.
				</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>What's a Lager?</Card.Title>
				<Card.Description>Bottom-fermenting yeast, clean and crisp.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>
					Lagers are brewed with yeast that works slowly at cool temperatures (~34°F) and are stored
					to mature. They have a soft, clean taste and are generally more refreshing and less
					diverse than ales.
				</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Barley Wine</Card.Title>
				<Card.Description>Strong ale, 8–12% ABV.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>Very strong, rich, and malty. Sipped and savored.</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Bitter</Card.Title>
				<Card.Description>British-style, hoppy ale.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>High hop content, causing bitterness. Classic UK pub style.</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Bock / Doppelbock</Card.Title>
				<Card.Description>Strong, dark German lagers.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>Bock is strong and dark; Doppelbock is an extra-strong version.</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Brown Ale</Card.Title>
				<Card.Description>Mild, brown UK beer.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>Gentle, malty, and easy-drinking. Associated with the UK.</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Czech Pilsner</Card.Title>
				<Card.Description>Light, hoppy, and floral.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>Bohemian style, spicy bitterness, and floral Saaz hops.</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Dortmunder / Export Lager</Card.Title>
				<Card.Description>Pale golden, dry, and biscuity.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>Classic German lager, firm mouthfeel, dry finish, aromatic.</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Imperial Stout</Card.Title>
				<Card.Description>Very strong, dark stout.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>Originally brewed for export to Russia. 7–10% ABV, rich and intense.</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>India Pale Ale (IPA)</Card.Title>
				<Card.Description>Strong, hoppy, historic export ale.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>Originated in the UK for export to India. Strong, bitter, and aromatic.</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Marzenbier</Card.Title>
				<Card.Description>Medium-strong, malty lager.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>Associated with Oktoberfest and the fall. Malty and smooth.</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Pale Ale</Card.Title>
				<Card.Description>Fruity, milder IPA.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>Milder and fruitier than IPA, with a balanced hop profile.</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Pilsner</Card.Title>
				<Card.Description>Clear, carbonated, hoppy lager.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>The most imitated beer style in the world. Crisp and refreshing.</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Porter</Card.Title>
				<Card.Description>Very dark, bitter English ale.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>First brewed in 1730. Robust, roasty, and full-bodied.</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Scottish Ale</Card.Title>
				<Card.Description>Sweeter, less hoppy pale ale.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>Darker malt, stronger, and less hoppy than English pale ales.</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Stout</Card.Title>
				<Card.Description>Very dark, heavy, and sweet.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>See Oatmeal, Imperial, Dry, Sweet, and Milk for substyles. Rich and bold.</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Trappist Ale</Card.Title>
				<Card.Description>Strong, fruity Belgian ales.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>Made by Trappist monks, bottled with active yeast. Complex and unique.</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Wheat Beer (Weisse)</Card.Title>
				<Card.Description>Cloudy, refreshing, clove-like bouquet.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>20–60% wheat, often garnished with lemon. Light and lively.</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
	</div>
</section>
