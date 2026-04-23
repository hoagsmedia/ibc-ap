<script lang="ts">
	import { founders } from "$lib/data/founders";

	const meta = {
		title: "History | Island Beer Club",
		description:
			"Discover the rich history of Island Beer Club, founded in 2004 by four beer enthusiasts in Coronado, California. Learn about our founding members and evolution.",
		image: "/groupGarage.jpg",
		url: "https://islandbeerclub.com/history"
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

<section class="mx-auto max-w-4xl px-4 py-6 md:py-12">
	<div class="mb-6 text-center md:mb-12">
		<h1 class="text-foreground mb-4 text-4xl font-bold">Island Beer Club History</h1>
		<p class="text-muted-foreground text-lg">
			From humble beginnings to a thriving community of beer enthusiasts
		</p>
	</div>

	<!-- Hero Image -->

	<!-- The Founding Story -->
	<div class="space-y-4 md:space-y-8">
		<figure class="flex justify-center">
			<img
				src="/history-header.webp"
				alt="Island Beer Club history header"
				class="max-w-full rounded-md shadow-lg sm:rounded-lg"
			/>
		</figure>
		<div class="bg-card rounded-lg p-6 shadow-sm">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">The Beginning - March 2004</h2>
			<div class="text-muted-foreground space-y-4">
				<p class="text-base leading-relaxed">
					On a magnificent afternoon, <strong class="text-foreground">mid-March in 2004</strong>, the
					<strong class="text-foreground">Island Beer Club (IBC)</strong> was founded.
					<strong class="text-foreground">Jeff "Bones" Wilkens</strong> (Mbr#1),
					<strong class="text-foreground">John "Old Doc" Morton</strong> (Mbr#2),
					<strong class="text-foreground">John "Cruncher" Muncy</strong> (Mbr#3), and
					<strong class="text-foreground">Wayne "Big Oly" Oldendorph</strong> (Mbr#4) decided to sample
					hand-crafted, full-bodied beers from local microbreweries in the San Diego, California, area.
					After multiple thirst-quenching stops, our four boys ended up at the
					<strong class="text-foreground">Ballast Point Brewing Company</strong> near the
					<strong class="text-foreground">University of San Diego</strong> campus. It was there that a
					kegerator, on display for sale, caught the guys' interest. The thought emerged: "Wouldn't it be
					cool if we could enjoy a cold, hand-crafted, micro-brewed beer without the hassle of traveling
					off of the <strong class="text-foreground">'Rock'</strong>?"
				</p>
				<p class="text-base leading-relaxed">
					Since great ideas require intense thought and discussion, our four-man brew crew adjourned to the
					<strong class="text-foreground">VFW</strong> bar in Coronado, CA for further liquid refreshment.
					At the "V" the team agreed to form a beer club. Bones would be the "capital" man—he would
					purchase a kegerator and allow his garage to be used for micro brew-beer-sampling sessions.
					Other Club members would purchase kegs of beer, as required. Having established the basic
					charter for the club, the guys then adjourned to the
					<strong class="text-foreground">Little Club</strong> bar, in Coronado, to celebrate their
					brilliant thoughts and begin the membership campaign.
				</p>
				<p class="text-base leading-relaxed">
					Our man of action, Bones, purchased the kegerator just a few days later. And, on
					<strong class="text-foreground">Monday, March 22, 2004</strong>, Old Doc delivered the first
					keg, <strong class="text-foreground">Ballast Point Yellowtail Pale Ale</strong>. (The official
					test uses <strong class="text-foreground">March 22, 2004</strong> as the founding milestone.)
					Shortly thereafter, our Original Four designated
					<strong class="text-foreground">Rob "Crenny" Crenshaw</strong> Fifth Founder, who joined in on
					the afternoon beer sampling sessions for Coronado's new beer aficionados. He became
					<strong class="text-foreground">Member #5</strong> after he purchased his first keg.
				</p>
			</div>
		</div>

		<!-- Founding Members -->
		<div class="bg-card rounded-lg p-6 shadow-sm">
			<h2 class="text-foreground mb-6 text-2xl font-semibold">The Founding Five</h2>
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each founders as founder, index (founder.name)}
					<div class="space-y-3">
						<div class="flex items-center gap-3">
							<div class="relative size-12 overflow-hidden rounded-full">
								<img src="/{founder.photo}" alt={founder.name} class="size-full object-cover" />
								<div class="bg-primary/20 absolute inset-0 flex items-center justify-center"></div>
							</div>
							<div class="flex flex-1">
								<p class="text-foreground font-bold">
									#{index + 1} -
									<span class="text-muted-foreground font-light">{founder.name}</span>
								</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Early Years and Traditions -->
		<div class="bg-card rounded-lg p-6 shadow-sm">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Early Years & Traditions</h2>
			<div class="text-muted-foreground space-y-4">
				<p class="text-base leading-relaxed">
					Meeting at 4 PM, the five grew fond of watching
					<strong class="text-foreground">Jerry Springer</strong> (not much else on the tube at that time)
					and discussing the happenings in the universe. It was here that the boys developed the IBC
					motto—<strong class="text-foreground">"More Time than Money"</strong>—to reflect the retired
					status of most of the Beer Club's stately members. (The test phrases this as
					<strong class="text-foreground">"We have more time than money."</strong>) The Founders also
					developed the club's membership obligation:
					<strong class="text-foreground">Buy a keg of hand-crafted beer and you are a member.</strong>
				</p>
				<p class="text-base leading-relaxed">
					About ten months into our new Club activities, we needed to solve a problem for Jeff's
					spousal unit, Loie (aka Mrs. Bones). All this time from inception, Club members were
					allowed to visit the restroom facilities in the house. Unfortunately, those waiting
					outside for the facility to "clear" would relieve themselves in Loie's garden... This was
					intolerable.
				</p>
				<p class="text-base leading-relaxed">
					On the first anniversary of the Beer Club, the first urinal was installed. In 2013 the
					original urinal was retired and replaced with a waterless urinal. Unfortunately, nowadays,
					our meeting location may not offer a lady's restroom.
				</p>
			</div>
		</div>

		<!-- Website and Branding -->
		<div class="bg-card rounded-lg p-6 shadow-sm">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Website & Branding</h2>
			<div class="text-muted-foreground space-y-4">
				<p class="text-base leading-relaxed">
					Always alert and "forward observant" (looking to the future), Bones purchased the domain name,
					<strong class="text-foreground">www.islandbeerclub.com</strong>. He knew that it might be
					worthwhile, but he had no idea what to do with it or how it would be helpful... so we sat on it
					until July of 2006. At this point, Crenny had gained some experience in website development and
					was hosting the website for the Sea 'N Air Men's Golf Club. That was all we needed. A few pages
					were developed, and the IBC website was officially published in July 2006. This award-winning
					website is the envy of beer clubs everywhere.
				</p>
				<p class="text-base leading-relaxed">
					Signage plays a big part at the Island Beer Club. In August 2006, our alley became
					<strong class="text-foreground">"Beer Belly Blvd."</strong> A year later a permanent brass
					marker was installed commemorating the site of the IBC Headquarters. October 2007 had John
					Clampitt (Mbr#18) deliver and install a hand-crafted, kiln-fired tile plaque to identify the
					clubhouse of the IBC.
				</p>
				<p class="text-base leading-relaxed">
					John Weiman (Mbr#151), Weiman Design, designed our logo in late October 2007; allowing us
					to acquire our now highly sought after, custom apparel and glassware.
				</p>
			</div>
		</div>

		<!-- Facility Improvements -->
		<div class="bg-card rounded-lg p-6 shadow-sm">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Facility Improvements</h2>
			<div class="text-muted-foreground space-y-4">
				<p class="text-base leading-relaxed">
					In our first fourteen years of existence, we have continually improved and upgraded the
					facility to include a commercial popcorn maker (compliments of Mike Herlihy Mbr#57),
					<strong class="text-foreground">two additional beer kegerators</strong> (thanks Bones Mbr#1)—so
					<strong class="text-foreground">three kegerators in all</strong> at headquarters, counting Bones's
					original—a granite wash sink (thanks to IBC plumber Bob Ryan Mbr#120 and granite donator Ed
					Carney Mbr#58), two flame-thrower outdoor heaters and numerous beer-oriented signs.
				</p>
				<p class="text-base leading-relaxed">
					Also, the Island Beer Club banner has been on many photo ops including the top of
					<strong class="text-foreground">Kilimanjaro</strong>, 2012 Super Bowl and, a $16 million cocaine
					bust off Costa Rica. Between 2011 and 2018, we more than tripled our membership as we focused on
					recruiting beer aficionados with enough disposable income to provide a keg of hand-crafted
					beer. As of June 2020, we have <strong class="text-foreground">407 members</strong>. Since 2004,
					the club has purchased <strong class="text-foreground">more than 700</strong> kegs of
					hand-crafted beer.
				</p>
			</div>
		</div>

		<!-- Major Changes and Transitions -->
		<div class="bg-card rounded-lg p-6 shadow-sm">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Major Changes & Transitions</h2>
			<div class="text-muted-foreground space-y-4">
				<p class="text-base leading-relaxed">
					We lost Jeffery "Bones" Wilkens, Mbr#1, on 6 Jul 2019. On 7 Aug 2019, a huge turnout
					joined together in Beer Belly Blvd to recognize Jeff, celebrate his life and salute his
					passion for and contribution to the Island Beer Club. On 4 Sep 2019 IBC Headquarters, at
					851 J Ave, was retired and on the same day, we celebrated the Grand Opening of the IBC
					Clubhouse next door at 857 J Ave, Rod Neilson's (Mbr #169) house.
				</p>
				<p class="text-base leading-relaxed">
					On 18 Mar 2020, because of COVID-19 precautions, Beer Club halted weekly meetings until
					further notice. As of 23 Jun 2020, no IBC full-membership meeting has been conducted at
					the Clubhouse. Our first order of business when we resume alley-socializing is to
					celebrate Founder's Day 2020.
				</p>
			</div>
		</div>

		<!-- Timeline Highlights -->
		<div class="bg-card rounded-lg p-6 shadow-sm">
			<h2 class="text-foreground mb-6 text-2xl font-semibold">Key Milestones</h2>
			<div class="space-y-6">
				<div class="flex gap-4">
					<div class="flex-shrink-0">
						<div class="bg-primary flex size-8 items-center justify-center rounded-full">
							<div class="bg-primary-foreground size-2 rounded-full"></div>
						</div>
					</div>
					<div>
						<h3 class="text-foreground font-semibold">March 2004</h3>
						<p class="text-muted-foreground text-sm">
							<strong class="text-foreground font-medium">Island Beer Club</strong> founded; founding
							members and nicknames (for the test) are in the story above.
						</p>
					</div>
				</div>

				<div class="flex gap-4">
					<div class="flex-shrink-0">
						<div class="bg-primary flex size-8 items-center justify-center rounded-full">
							<div class="bg-primary-foreground size-2 rounded-full"></div>
						</div>
					</div>
					<div>
						<h3 class="text-foreground font-semibold">March 22, 2004</h3>
						<p class="text-muted-foreground text-sm">
							First keg: <strong class="text-foreground font-medium">Ballast Point Yellowtail Pale Ale</strong>
							—date used on the member test as the founding milestone.
						</p>
					</div>
				</div>

				<div class="flex gap-4">
					<div class="flex-shrink-0">
						<div class="bg-primary flex size-8 items-center justify-center rounded-full">
							<div class="bg-primary-foreground size-2 rounded-full"></div>
						</div>
					</div>
					<div>
						<h3 class="text-foreground font-semibold">March 2005</h3>
						<p class="text-muted-foreground text-sm">First urinal installed for club convenience</p>
					</div>
				</div>

				<div class="flex gap-4">
					<div class="flex-shrink-0">
						<div class="bg-primary flex size-8 items-center justify-center rounded-full">
							<div class="bg-primary-foreground size-2 rounded-full"></div>
						</div>
					</div>
					<div>
						<h3 class="text-foreground font-semibold">August 2006</h3>
						<p class="text-muted-foreground text-sm">Alley officially named "Beer Belly Blvd"</p>
					</div>
				</div>

				<div class="flex gap-4">
					<div class="flex-shrink-0">
						<div class="bg-primary flex size-8 items-center justify-center rounded-full">
							<div class="bg-primary-foreground size-2 rounded-full"></div>
						</div>
					</div>
					<div>
						<h3 class="text-foreground font-semibold">July 2006</h3>
						<p class="text-muted-foreground text-sm">IBC website officially published</p>
					</div>
				</div>

				<div class="flex gap-4">
					<div class="flex-shrink-0">
						<div class="bg-primary flex size-8 items-center justify-center rounded-full">
							<div class="bg-primary-foreground size-2 rounded-full"></div>
						</div>
					</div>
					<div>
						<h3 class="text-foreground font-semibold">October 2007</h3>
						<p class="text-muted-foreground text-sm">
							IBC logo designed and clubhouse plaque installed
						</p>
					</div>
				</div>

				<div class="flex gap-4">
					<div class="flex-shrink-0">
						<div class="bg-primary flex size-8 items-center justify-center rounded-full">
							<div class="bg-primary-foreground size-2 rounded-full"></div>
						</div>
					</div>
					<div>
						<h3 class="text-foreground font-semibold">2013</h3>
						<p class="text-muted-foreground text-sm">
							Original urinal replaced with waterless urinal
						</p>
					</div>
				</div>

				<div class="flex gap-4">
					<div class="flex-shrink-0">
						<div class="bg-primary flex size-8 items-center justify-center rounded-full">
							<div class="bg-primary-foreground size-2 rounded-full"></div>
						</div>
					</div>
					<div>
						<h3 class="text-foreground font-semibold">July 6, 2019</h3>
						<p class="text-muted-foreground text-sm">
							Lost Jeff "Bones" Wilkens, founding member #1
						</p>
					</div>
				</div>

				<div class="flex gap-4">
					<div class="flex-shrink-0">
						<div class="bg-primary flex size-8 items-center justify-center rounded-full">
							<div class="bg-primary-foreground size-2 rounded-full"></div>
						</div>
					</div>
					<div>
						<h3 class="text-foreground font-semibold">September 4, 2019</h3>
						<p class="text-muted-foreground text-sm">
							IBC Clubhouse moved to 857 J Ave (Rod Neilson's house)
						</p>
					</div>
				</div>

				<div class="flex gap-4">
					<div class="flex-shrink-0">
						<div class="bg-primary flex size-8 items-center justify-center rounded-full">
							<div class="bg-primary-foreground size-2 rounded-full"></div>
						</div>
					</div>
					<div>
						<h3 class="text-foreground font-semibold">March 18, 2020</h3>
						<p class="text-muted-foreground text-sm">COVID-19 precautions halt weekly meetings</p>
					</div>
				</div>

				<div class="flex gap-4">
					<div class="flex-shrink-0">
						<div class="bg-primary flex size-8 items-center justify-center rounded-full">
							<div class="bg-primary-foreground size-2 rounded-full"></div>
						</div>
					</div>
					<div>
						<h3 class="text-foreground font-semibold">2025</h3>
						<p class="text-muted-foreground text-sm">
							Modern website launch and continued community building
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Founders Day and Meeting Schedule -->
		<div class="bg-card rounded-lg p-6 shadow-sm">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Founders Day & Meeting Schedule</h2>
			<div class="text-muted-foreground space-y-4">
				<p class="text-base leading-relaxed">
					Every March, on the Wednesday closest to March 22, we celebrate the anniversary of the
					Island Beer Club by holding a Founders Day party. This event honors the five Founders for
					creating Coronado's favorite weekly alley beer gathering.
				</p>
				<p class="text-base leading-relaxed">
					The J Ave Clubhouse now hosts Beer Club sessions at least twice a month. Other Beer Club
					sessions are at our local venues: VFW Coronado, The Little Club, Attitude Brewing Co, and
					Feast and Fareway restaurant at the Coronado Golf Course.
				</p>
				<p class="text-base leading-relaxed">
					The IBC meets every <strong class="text-foreground">Wednesday</strong> from
					<strong class="text-foreground">4 PM to 6 PM (Standard Time)</strong>;
					<strong class="text-foreground">4:30 PM to 6:30 PM (Daylight Savings Time)</strong> in the alley
					(<strong class="text-foreground">Beer Belly Blvd</strong>) on
					<strong class="text-foreground">J Avenue</strong> in Coronado as well as our "satellite"
					locations. Guests, especially ladies, are always welcome when accompanied by a Beer Club
					member. Please join us.
				</p>
			</div>
		</div>

		<!-- Legacy -->
		<div class="bg-card rounded-lg p-6 shadow-sm">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Our Legacy</h2>
			<div class="text-muted-foreground space-y-4">
				<p class="text-base leading-relaxed">
					The Island Beer Club represents more than just a gathering of beer enthusiasts. It
					embodies the spirit of community, friendship, and the appreciation for craftsmanship that
					goes into every exceptional brew. Our members have created lasting bonds over shared
					experiences and quality beer.
				</p>
				<p class="text-base leading-relaxed">
					From our humble beginnings with four friends and a kegerator to a 407-member strong
					community, we have maintained our founding principle: "More Time than Money." We continue
					to welcome Prospects who share our passion for hand-crafted beer and the camaraderie
					that comes with it.
				</p>
				<p class="text-base leading-relaxed">
					As we continue to grow and evolve, we remain committed to the founding vision: enjoying
					exceptional craft beer in great company, right here on the "Rock" we call home.
				</p>
			</div>
		</div>
	</div>
</section>
