<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import {
		formatKegCreditsForDisplay,
		isJeffWilkensFounderKegCredit
	} from "$lib/stats-keg-credits-display.js";
	import { statsPublicMemberLabel } from "$lib/stats-public-privacy.js";
	import MemberHubPageHeader from "$lib/components/MemberHubPageHeader.svelte";
	import type { PageData } from "./$types.js";

	let { data }: { data: PageData } = $props();

	function fmtNum(n: number, digits = 1) {
		if (!Number.isFinite(n)) return "—";
		return n.toLocaleString("en-US", { maximumFractionDigits: digits });
	}
</script>

<svelte:head>
	<title>Keg &amp; beer stats | Island Beer Club</title>
	<meta
		name="description"
		content="Live club totals and keg credit highlights — Island Beer Club member hub."
	/>
</svelte:head>

<div class="mx-auto w-full max-w-3xl space-y-8 py-6 md:py-10">
	<MemberHubPageHeader
		title="Keg credits & beer totals"
		description="Live figures from the club database — same totals as the full stats page, with a short keg-credit summary (top and bottom ranks). Pony keg = 1 credit, full keg = 2 credits. CIK = credits in kind. Names show given names only."
	/>

	<Card.Root>
		<Card.Header class="space-y-1">
			<Card.Title class="text-lg">Totals</Card.Title>
			<Card.Description>All kegs recorded in the beer-consumed table.</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="bg-muted/30 rounded-lg border p-4">
					<p class="text-muted-foreground text-xs font-medium uppercase">US gallons</p>
					<p class="text-foreground text-xl font-semibold tabular-nums">
						{fmtNum(data.totals.totalGallons, 2)}
					</p>
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
		<Card.Header class="space-y-1">
			<Card.Title class="text-lg">Keg credits</Card.Title>
			<Card.Description>
				{#if data.kegCreditsDisplay.mode === "split"}
					Top 5 and bottom 5 by legacy rank (full roster is longer).
				{:else}
					Full list — {data.kegCreditsDisplay.rows.length}
					{data.kegCreditsDisplay.rows.length === 1 ? "member" : "members"} on the board.
				{/if}
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
										<Table.Cell class="text-muted-foreground text-right tabular-nums">
											{row.member_number ?? "—"}
										</Table.Cell>
										<Table.Cell class="text-right">
											<span class={isJeffWilkensFounderKegCredit(row) ? "" : "tabular-nums"}
												>{formatKegCreditsForDisplay(row)}</span
											>
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
											<Table.Cell class="text-muted-foreground text-right tabular-nums">
												{row.member_number ?? "—"}
											</Table.Cell>
											<Table.Cell class="text-right">
												<span class={isJeffWilkensFounderKegCredit(row) ? "" : "tabular-nums"}
													>{formatKegCreditsForDisplay(row)}</span
												>
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
											<Table.Cell class="text-muted-foreground text-right tabular-nums">
												{row.member_number ?? "—"}
											</Table.Cell>
											<Table.Cell class="text-right">
												<span class={isJeffWilkensFounderKegCredit(row) ? "" : "tabular-nums"}
													>{formatKegCreditsForDisplay(row)}</span
												>
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
</div>
