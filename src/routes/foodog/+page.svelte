<script lang="ts">
	import { Separator } from "$lib/components/ui/separator";

	const meta = {
		title: "Foo Dogs | Island Beer Club",
		description:
			"Learn about Foo Dogs (Chinese guardian lions) and their meaning for Island Beer Club. See photos and history of Foo Dogs in our club.",
		image: "/FoDog-hero.png",
		url: "https://islandbeerclub.com/foodog"
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

<section
	class="text-foreground w-full py-10 md:py-14"
	aria-labelledby="foodog-heading"
>
	<!-- Soft frame: calm without breaking the public layout shell -->
	<div
		class="border-border/60 bg-card/40 ring-border/40 rounded-3xl border px-5 py-8 shadow-sm ring-1 md:px-10 md:py-12"
	>
		<header class="mb-10 space-y-4 text-center md:mb-14">
			<p class="text-muted-foreground font-medium tracking-[0.22em] uppercase">Guardian lions</p>
			<h1
				id="foodog-heading"
				class="text-foreground text-3xl font-semibold tracking-tight text-balance md:text-4xl"
			>
				Foo Dogs
			</h1>
			<p class="text-muted-foreground mx-auto max-w-lg text-pretty text-sm leading-relaxed md:text-base">
				Also called <span class="text-foreground/90">Chinese guardian lions</span>—pairs of stone
				figures that watch over doorways, not dogs at all, despite the nickname.
			</p>
			<Separator class="bg-border/80 mx-auto max-w-[4.5rem]" />
		</header>

		<div class="space-y-12 md:space-y-16">
			<figure class="space-y-3">
				<div
					class="border-border/50 bg-muted/15 overflow-hidden rounded-2xl border shadow-[0_1px_0_0_oklch(0_0_0/0.04)]"
				>
					<img
						src="/FoDog-hero.png"
						alt="Carved stone guardian lion with calm, watchful expression"
						class="aspect-video w-full object-cover object-top md:max-h-[min(56vh,32rem)]"
						width="1024"
						height="576"
						fetchpriority="high"
					/>
				</div>
				<figcaption class="text-muted-foreground text-center text-xs leading-relaxed md:text-sm">
					One of a pair—often placed to greet visitors and mark the threshold between outside and in.
				</figcaption>
			</figure>

			<div class="grid gap-10 md:grid-cols-12 md:items-start md:gap-12">
				<div
					class="text-muted-foreground order-1 max-w-prose space-y-6 text-[0.95rem] leading-[1.75] md:order-2 md:col-span-7 md:justify-self-end"
				>
					<p>
						Foo Dogs, also known as Chinese guardian lions, are a common representation of protection in
						Chinese culture. Traditionally placed in front of palaces, temples, and homes, Foo Dogs are
						believed to ward off evil spirits and bring good fortune. Despite their name, Foo Dogs are
						actually lions, not dogs.
					</p>
					<p>
						The male Foo Dog is typically depicted with a ball under his paw, symbolizing the world or
						power, while the female often has a cub, representing nurture and the cycle of life. Foo
						Dogs are always presented in pairs, with the male on the right and the female on the left
						when facing the entrance.
					</p>
					<blockquote
						class="border-primary/25 from-muted/20 text-foreground/85 relative rounded-2xl border-l-2 bg-gradient-to-br to-transparent py-4 pr-4 pl-5 text-[0.92rem] leading-relaxed italic md:text-[0.95rem]"
					>
						In the context of Island Beer Club, Foo Dogs are a fun nod to tradition and
						protection—guarding our gatherings and ensuring good times for all. Next time you see a Foo
						Dog, give it a nod for good luck!
					</blockquote>
				</div>

				<figure class="order-2 md:order-1 md:col-span-5">
					<div
						class="border-border/50 bg-muted/15 mx-auto max-w-sm overflow-hidden rounded-xl border shadow-sm md:mx-0 md:max-w-none"
					>
						<img
							src="/FoDog2.jpg"
							alt="Second guardian lion carving, paired with the first"
							class="aspect-square w-full object-cover object-top"
							width="512"
							height="512"
							loading="lazy"
							decoding="async"
						/>
					</div>
					<figcaption class="text-muted-foreground mt-3 text-center text-xs md:text-left">
						The pair belongs together—balance of strength and nurture at the threshold.
					</figcaption>
				</figure>
			</div>
		</div>
	</div>
</section>
