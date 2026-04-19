<script lang="ts">
	import { enhance } from "$app/forms";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import HubBackLink from "$lib/components/HubBackLink.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import { ArrowLeft, Plus, Trash2, Pencil, Loader2 } from "@lucide/svelte";
	import type { PageData } from "./$types.js";

	const { data }: { data: PageData } = $props();

	let rowToDelete = $state<string | null>(null);
	let deleteLoading = $state(false);

	function pageHref(p: number) {
		return p <= 1 ? "/admin/stats/beer-consumed" : `/admin/stats/beer-consumed?page=${p}`;
	}

	function fmtShort(d: Date | null) {
		if (!d) return "—";
		return new Intl.DateTimeFormat("en-US", {
			month: "2-digit",
			day: "2-digit",
			year: "2-digit",
			timeZone: "UTC"
		}).format(d);
	}

	function beerDisplay(name: string | null): { label: string; title: string | undefined } {
		if (!name) return { label: "—", title: undefined };
		if (name.length <= 25) return { label: name, title: undefined };
		return { label: `${name.slice(0, 25)}…`, title: name };
	}
</script>

<svelte:head>
	<title>Beer consumed (admin) | IBC</title>
</svelte:head>

<div class="container mx-auto max-w-6xl py-8">
	<HubBackLink href="/admin/stats" class="mb-4 gap-2">
		<ArrowLeft class="h-4 w-4" />
		Club stats
	</HubBackLink>
	<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold">Beer consumed</h1>
			<p class="text-muted-foreground text-sm">{data.total} rows · page {data.page} of {data.totalPages}</p>
		</div>
		<Button href="/admin/stats/beer-consumed/create" class="gap-2">
			<Plus class="h-4 w-4" />
			Add keg row
		</Button>
	</div>

	<div class="ibc-hub-surface overflow-hidden">
		<Table.Root class="border-separate border-spacing-0">
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-20">Keg</Table.Head>
					<Table.Head class="min-w-[7rem]">Purchased</Table.Head>
					<Table.Head class="hidden min-w-[7rem] md:table-cell">Delivered</Table.Head>
					<Table.Head class="min-w-[7rem]">Finished</Table.Head>
					<Table.Head class="w-24 text-right">Gal</Table.Head>
					<Table.Head class="min-w-[12rem]">Beer</Table.Head>
					<Table.Head
						class="sticky right-0 z-30 w-28 border-l border-border/60 bg-card/90 text-right shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.12)] backdrop-blur-sm dark:bg-card/80 dark:shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.35)]"
					>
						Actions
					</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.rows as row (row.id)}
					{@const beer = beerDisplay(row.beer_name)}
					<Table.Row class="group">
						<Table.Cell class="tabular-nums">{row.keg_number}</Table.Cell>
						<Table.Cell class="text-sm tabular-nums">{fmtShort(row.purchased_on)}</Table.Cell>
						<Table.Cell class="hidden text-sm tabular-nums md:table-cell">{fmtShort(row.delivered_on)}</Table.Cell>
						<Table.Cell class="text-sm tabular-nums">{fmtShort(row.finished_on)}</Table.Cell>
						<Table.Cell class="text-right tabular-nums">{row.gallons}</Table.Cell>
						<Table.Cell class="text-sm" title={beer.title}>{beer.label}</Table.Cell>
						<Table.Cell
							class="group-hover:bg-muted/50 sticky right-0 z-20 w-28 border-l border-border/60 bg-card/90 text-right shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-colors dark:bg-card/80 dark:shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.35)]"
						>
							<div class="flex justify-end gap-1">
								<Button variant="outline" size="icon" href="/admin/stats/beer-consumed/{row.id}/edit" title="Edit">
									<Pencil class="h-4 w-4" />
								</Button>
								<Button
									variant="outline"
									size="icon"
									type="button"
									title="Delete"
									aria-label="Delete row"
									onclick={() => (rowToDelete = row.id)}
								>
									<Trash2 class="text-destructive h-4 w-4" />
								</Button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	{#if data.totalPages > 1}
		<nav class="mt-6 flex flex-wrap items-center justify-center gap-2">
			{#if data.page > 1}
				<Button variant="outline" href={pageHref(data.page - 1)}>Previous</Button>
			{/if}
			<span class="text-muted-foreground text-sm">Page {data.page}</span>
			{#if data.page < data.totalPages}
				<Button variant="outline" href={pageHref(data.page + 1)}>Next</Button>
			{/if}
		</nav>
	{/if}
</div>

{#if rowToDelete}
	{@const deleteRow = data.rows.find((r) => r.id === rowToDelete)}
	<Dialog.Root open={true} onOpenChange={() => (rowToDelete = null)}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Delete keg row</Dialog.Title>
				<Dialog.Description>
					{#if deleteRow}
						Are you sure you want to delete
						{#if deleteRow.beer_name?.trim()}
							<span class="font-medium text-foreground">“{deleteRow.beer_name.trim()}”</span>
							(keg {deleteRow.keg_number})
						{:else}
							keg row <span class="font-medium text-foreground">#{deleteRow.keg_number}</span>
						{/if}
						? This cannot be undone.
					{:else}
						Are you sure you want to delete this row? This cannot be undone.
					{/if}
				</Dialog.Description>
			</Dialog.Header>
			<div class="flex justify-end gap-3 pt-6">
				<Button variant="outline" onclick={() => (rowToDelete = null)} disabled={deleteLoading}>
					Cancel
				</Button>
				<form
					method="POST"
					action="?/delete"
					class="inline"
					use:enhance={() => {
						deleteLoading = true;
						return async ({ update }) => {
							try {
								await update();
							} finally {
								deleteLoading = false;
							}
							rowToDelete = null;
						};
					}}
				>
					<input type="hidden" name="id" value={rowToDelete} />
					<Button type="submit" variant="destructive" class="gap-1" disabled={deleteLoading}>
						{#if deleteLoading}
							<Loader2 class="h-3 w-3 animate-spin" />
							Deleting…
						{:else}
							Delete row
						{/if}
					</Button>
				</form>
			</div>
		</Dialog.Content>
	</Dialog.Root>
{/if}
