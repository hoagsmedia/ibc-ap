<script lang="ts">
	import HubBackLink from "$lib/components/HubBackLink.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Chart from "$lib/components/ui/chart/index.js";
	import { ArrowLeft, ArrowRight } from "@lucide/svelte";
	import Barrel from "@lucide/svelte/icons/barrel";
	import Beer from "@lucide/svelte/icons/beer";
	import { BarChart, Text } from "layerchart";
	import type { ComponentProps } from "svelte";
	import { cubicOut } from "svelte/easing";
	import { scaleBand } from "d3-scale";
	import type { PageData } from "./$types.js";

	const { data }: { data: PageData } = $props();

	const newMembersChartConfig = {
		newMembers: { label: "New members (that MSD year)", color: "var(--chart-1)" }
	} satisfies Chart.ChartConfig;

	/** One bar per calendar year that has at least one new MSD (same buckets as the server query). */
	const newMembersBarData = $derived(
		[...data.membersJoinedByYear]
			.sort((a, b) => a.year - b.year)
			.map((r) => ({ yearLabel: String(r.year), count: r.count }))
	);
	const totalChartMembers = $derived(newMembersBarData.reduce((sum, row) => sum + row.count, 0));

	type LcTextProps = ComponentProps<typeof Text>;

	/** LayerChart grows vertical bars from the baseline on first paint (see `Bar` + `Rect` motion). */
	const newMembersBarMotion = { type: "tween" as const, duration: 700, easing: cubicOut };

	function shouldShowYearTick(yearLabel: string): boolean {
		const years = newMembersBarData.map((d) => d.yearLabel);
		const idx = years.indexOf(yearLabel);
		if (idx === -1) return false;
		if (idx === 0 || idx === years.length - 1) return true;

		const total = years.length;
		const step = total > 16 ? 3 : total > 10 ? 2 : 1;
		return idx % step === 0;
	}

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
	<title>Club stats (admin) | Island Beer Club</title>
</svelte:head>

