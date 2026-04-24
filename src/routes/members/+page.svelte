<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Members | Island Beer Club</title>
	<meta
		name="description"
		content="Island Beer Club roster snapshot. Signed-in members can open the full directory in the member hub."
	/>
</svelte:head>

<div class="container py-8 md:w-full">
	<div class="mb-8 flex flex-col gap-2">
		<h1 class="text-3xl font-bold">Members</h1>
		<p class="text-muted-foreground max-w-2xl text-pretty">
			{#if data.isAuthenticated}
				A quick <strong class="text-foreground font-semibold">public-style snapshot</strong> of the club
				roster—this page does not query the database. Search, emails, and profile tools live in your
				<strong class="text-foreground font-semibold">member hub directory</strong>.
			{:else}
				A quick snapshot of the club roster. Sign in to open the searchable directory in the member hub.
			{/if}
		</p>
	</div>

	<div class="mb-10 grid gap-4 sm:grid-cols-3">
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-base">Members &amp; officers</Card.Title>
				<Card.Description>Accounts with member or admin role</Card.Description>
			</Card.Header>
			<Card.Content>
				<p class="text-3xl font-semibold tabular-nums">{data.publicStats.totalMembers}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-base">Member numbers assigned</Card.Title>
				<Card.Description>Roster entries with an IBC member #</Card.Description>
			</Card.Header>
			<Card.Content>
				<p class="text-3xl font-semibold tabular-nums">{data.publicStats.withMemberNumber}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-base">Beer knowledge on file</Card.Title>
				<Card.Description>Members who completed the club beer test</Card.Description>
			</Card.Header>
			<Card.Content>
				<p class="text-3xl font-semibold tabular-nums">{data.publicStats.withBeerTest}</p>
			</Card.Content>
		</Card.Root>
	</div>

	{#if !data.isAuthenticated}
		<Card.Root class="border-primary/30 bg-muted/30">
			<Card.Header>
				<Card.Title>Already a member?</Card.Title>
				<Card.Description>
					Sign in with your club account to open the hub and full member directory.
				</Card.Description>
			</Card.Header>
			<Card.Footer class="gap-2">
				<Button href="/login">Sign in</Button>
				<Button variant="outline" href="/">Back to home</Button>
			</Card.Footer>
		</Card.Root>
	{:else}
		<Card.Root class="border-primary/30 bg-muted/30">
			<Card.Header>
				<Card.Title>Full roster &amp; search</Card.Title>
				<Card.Description>
					Open the directory in the member hub for the live list, search, and profile links (same tools
					as before—just not on this public-style page).
				</Card.Description>
			</Card.Header>
			<Card.Footer class="flex flex-wrap gap-2">
				<Button href="/dashboard/members">Member directory</Button>
				<Button variant="outline" href="/dashboard">Dashboard</Button>
				<Button variant="outline" href="/">Main site</Button>
			</Card.Footer>
		</Card.Root>
	{/if}
</div>
