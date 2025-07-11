<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";

	const meta = {
		title: "Original Founders Day Script | Island Beer Club",
		description:
			"The complete original ceremony script from the first IBC Founders Day celebration, including limericks, history, and traditions.",
		image: "/the-founders.png",
		url: "https://islandbeerclub.com/founders-day/original-script"
	};

	// Founders data for the script
	const founders = [
		{ name: 'Jeff "Bones" Wilkens', member: 1 },
		{ name: 'John "Old Doc" Morton', member: 2 },
		{ name: 'John "Cruncher" Muncy', member: 3 },
		{ name: 'Wayne "Big Oly" Oldendorph', member: 4 },
		{ name: 'Rob "Crenny" Crenshaw', member: 5 }
	];

	const limericks = [
		{
			founder: "Rob",
			presenter: "Jon S",
			text: `There once was a fellow name Rob
Who liked to hang out with the IBC mob
Having more time than money
The fab five didn't think that was funny
So tilt one back for webmaster Rob`
		},
		{
			founder: "Muncy",
			presenter: "Tim",
			text: `A problem was had by Muncy.
He wanted to see a MD.
Morton could cure,
of this he was sure,
for he saw it at IBC.

A small problem for old man Muncy.
Who complained it hurt to pee.
To Morton he went,
who diagnosed it bent,
and said "it's too small to see"`
		},
		{
			founder: "Bones",
			presenter: "???",
			text: `It was about nine years ago,
That a man we've all come to know,
Skinny in stature,
Older than Marg Thatcher,
Created the IBC show

He goes by the nickname of Bones,
Drinks more beer than the US has Drones,
Claims to golf like a pro,
And IBC members know,
He's more famous than Tommy Lee Jones.

Time to say thanks to DOM on the Rock,
The handsomest guy on the block,
So hats off to the guy,
Who makes us all cry,
When he blows the damn whistle at 6 o'clock.`
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

<div class="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
	<div class="mx-auto max-w-4xl px-4 py-12">
		<!-- Header -->
		<div class="mb-8 text-center">
			<a
				href="/founders-day"
				class="text-primary hover:text-primary/80 mb-4 inline-flex items-center gap-2 text-sm font-medium transition-colors"
			>
				← Back to Founders Day
			</a>
			<h1 class="text-foreground mb-4 text-4xl font-bold md:text-5xl">
				Original Founders Day Script
			</h1>
			<p class="text-muted-foreground mx-auto max-w-2xl text-xl">
				The complete ceremony script from the first IBC Founders Day celebration
			</p>
		</div>

		<!-- Pre-Stage & Setup -->
		<div class="mb-8">
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-3 text-2xl font-bold">
						<Badge
							variant="default"
							class="flex h-8 w-8 items-center justify-center rounded-full p-0">1</Badge
						>
						1700 - 1715: Pre-Stage & Setup
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="bg-muted/50 mb-6 rounded-lg p-6">
						<p class="text-foreground mb-4 font-semibold">
							1700 - 1715: Participants pre-stage, position for ceremony.
						</p>
						<ul class="text-card-foreground space-y-2">
							<li class="flex items-start gap-2">
								<div class="bg-primary mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"></div>
								Pre-stage cake in Rod's garage with candles in place, lighter on-hand.
							</li>
							<li class="flex items-start gap-2">
								<div class="bg-primary mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"></div>
								5 founder seats positioned on the line where Bones' tall chair normally sits, facing
								away from beer club.
							</li>
							<li class="flex items-start gap-2">
								<div class="bg-primary mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"></div>
								1710 - Give founders 5-minute warning to top-off and get near their seats.
							</li>
							<li class="flex items-start gap-2">
								<div class="bg-primary mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"></div>
								EMCEE & presenters stand along fence where banner usually hangs, facing founders.
							</li>
						</ul>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
		<ul>
			<li class="flex items-start gap-2">
				<div class="bg-primary mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"></div>
				5 founder seats positioned on the line where Bones' tall chair normally sits, facing away from
				beer club.
			</li>
			<li class="flex items-start gap-2">
				<div class="bg-primary mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"></div>
				1710 - Give founders 5-minute warning to top-off and get near their seats.
			</li>
			<li class="flex items-start gap-2">
				<div class="bg-primary mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"></div>
				EMCEE & presenters stand along fence where banner usually hangs, facing founders.
			</li>
		</ul>
	</div>
</div>

<!-- Ceremony Begins -->
<div class="mb-8">
	<div class="bg-card rounded-lg border p-8 shadow-md">
		<h2 class="text-foreground mb-6 flex items-center gap-3 text-2xl font-bold">
			<span
				class="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
				>2</span
			>
			1715: Ceremony Begins
		</h2>

		<div class="space-y-6">
			<div class="bg-primary/10 border-primary/20 rounded-lg border p-6">
				<h3 class="text-primary mb-3 font-bold">EMCEE:</h3>
				<blockquote class="text-card-foreground border-primary border-l-4 pl-4 text-lg italic">
					"Here ye, Here ye! All members present, please make way for our founders as they take
					their seats of honor!"
				</blockquote>
			</div>

			<ul class="text-card-foreground space-y-2">
				<li class="flex items-start gap-2">
					<div class="bg-primary mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"></div>
					Founders seated; any absent founders still get a chair and mug (filled if safe).
				</li>
			</ul>

			<div class="bg-muted/50 rounded-lg p-6">
				<h4 class="text-foreground mb-3 font-semibold">Intro:</h4>
				<blockquote class="text-card-foreground border-muted-foreground border-l-4 pl-4 italic">
					Welcome to the first of what we hope will become an IBC tradition where we celebrate our
					founders and the wonderful Rock tradition that is and hopefully forever shall be the IBC!
				</blockquote>
			</div>
		</div>
	</div>
</div>

<!-- IBC History Reading -->
<div class="mb-8">
	<div class="bg-card rounded-lg border p-8 shadow-md">
		<h2 class="text-foreground mb-6 flex items-center gap-3 text-2xl font-bold">
			<span
				class="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
				>📜</span
			>
			IBC History Reading
		</h2>

		<div class="prose prose-lg dark:prose-invert max-w-none">
			<blockquote
				class="border-primary bg-primary/5 text-card-foreground space-y-4 rounded-r-lg border-l-4 p-6"
			>
				<p>
					On a magnificent afternoon, mid-March in 2004, the Island Beer Club (IBC) was founded.
					Jeff "Bones" Wilkens (Mbr# 1), John "Old Doc" Morton (Mbr#2), John "Cruncher" Muncy
					(Mbr#3) and Wayne "Big Oly" Oldendorph (Mbr#4) decided to sample hand-crafted, full-bodied
					beers from local micro breweries in the San Diego, California, area. After multiple
					thirst-quenching stops, our boys ended up at the Ballast Point Brewing Company near the
					University of San Diego campus. It was there that a kegerator, on display for sale, caught
					the guys' interest. The thought emerged ... Wouldn't it be cool if we could enjoy a cold,
					hand-crafted, micro-brewed beer without the hassle of traveling off of the "Rock?"
				</p>

				<p>
					Since great ideas require intense thought and discussion, our brew crew adjourned to the
					VFW bar in Coronado, CA for further liquid refreshment. At the "V" the team agreed to form
					a beer club. Bones would be the "capital" man -- he'd purchase a kegerator and allow his
					garage to be used for micro brew-beer-sampling sessions. Other Club members would purchase
					kegs of beer, as required. Having established the basic charter for the club, the guys
					then adjourned to the Little Club bar, in Coronado, to celebrate their brilliant thoughts
					and begin the membership campaign.
				</p>

				<p>
					Our man of action, Bones, purchased the kegerator just a few days later. And, on Monday,
					March 22, 2004, Old Doc delivered the first keg, Ballast Point Pale Ale. Shortly
					thereafter our fifth Founder, Rob "Crenny" Crenshaw (Mbr#5) joined in on the afternoon
					beer sampling sessions for Coronado's beer aficionados. Meeting at 4 pm, the five grew
					fond of watching Jerry Springer (not much else on the tube at that time) and discussing
					the happenings in the universe. It was here that the boys developed the motto -- "More
					Time than Money" — to reflect the retired status of most of the Beer Club's stately
					members. The founders also developed the club's membership requirement: Buy a keg of
					hand-crafted beer and you are a member.
				</p>

				<p>
					Since that fateful day in 2004, the IBC has grown from 5 to 176. More significantly, the
					IBC has collectively consumed:
				</p>

				<div class="bg-primary/10 my-4 rounded-lg p-4">
					<div class="space-y-2 text-center">
						<div class="text-primary text-2xl font-bold">3634 Gallons</div>
						<div class="text-muted-foreground space-y-1 text-sm">
							<div>equivalent to 29,078 16oz glasses</div>
							<div>or 66.09 Barrels</div>
							<div>or 8.08 Hot tubs worth of cold delicious Beer</div>
						</div>
					</div>
				</div>
			</blockquote>
		</div>

		<div class="bg-muted/50 mt-6 rounded-lg p-4">
			<p class="text-card-foreground">
				In recognition of our founders and their establishment of this august body some of our
				newest members, will now recognize the founders.
			</p>
		</div>
	</div>
</div>

<!-- Limerick Introduction -->
<div class="mb-8">
	<div class="bg-card rounded-lg border p-8 shadow-md">
		<h2 class="text-foreground mb-6 text-2xl font-bold">The Limerick Tradition</h2>

		<div class="space-y-6">
			<p class="text-card-foreground leading-relaxed">
				In recognition of our founders and their establishment of this august body, some of our
				newest members will now recognize the founders. We don't know if this was by plan,
				coincidence, or divine intervention ... but the founding of IBC is very close to the
				celebration of St. Patrick's Day, so we thought this celebration should build from that
				theme. Thus, without further ado, let it begin with a Limerick:
			</p>

			<div class="bg-primary/10 border-primary/20 rounded-lg border p-6">
				<h3 class="text-primary mb-3 font-bold">EMCEE - Intro Limerick</h3>
				<blockquote class="text-card-foreground space-y-1 font-mono text-lg">
					<div>We set off to toast our grand founders</div>
					<div>Then realized they're a bunch of pud pounders</div>
					<div class="pl-4">So we changed our course</div>
					<div class="pl-4">To an Irish roast of sorts</div>
					<div>And came up with these Limerick astounders</div>
				</blockquote>
				<div class="mt-4 text-center">
					<span class="text-primary text-xl font-bold">SLAINTE!</span>
					<p class="text-muted-foreground mt-1 text-sm">
						(shouted by all presenters in unison; hopefully the crowd will catch on)
					</p>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Limericks for Each Founder -->
<div class="mb-8 space-y-6">
	<h2 class="text-foreground text-3xl font-bold">Founder Limericks</h2>

	{#each limericks as limerick, index}
		<div class="bg-card rounded-lg border p-8 shadow-md">
			<h3 class="text-foreground mb-4 flex items-center gap-3 text-xl font-bold">
				<span
					class="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm"
					>🍺</span
				>
				Limerick to {limerick.founder} ({limerick.presenter})
			</h3>

			<div class="bg-muted/50 rounded-lg p-6">
				<blockquote class="text-card-foreground font-mono text-lg whitespace-pre-line">
					{limerick.text}
				</blockquote>

				<div class="mt-6 space-y-2">
					<div
						class="text-muted-foreground bg-background border-primary rounded border-l-4 p-3 text-sm italic"
					>
						Note: Step forward after reading and drop Founder's Bell in mug
					</div>
					<div class="text-center">
						<span class="text-primary text-xl font-bold">SLAINTE</span>
					</div>
				</div>
			</div>
		</div>
	{/each}

	<!-- Missing Limericks Note -->
	<div class="bg-muted/50 rounded-lg border border-dashed p-6">
		<h3 class="text-foreground mb-2 text-lg font-semibold">Missing Limericks</h3>
		<p class="text-muted-foreground">
			Limericks for <strong>Oly (Jason)</strong> and <strong>Doc Morton (John S)</strong> were noted
			in the original script but the text was not included.
		</p>
		<div class="text-muted-foreground mt-3 text-sm italic">
			Note: At this point, two presenters break off to light the candles and move the cake into
			position.
		</div>
	</div>
</div>

<!-- Founder's Bell Explanation -->
<div class="mb-8">
	<div class="bg-card rounded-lg border p-8 shadow-md">
		<h2 class="text-foreground mb-6 text-2xl font-bold">The Founder's Bell</h2>

		<div class="bg-primary/10 border-primary/20 rounded-lg border p-6">
			<h3 class="text-primary mb-3 font-bold">EMCEE:</h3>
			<blockquote class="text-card-foreground border-primary border-l-4 pl-4 text-lg">
				The Founder's Bell is a symbolic representation of our reverence for these fine gentlemen.
				Upon its ringing, any of the 5 newest members shall immediately present themselves to
				address the Founder's need ... or just get them a fresh pull from the keg.
			</blockquote>
		</div>
	</div>
</div>

<!-- Final Limerick & Closing -->
<div class="mb-8">
	<div class="bg-card rounded-lg border p-8 shadow-md">
		<h2 class="text-foreground mb-6 text-2xl font-bold">Final Limerick & Closing</h2>

		<div class="space-y-6">
			<div class="bg-primary/10 border-primary/20 rounded-lg border p-6">
				<h3 class="text-primary mb-3 font-bold">🍺 Final Limerick</h3>
				<blockquote class="text-card-foreground space-y-1 font-mono text-lg">
					<div>This roast has been fun and revealing</div>
					<div>But now we share our true feeling</div>
					<div class="pl-4">Without the founding five</div>
					<div class="pl-4">The IBC could not thrive</div>
					<div>And that's a life that is just not appealing</div>
				</blockquote>
			</div>

			<div class="bg-muted/50 space-y-4 rounded-lg p-6">
				<p class="text-foreground text-lg font-semibold">
					And now, please join us in a hearty round of <strong>"Happy Birthday"</strong> for the ole
					IBC!
				</p>
				<p class="text-card-foreground">
					Bring in the cake to the singing of Happy Birthday to Island Beer Club.
				</p>
				<p class="text-card-foreground">
					Closing thank you to all in attendance, invitation to join us for cake (but be sure to
					offer Founders the first pieces of cake), and remind attendees to please take one of the
					commemorative IBC Founder's Day coasters.
				</p>
			</div>
		</div>
	</div>
</div>

<!-- Cake & Closing Checklist -->
<div class="mb-8">
	<div class="bg-card rounded-lg border p-8 shadow-md">
		<h2 class="text-foreground mb-6 flex items-center gap-3 text-2xl font-bold">
			<span
				class="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm"
				>🎂</span
			>
			Cake & Closing
		</h2>

		<ul class="space-y-3">
			<li class="flex items-center gap-3">
				<div class="border-primary h-4 w-4 rounded border-2"></div>
				<span class="text-card-foreground">Light candles and move cake into position.</span>
			</li>
			<li class="flex items-center gap-3">
				<div class="border-primary h-4 w-4 rounded border-2"></div>
				<span class="text-card-foreground">Final limerick & ringing of the Founder's Bell.</span>
			</li>
			<li class="flex items-center gap-3">
				<div class="border-primary h-4 w-4 rounded border-2"></div>
				<span class="text-card-foreground">Sing Happy Birthday.</span>
			</li>
			<li class="flex items-center gap-3">
				<div class="border-primary h-4 w-4 rounded border-2"></div>
				<span class="text-card-foreground">Invite to cake and coasters (Founders first!).</span>
			</li>
		</ul>

		<div class="mt-6 text-center">
			<span class="text-primary text-2xl font-bold">FINEX.</span>
		</div>
	</div>
</div>

<!-- Back Navigation -->
<div class="text-center">
	<Button variant="outline">
		<a href="/founders-day">← Back to Founders Day</a>
	</Button>
</div>
