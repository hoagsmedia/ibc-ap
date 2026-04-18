<script lang="ts">
	import { enhance } from "$app/forms";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import { ArrowLeft, Plus, Trash2, Pencil } from "@lucide/svelte";
	import type { PageData } from "./$types.js";

	const { data }: { data: PageData } = $props();

	function pageHref(p: number) {
		return p <= 1 ? "/admin/stats/keg-credits" : `/admin/stats/keg-credits?page=${p}`;
	}
</script>

<svelte:head>
	<title>Keg credits (admin) | IBC</title>
</svelte:head>

<div class="container mx-auto max-w-5xl py-8">
	<Button href="/admin/stats" variant="ghost" class="mb-4 gap-2">
		<ArrowLeft class="h-4 w-4" />
		Club stats
	</Button>
	<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold">Keg credits</h1>
			<p class="text-muted-foreground text-sm">{data.total} rows · page {data.page} of {data.totalPages}</p>
		</div>
		<Button href="/admin/stats/keg-credits/create" class="gap-2">
			<Plus class="h-4 w-4" />
			Add row
		</Button>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-24">Rank</Table.Head>
					<Table.Head>Member</Table.Head>
					<Table.Head class="w-16 text-right">MBR</Table.Head>
					<Table.Head class="w-28 text-right">Credits</Table.Head>
					<Table.Head class="w-24">CIK</Table.Head>
					<Table.Head class="w-32 text-right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.rows as row (row.id)}
					<Table.Row>
						<Table.Cell class="tabular-nums">{row.sort_order}</Table.Cell>
						<Table.Cell class="max-w-md whitespace-normal">{row.member_label}</Table.Cell>
						<Table.Cell class="text-right tabular-nums text-muted-foreground">
							{row.member_number ?? "—"}
						</Table.Cell>
						<Table.Cell class="text-right tabular-nums">{row.credits}</Table.Cell>
						<Table.Cell>
							{#if row.is_cik}
								<Badge variant="secondary">CIK</Badge>
							{:else}
								—
							{/if}
						</Table.Cell>
						<Table.Cell class="text-right">
							<div class="flex justify-end gap-1">
								<Button variant="outline" size="icon" href="/admin/stats/keg-credits/{row.id}/edit" title="Edit">
									<Pencil class="h-4 w-4" />
								</Button>
								<form method="POST" action="?/delete" use:enhance>
									<input type="hidden" name="id" value={row.id} />
									<Button variant="outline" size="icon" type="submit" title="Delete">
										<Trash2 class="text-destructive h-4 w-4" />
									</Button>
								</form>
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
