<script lang="ts">
	import { page } from "$app/state";
	import { cn } from "$lib/utils.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import {
		formatKegCreditsForDisplay,
		isJeffWilkensFounderKegCredit
	} from "$lib/stats-keg-credits-display.js";
	import { statsPublicMemberLabel } from "$lib/stats-public-privacy.js";
	import type { PageData } from "./$types.js";

	const { data }: { data: PageData } = $props();

	const viewer = $derived(page.data.user);

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

	/** Month, day, year only (no time). */
	function fmtSnapshotDateOnly(iso: string) {
		const d = new Date(iso);
		if (!Number.isFinite(d.getTime())) return iso;
		return new Intl.DateTimeFormat(undefined, {
			year: "numeric",
			month: "long",
			day: "numeric"
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

<section
	class={cn(
		"w-full space-y-10",
		viewer
			? "max-w-6xl py-4 md:py-6 xl:max-w-none"
			: "max-w-4xl py-10 md:py-14"
	)}
>
	<header class="space-y-3">
		<h1 class="text-foreground text-3xl font-bold tracking-tight md:text-4xl">IBC Keg Credits &amp; Consumption</h1>
		<p class="text-muted-foreground max-w-3xl text-pretty text-sm leading-relaxed md:text-base">
			Legacy data from the original club stats page: keg credits and every keg consumed since 22 March
			2004. This page is served from a
			<span class="text-foreground font-medium">static snapshot</span>
			(export from the club database). The next keg is bought by whoever has the
			<span class="text-foreground font-medium">lowest credits</span>
			among members not marked deceased in that export.
			<span class="text-foreground font-medium">CIK</span>
			= credits in kind. Member names omit surnames.
		</p>
	</header>

	<Card.Root>
		<Card.Header class="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
			<div class="min-w-0 flex-1 space-y-1.5">
				<Card.Title>Totals (from keg list)</Card.Title>
				<Card.Description>Computed from the beer-consumed table in the snapshot.</Card.Description>
			</div>
			<div
				class="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3"
				role="status"
			>
				{#if data.snapshotExportedAt}
					<p class="text-muted-foreground text-right text-xs leading-snug sm:text-sm">
						<span class="text-foreground font-medium">Snapshot</span>
						<span class="text-muted-foreground/80"> · </span>
						<time datetime={data.snapshotExportedAt} class="text-foreground font-medium">
							{fmtSnapshotDateOnly(data.snapshotExportedAt)}
						</time>
					</p>
				{/if}
				{#if !viewer}
					<Button href="/login" size="sm" variant="secondary">Sign in</Button>
				{/if}
			</div>
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

	<Card.Root id="keg-credits-section" class="scroll-mt-24">
		<Card.Header>
			<Card.Title>Keg credits since inception</Card.Title>
			<Card.Description>
				Pony keg = 1 credit, full keg = 2 credits. The
				<span class="text-foreground font-medium">rank</span>
				column is legacy sort order. Showing the top and bottom five ranks (or everyone if there are 10
				or fewer rows). Deceased members may still appear in the table but are not counted for the next
				purchase.
			</Card.Description>
		</Card.Header>
		<Card.Content class="p-0 sm:p-6">
			{#if data.kegCreditsDisplay.mode === "all"}
				{#if data.kegCreditsDisplay.rows.length === 0}
					<p class="text-muted-foreground px-6 py-8 text-center text-sm">No credit rows yet.</p>
				{:else}
					<div class="rounded-md border">
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
								{#each data.kegCreditsDisplay.rows as row (row.id)}
									<Table.Row>
										<Table.Cell class="tabular-nums">{row.sort_order}</Table.Cell>
										<Table.Cell class="whitespace-normal">
											{statsPublicMemberLabel(row.member_label)}
										</Table.Cell>
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
					</div>
				{/if}
			{:else}
				<div class="space-y-8 px-0 sm:px-0">
					<div class="space-y-2">
						<h3 class="text-foreground px-6 text-sm font-semibold sm:px-0">Top 5 by rank</h3>
						<div class="rounded-md border">
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
									{#each data.kegCreditsDisplay.top as row (row.id)}
										<Table.Row>
											<Table.Cell class="tabular-nums">{row.sort_order}</Table.Cell>
											<Table.Cell class="whitespace-normal">
												{statsPublicMemberLabel(row.member_label)}
											</Table.Cell>
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
						</div>
					</div>
					<div class="space-y-2">
						<h3 class="text-foreground px-6 text-sm font-semibold sm:px-0">Bottom 5 by rank</h3>
						<div class="rounded-md border">
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
									{#each data.kegCreditsDisplay.bottom as row (row.id)}
										<Table.Row>
											<Table.Cell class="tabular-nums">{row.sort_order}</Table.Cell>
											<Table.Cell class="whitespace-normal">
												{statsPublicMemberLabel(row.member_label)}
											</Table.Cell>
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
						</div>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root id="beer-consumed-section" class="scroll-mt-24">
		<Card.Header>
			<Card.Title>Beer consumed since inception</Card.Title>
			<Card.Description>
				One row per keg: dates, gallons, and beer name. Showing the three most recent kegs (highest keg
				numbers). Totals above still include every keg in the list.
			</Card.Description>
		</Card.Header>
		<Card.Content class="p-0 sm:p-6">
			{#if data.beerPreview.length === 0}
				<p class="text-muted-foreground px-6 py-8 text-center text-sm">No consumption rows yet.</p>
			{:else}
				<div class="rounded-md border">
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
							{#each data.beerPreview as row (row.id)}
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
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</section>
