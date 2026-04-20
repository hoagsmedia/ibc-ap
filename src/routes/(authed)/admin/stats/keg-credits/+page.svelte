<script lang="ts">
	import { enhance } from "$app/forms";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import HubBackLink from "$lib/components/HubBackLink.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import { ArrowLeft, Plus, Trash2, Pencil, Loader2 } from "@lucide/svelte";
	import {
		formatKegCreditsForDisplay,
		isJeffWilkensFounderKegCredit
	} from "$lib/stats-keg-credits-display.js";
	import type { PageData } from "./$types.js";

	const { data }: { data: PageData } = $props();

	let rowToDelete = $state<string | null>(null);
	let deleteLoading = $state(false);

	function pageHref(p: number) {
		return p <= 1 ? "/admin/stats/keg-credits" : `/admin/stats/keg-credits?page=${p}`;
	}
</script>

<svelte:head>
	<title>Keg credits (admin) | IBC</title>
</svelte:head>

<div class="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div class="min-w-0">
			<h1 class="text-3xl font-bold">Keg credits</h1>
			<p class="text-muted-foreground text-sm">{data.total} rows · page {data.page} of {data.totalPages}</p>
		</div>
		<div class="flex flex-wrap items-center justify-end gap-2">
			<HubBackLink href="/admin/stats" size="sm" class="gap-2 shrink-0">
				<ArrowLeft class="h-4 w-4" />
				Club stats
			</HubBackLink>
			<Button href="/admin/stats/keg-credits/create" class="gap-2">
				<Plus class="h-4 w-4" />
				Add row
			</Button>
		</div>
	</div>

	<div class="ibc-hub-surface overflow-hidden">
		<Table.Root class="border-separate border-spacing-0">
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-20">Rank</Table.Head>
					<Table.Head class="min-w-[12rem]">Member</Table.Head>
					<Table.Head class="w-16 text-right">MBR</Table.Head>
					<Table.Head class="w-28 text-right">Credits</Table.Head>
					<Table.Head class="w-20">CIK</Table.Head>
					<Table.Head
						class="sticky right-0 z-30 w-28 border-l border-border/60 bg-card/90 text-right shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.12)] backdrop-blur-sm dark:bg-card/80 dark:shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.35)]"
					>
						Actions
					</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.rows as row (row.id)}
					<Table.Row class="group">
						<Table.Cell class="tabular-nums">{row.sort_order}</Table.Cell>
						<Table.Cell class="max-w-md whitespace-normal text-sm">{row.member_label}</Table.Cell>
						<Table.Cell class="text-right text-sm tabular-nums text-muted-foreground">
							{row.member_number ?? "—"}
						</Table.Cell>
						<Table.Cell class="text-right text-sm">
							<span
								class={isJeffWilkensFounderKegCredit(row) ? "" : "tabular-nums"}
							>{formatKegCreditsForDisplay(row)}</span>
						</Table.Cell>
						<Table.Cell class="text-sm">
							{#if row.is_cik}
								<Badge variant="secondary">CIK</Badge>
							{:else}
								—
							{/if}
						</Table.Cell>
						<Table.Cell
							class="group-hover:bg-muted/50 sticky right-0 z-20 w-28 border-l border-border/60 bg-card/90 text-right shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-colors dark:bg-card/80 dark:shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.35)]"
						>
							<div class="flex justify-end gap-1">
								<Button variant="outline" size="icon" href="/admin/stats/keg-credits/{row.id}/edit" title="Edit">
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
				<Dialog.Title>Delete keg credit row</Dialog.Title>
				<Dialog.Description>
					{#if deleteRow}
						Are you sure you want to delete the row for
						<span class="font-medium text-foreground">{deleteRow.member_label}</span>
						(rank {deleteRow.sort_order})? This cannot be undone.
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
