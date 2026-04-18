<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import {
		formatKegCreditsForDisplay,
		isJeffWilkensFounderKegCredit
	} from "$lib/stats-keg-credits-display.js";
	import type { PageData } from "./$types.js";

	const { data }: { data: PageData } = $props();

	function fmtNum(n: number, digits = 1) {
		if (!Number.isFinite(n)) return "—";
		return n.toLocaleString("en-US", { maximumFractionDigits: digits });
	}

	function fmtDate(d: Date | null) {
		if (!d) return "—";
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			timeZone: "UTC"
		}).format(d);
	}
</script>

<svelte:head>
	<title>IBC Stats | Island Beer Club</title>
	<meta
		name="description"
		content="Keg credits and beer consumed since inception — Island Beer Club."
	/>
</svelte:head>

<section class="w-full space-y-10 py-10 md:py-14">
	<header class="space-y-3">
		<h1 class="text-foreground text-3xl font-bold tracking-tight md:text-4xl">IBC Keg Credits &amp; Consumption</h1>
		<p class="text-muted-foreground max-w-3xl text-pretty text-sm leading-relaxed md:text-base">
			Legacy data from the original club stats page: keg credits (who&apos;s up next) and every keg
			consumed since 22 March 2004. <span class="text-foreground font-medium">CIK</span> = credits in
			kind.
		</p>
	</header>

	<Card.Root>
		<Card.Header>
			<Card.Title>Totals (from keg list)</Card.Title>
			<Card.Description>Computed from the beer-consumed table.</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div class="bg-muted/30 rounded-lg border p-4">
					<p class="text-muted-foreground text-xs font-medium uppercase">US gallons</p>
					<p class="text-foreground text-xl font-semibold tabular-nums">{fmtNum(data.totals.totalGallons, 2)}</p>
				</div>
				<div class="bg-muted/30 rounded-lg border p-4">
					<p class="text-muted-foreground text-xs font-medium uppercase">16 oz “pint” glasses</p>
					<p class="text-foreground text-xl font-semibold tabular-nums">
						{fmtNum(data.totals.totalPintGlasses16oz, 1)}
					</p>
				</div>
				<div class="bg-muted/30 rounded-lg border p-4">
					<p class="text-muted-foreground text-xs font-medium uppercase">55 gal barrels</p>
					<p class="text-foreground text-xl font-semibold tabular-nums">
						{fmtNum(data.totals.totalBarrels55Gal, 4)}
					</p>
				</div>
				<div class="bg-muted/30 rounded-lg border p-4">
					<p class="text-muted-foreground text-xs font-medium uppercase">450 gal hot tubs</p>
					<p class="text-foreground text-xl font-semibold tabular-nums">
						{fmtNum(data.totals.sixPersonHotTubs450Gal, 4)}
					</p>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Keg credits since inception</Card.Title>
			<Card.Description>
				Lower rank buys next. Pony keg = 1 credit, full keg = 2 credits.
			</Card.Description>
		</Card.Header>
		<Card.Content class="p-0 sm:p-6">
			{#if data.credits.length === 0}
				<p class="text-muted-foreground px-6 py-8 text-center text-sm">No credit rows yet.</p>
			{:else}
				<ScrollArea class="h-[min(28rem,70vh)] w-full rounded-md border">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-24">Rank</Table.Head>
								<Table.Head>Member</Table.Head>
								<Table.Head class="w-20 text-right">MBR</Table.Head>
								<Table.Head class="w-32 text-right">Credits</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.credits as row (row.id)}
								<Table.Row>
									<Table.Cell class="tabular-nums">{row.sort_order}</Table.Cell>
									<Table.Cell class="whitespace-normal">{row.member_label}</Table.Cell>
									<Table.Cell class="text-right tabular-nums text-muted-foreground">
										{row.member_number ?? "—"}
									</Table.Cell>
									<Table.Cell class="text-right">
										<span
											class={isJeffWilkensFounderKegCredit(row) ? '' : 'tabular-nums'}
										>{formatKegCreditsForDisplay(row)}</span>
										{#if row.is_cik}
											<Badge variant="secondary" class="ml-2">CIK</Badge>
										{/if}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</ScrollArea>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Beer consumed since inception</Card.Title>
			<Card.Description>One row per keg: dates, gallons, and beer name.</Card.Description>
		</Card.Header>
		<Card.Content class="p-0 sm:p-6">
			{#if data.beerRows.length === 0}
				<p class="text-muted-foreground px-6 py-8 text-center text-sm">No consumption rows yet.</p>
			{:else}
				<ScrollArea class="h-[min(28rem,70vh)] w-full rounded-md border">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-20">Keg #</Table.Head>
								<Table.Head class="min-w-[7rem]">Purchased</Table.Head>
								<Table.Head class="min-w-[7rem]">Delivered</Table.Head>
								<Table.Head class="min-w-[7rem]">Finished</Table.Head>
								<Table.Head class="w-24 text-right">Gallons</Table.Head>
								<Table.Head>Beer</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.beerRows as row (row.id)}
								<Table.Row>
									<Table.Cell class="tabular-nums">{row.keg_number}</Table.Cell>
									<Table.Cell class="text-sm">{fmtDate(row.purchased_on)}</Table.Cell>
									<Table.Cell class="text-sm">{fmtDate(row.delivered_on)}</Table.Cell>
									<Table.Cell class="text-sm">{fmtDate(row.finished_on)}</Table.Cell>
									<Table.Cell class="text-right tabular-nums">{row.gallons}</Table.Cell>
									<Table.Cell class="max-w-[18rem] whitespace-normal text-sm">{row.beer_name ?? "—"}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</ScrollArea>
			{/if}
		</Card.Content>
	</Card.Root>
</section>
