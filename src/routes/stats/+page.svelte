<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
</script>

<svelte:head>
	<title>IBC Stats | Island Beer Club</title>
	<meta
		name="description"
		content="Fun facts and statistics about the Island Beer Club. See our membership numbers, favorite beers, and more!"
	/>
	<meta property="og:title" content="IBC Stats | Island Beer Club" />
	<meta
		property="og:description"
		content="Fun facts and statistics about the Island Beer Club. See our membership numbers, favorite beers, and more!"
	/>
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-12">
	<h1 class="mb-6 text-4xl font-bold text-yellow-400">IBC Stats</h1>
	<p class="mb-8 text-lg text-white">
		Here are some fun facts and stats about the Island Beer Club. Cheers to our members and our love
		of great beer!
	</p>
	<div class="grid gap-6 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>Members</Card.Title>
				<Card.Description>Active membership</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>Over 50 active members and counting!</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Beers Sampled</Card.Title>
				<Card.Description>Unique beers tasted</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>More than 300 unique beers tasted at club events.</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Events Hosted</Card.Title>
				<Card.Description>Club gatherings</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>Quarterly tastings, annual BBQs, and special themed nights.</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Favorite Style</Card.Title>
				<Card.Description>Most popular beer</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>IPA reigns supreme, but stouts and lagers are close behind!</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Fun Fact</Card.Title>
				<Card.Description>Club trivia</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>Our longest-running member has attended every event since 2005.</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>IBC Motto</Card.Title>
				<Card.Description>Club spirit</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>"Good beer, good friends, good times!"</p>
			</Card.Content>
			<Card.Footer />
		</Card.Root>
	</div>
</section>
