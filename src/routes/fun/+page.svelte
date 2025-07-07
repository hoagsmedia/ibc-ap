<script lang="ts">
	import { Calendar, BookOpen, Newspaper, Quote, GamepadIcon, Users } from "@lucide/svelte/icons";
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import type { PageProps } from "./$types";

	const { data }: PageProps = $props();

	// Mock data for the fun activities - in a real app these could come from APIs
	let dailyQuote = $state({
		text: "Beer is proof that God loves us and wants us to be happy.",
		author: "Benjamin Franklin (disputed)"
	});

	let matchGame = $state({
		words: [
			{ word: "Ale", definition: "Top-fermented beer" },
			{ word: "Lager", definition: "Bottom-fermented beer" },
			{ word: "Stout", definition: "Dark, rich beer" },
			{ word: "IPA", definition: "India Pale Ale" }
		],
		currentMatch: null as { word: string; definition: string } | null,
		score: 0,
		gameComplete: false
	});

	// Create shuffled definitions for the game
	let shuffledDefinitions = $derived(() => {
		const definitions = matchGame.words.map((item) => item.definition);
		// Fisher-Yates shuffle algorithm
		const shuffled = [...definitions];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	});

	let selectedWord = $state<string | null>(null);
	let selectedDefinition = $state<string | null>(null);

	function selectWord(word: string) {
		selectedWord = word;
		checkMatch();
	}

	function selectDefinition(definition: string) {
		selectedDefinition = definition;
		checkMatch();
	}

	function checkMatch() {
		if (selectedWord && selectedDefinition) {
			const wordObj = matchGame.words.find((w) => w.word === selectedWord);
			if (wordObj && wordObj.definition === selectedDefinition) {
				matchGame.score++;
				// Remove matched pair
				matchGame.words = matchGame.words.filter((w) => w.word !== selectedWord);

				if (matchGame.words.length === 0) {
					matchGame.gameComplete = true;
				}
			}

			// Reset selections
			selectedWord = null;
			selectedDefinition = null;
		}
	}

	function resetGame() {
		matchGame.words = [
			{ word: "Ale", definition: "Top-fermented beer" },
			{ word: "Lager", definition: "Bottom-fermented beer" },
			{ word: "Stout", definition: "Dark, rich beer" },
			{ word: "IPA", definition: "India Pale Ale" }
		];
		matchGame.score = 0;
		matchGame.gameComplete = false;
		selectedWord = null;
		selectedDefinition = null;
	}

	let beerTrivia = $state([
		"The oldest known recipe for beer is over 4,000 years old",
		"Cenosillicaphobia is the fear of an empty beer glass",
		"The study of beer and beer-making is called zythology",
		"Hops are related to cannabis plants",
		"Beer was considered a safer drink than water in medieval times"
	]);

	let currentTriviaIndex = $state(0);

	function nextTrivia() {
		currentTriviaIndex = (currentTriviaIndex + 1) % beerTrivia.length;
	}
</script>

<svelte:head>
	<title>Fun & Games | Island Beer Club</title>
	<meta
		name="description"
		content="Fun activities, beer trivia, and games for Island Beer Club members"
	/>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 text-center">
		<h1 class="mb-4 text-4xl font-bold">Fun & Games</h1>
		<p class="text-muted-foreground text-lg">
			Enjoy daily content, beer trivia, and interactive games!
		</p>
	</div>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		<!-- Word of the Day -->
		<Card.Root class="col-span-full md:col-span-2 lg:col-span-1">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<BookOpen class="size-5" />
					Word of the Day
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="space-y-3">
					<div>
						<h3 class="text-primary text-2xl font-bold">{data.wordOfTheDay.word}</h3>
						<p class="text-muted-foreground text-sm">{data.wordOfTheDay.pronunciation}</p>
					</div>
					<p class="text-foreground">{data.wordOfTheDay.definition}</p>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Today in Beer History -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Calendar class="size-5" />
					This Day in History
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="space-y-2">
					<Badge variant="outline">{data.onThisDay.year}</Badge>
					<p class="text-foreground">{data.onThisDay.text}</p>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Quote of the Day -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Quote class="size-5" />
					Quote of the Day
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<blockquote class="space-y-2">
					<p class="text-foreground italic">"{dailyQuote.text}"</p>
					<footer class="text-muted-foreground text-sm">— {dailyQuote.author}</footer>
				</blockquote>
			</Card.Content>
		</Card.Root>

		<!-- Beer Trivia -->
		<Card.Root class="col-span-full md:col-span-2 lg:col-span-1">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Newspaper class="size-5" />
					Beer Trivia
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					<p class="text-foreground">{beerTrivia[currentTriviaIndex]}</p>
					<Button onclick={nextTrivia} variant="outline" class="w-full">Next Fact</Button>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Word Match Game -->
		<Card.Root class="col-span-full lg:col-span-2">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<GamepadIcon class="size-5" />
					Beer Term Match Game
				</Card.Title>
				<Card.Description>
					Match each beer term with its correct definition. Score: {matchGame.score}/4
				</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if matchGame.gameComplete}
					<div class="space-y-4 text-center">
						<div class="text-2xl font-bold text-green-600">🎉 Congratulations!</div>
						<p class="text-foreground">You matched all terms correctly!</p>
						<Button onclick={resetGame}>Play Again</Button>
					</div>
				{:else}
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<h4 class="text-center font-semibold">Terms</h4>
							{#each matchGame.words as item}
								<Button
									variant={selectedWord === item.word ? "default" : "outline"}
									onclick={() => selectWord(item.word)}
									class="w-full"
								>
									{item.word}
								</Button>
							{/each}
						</div>
						<div class="space-y-2">
							<h4 class="text-center font-semibold">Definitions</h4>
							{#each shuffledDefinitions() as definition}
								<Button
									variant={selectedDefinition === definition ? "default" : "outline"}
									onclick={() => selectDefinition(definition)}
									class="w-full text-left"
								>
									{definition}
								</Button>
							{/each}
						</div>
					</div>
					<div class="mt-4 text-center">
						<Button onclick={resetGame} variant="ghost">Reset Game</Button>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Member Spotlight -->
		<Card.Root class="col-span-full">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Users class="size-5" />
					Did You Know?
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="grid gap-4 md:grid-cols-3">
					<div class="space-y-2 text-center">
						<div class="text-primary text-3xl font-bold">436</div>
						<p class="text-muted-foreground text-sm">Total Members</p>
					</div>
					<div class="space-y-2 text-center">
						<div class="text-primary text-3xl font-bold">1,247</div>
						<p class="text-muted-foreground text-sm">Beers Reviewed</p>
					</div>
					<div class="space-y-2 text-center">
						<div class="text-primary text-3xl font-bold">89</div>
						<p class="text-muted-foreground text-sm">Different Styles</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
