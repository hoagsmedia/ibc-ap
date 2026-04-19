<script lang="ts">
	import HubBackLink from "$lib/components/HubBackLink.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from "$lib/components/ui/card/index.js";
	import { ArrowLeft } from "@lucide/svelte";
	import Table2 from "@lucide/svelte/icons/table-2";
	import Wine from "@lucide/svelte/icons/wine";
</script>

<svelte:head>
	<title>Club stats (admin) | Island Beer Club</title>
</svelte:head>

<div class="mx-auto w-full min-w-0 max-w-3xl">
		<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
			<h1 class="min-w-0 text-3xl font-bold">Club statistics data</h1>
			<HubBackLink href="/dashboard" size="sm" class="shrink-0 gap-2">
				<ArrowLeft class="h-4 w-4" />
				Back to dashboard
			</HubBackLink>
		</div>
		<p class="text-muted-foreground mb-8">
			Edit the two legacy tables shown on the public <a class="text-primary underline" href="/stats">/stats</a> page.
		</p>
		<div class="grid gap-6 md:grid-cols-2">
		<Card class="ibc-hub-surface bg-card/50 dark:bg-card/35">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Table2 class="h-5 w-5" />
					Keg credits
				</CardTitle>
				<CardDescription>Member leaderboard &amp; CIK flags</CardDescription>
			</CardHeader>
			<CardContent>
				<Button href="/admin/stats/keg-credits" class="w-full">Manage keg credits</Button>
			</CardContent>
		</Card>
		<Card class="ibc-hub-surface bg-card/50 dark:bg-card/35">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Wine class="h-5 w-5" />
					Beer consumed
				</CardTitle>
				<CardDescription>Per-keg dates, gallons, and names</CardDescription>
			</CardHeader>
			<CardContent>
				<Button href="/admin/stats/beer-consumed" class="w-full">Manage beer consumed</Button>
			</CardContent>
		</Card>
		</div>
</div>