<div class="mx-auto w-full min-w-0 max-w-4xl">
	<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
		<h1 class="min-w-0 text-3xl font-bold">Club statistics data</h1>
		<HubBackLink href="/dashboard" size="sm" class="shrink-0 gap-2">
			<ArrowLeft class="h-4 w-4" />
			Back to dashboard
		</HubBackLink>
	</div>
	<p class="text-muted-foreground mb-10 max-w-2xl text-pretty">
		Legacy tables that power the public
		<a class="text-primary font-medium underline underline-offset-2" href="/stats">/stats</a> page (static
		export). Open a dataset to view and edit every row.
	</p>

	<section
		class="border-border/80 bg-card/80 mb-10 rounded-2xl border p-6 shadow-sm dark:bg-card/40 sm:p-7"
		aria-labelledby="members-msd-bars-heading"
	>
		<div class="mb-5 flex flex-wrap items-end justify-between gap-3">
			<div>
				<h2 id="members-msd-bars-heading" class="text-foreground text-lg font-semibold tracking-tight">
					Member growth by year
				</h2>
				<p class="text-muted-foreground mt-1 max-w-2xl text-sm leading-snug">
					<span class="text-foreground font-medium">{totalChartMembers.toLocaleString("en-US")}</span>
					members shown • each bar is the number of members who joined in that year.
				</p>
			</div>
		</div>

		{#if data.membersJoinedByYear.length === 0}
			<p class="text-muted-foreground text-sm">
				No member or admin rows with a member-since date (MSD) to chart yet.
			</p>
		{:else}
			{#snippet yMembersAxisTick({ props }: { props: LcTextProps })}
				<Text
					{...props}
					value={String(props.value ?? "")
						.split(",")
						.join("")}
				/>
			{/snippet}
			{#snippet xMembersAxisTick({ props }: { props: LcTextProps })}
				<Text
					{...props}
					value={shouldShowYearTick(String(props.value ?? "")) ? String(props.value ?? "") : ""}
				/>
			{/snippet}
			<Chart.Container
				config={newMembersChartConfig}
				role="img"
				aria-label="Bar chart of new member and admin accounts per MSD calendar year"
				class="text-foreground min-h-[220px] w-full min-w-0 max-w-full px-0 pt-2 pb-6 sm:min-h-[260px]"
			>
				<BarChart
					data={newMembersBarData}
					xScale={scaleBand().padding(0.28)}
					x="yearLabel"
					y="count"
					yNice={4}
					series={[
						{
							key: "newMembers",
							label: newMembersChartConfig.newMembers.label,
							value: "count",
							color: "var(--color-newMembers)"
						}
					]}
					props={{
						bars: { motion: newMembersBarMotion },
						yAxis: { tickLabel: yMembersAxisTick },
						xAxis: {
							tickLabel: xMembersAxisTick,
							tickLabelProps: { class: "tabular-nums" }
						}
					}}
				>
					{#snippet tooltip()}
						<Chart.Tooltip
							labelFormatter={(v) =>
								typeof v === "number"
									? String(Math.round(v))
									: v instanceof Date
										? String(v.getUTCFullYear())
										: String(v)}
						/>
					{/snippet}
				</BarChart>
			</Chart.Container>
		{/if}
	</section>

	<div class="grid gap-6 lg:grid-cols-2 lg:items-stretch">
		<article
			class="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/80 shadow-sm dark:bg-card/40"
		>
			<div
				class="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/[0.12] via-transparent to-transparent dark:from-amber-400/[0.08]"
				aria-hidden="true"
			></div>
			<div class="relative flex min-h-0 flex-1 flex-col gap-5 p-6 sm:p-7">
				<div class="flex items-start gap-4">
					<div
						class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-900 dark:bg-amber-400/20 dark:text-amber-100"
					>
						<Barrel class="h-6 w-6" aria-hidden="true" />
					</div>
					<div class="min-w-0 flex-1 space-y-1">
						<h2 class="text-foreground text-lg font-semibold tracking-tight">Keg credits</h2>
						<p class="text-muted-foreground text-sm leading-snug">
							Lowest credits buys the next keg. Members marked deceased
							(<span class="text-foreground">dops</span>) are excluded. MBR on each row is matched to
							the member directory when possible.
						</p>
					</div>
				</div>

				<div class="space-y-3 text-sm">
					<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
						<span class="text-muted-foreground">On the list</span>
						<span class="text-foreground font-semibold tabular-nums">
							{data.kegWidget.totalMembers.toLocaleString("en-US")}
						</span>
					</div>
					<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
						<span class="text-muted-foreground">CIK (credits in kind)</span>
						<span class="text-foreground font-semibold tabular-nums">
							{data.kegWidget.cikCount.toLocaleString("en-US")}
						</span>
					</div>
					<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
						<span class="text-muted-foreground">Eligible for next keg</span>
						<span class="text-foreground font-semibold tabular-nums">
							{data.kegWidget.duty.eligibleCount.toLocaleString("en-US")}
						</span>
					</div>

					<div class="border-border/50 space-y-2 border-t pt-3">
						<p class="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
							Next to buy (lowest credits)
						</p>
						{#if data.kegWidget.duty.nextToBuy.length === 0}
							<p class="text-muted-foreground">None eligible</p>
						{:else}
							<ul class="space-y-2">
								{#each data.kegWidget.duty.nextToBuy as p (p.sort_order)}
									<li class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
										<span class="text-foreground min-w-0 font-medium">{p.member_label}</span>
										<span class="text-muted-foreground tabular-nums">
											{p.credits} cr · rank {p.sort_order}
										</span>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				</div>

				<Button href="/admin/stats/keg-credits" class="mt-auto w-full shrink-0 gap-2 shadow-sm" size="lg">
					Manage keg credits
					<ArrowRight class="h-4 w-4 opacity-80" />
				</Button>
			</div>
		</article>

		<article
			class="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/80 shadow-sm dark:bg-card/40"
		>
			<div
				class="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/[0.11] via-transparent to-transparent dark:from-sky-400/[0.07]"
				aria-hidden="true"
			></div>
			<div class="relative flex min-h-0 flex-1 flex-col gap-5 p-6 sm:p-7">
				<div class="flex items-start gap-4">
					<div
						class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-950 dark:bg-sky-400/20 dark:text-sky-50"
					>
						<Beer class="h-6 w-6" aria-hidden="true" />
					</div>
					<div class="min-w-0 flex-1 space-y-1">
						<h2 class="text-foreground text-lg font-semibold tracking-tight">Beer consumed</h2>
						<p class="text-muted-foreground text-sm leading-snug">
							Per-keg log — latest finished keg and all-time volume from the full table.
						</p>
					</div>
				</div>

				<div class="space-y-3 text-sm">
					<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
						<span class="text-muted-foreground">Keg rows recorded</span>
						<span class="text-foreground font-semibold tabular-nums">
							{data.beerWidget.totalKegs.toLocaleString("en-US")}
						</span>
					</div>
					<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
						<span class="text-muted-foreground">Total US gallons</span>
						<span class="text-foreground font-semibold tabular-nums">
							{fmtNum(data.beerWidget.totals.totalGallons, 2)}
						</span>
					</div>

					<div class="border-border/50 space-y-2 border-t pt-3">
						<p class="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Latest keg</p>
						{#if data.beerWidget.latestKeg}
							<div class="space-y-1">
								<p class="text-foreground font-medium leading-snug">
									<span class="tabular-nums">#{data.beerWidget.latestKeg.keg_number}</span>
									{#if data.beerWidget.latestKeg.beer_name}
										<span class="text-muted-foreground font-normal"> · </span>
										{data.beerWidget.latestKeg.beer_name}
									{/if}
								</p>
								{#if data.beerWidget.latestKeg.finished_on}
									<p class="text-muted-foreground">
										Finished {fmtDate(data.beerWidget.latestKeg.finished_on)}
									</p>
								{/if}
							</div>
						{:else}
							<p class="text-muted-foreground">No rows yet</p>
						{/if}
					</div>
				</div>

				<Button href="/admin/stats/beer-consumed" class="mt-auto w-full shrink-0 gap-2 shadow-sm" size="lg">
					Manage beer consumed
					<ArrowRight class="h-4 w-4 opacity-80" />
				</Button>
			</div>
		</article>
	</div>
</div>
