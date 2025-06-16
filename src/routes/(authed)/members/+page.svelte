<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Input } from '$lib/components/ui/input';
	import { generateUsername } from '$lib/utils';
	import { SearchIcon, ArrowUpIcon, ArrowDownIcon } from '@lucide/svelte/icons';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchInput = $state(data.search);
	let searchTimeout: NodeJS.Timeout;

	// Handle search with debouncing
	function handleSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			const url = new URL($page.url);
			if (searchInput) {
				url.searchParams.set('search', searchInput);
			} else {
				url.searchParams.delete('search');
			}
			url.searchParams.set('page', '1'); // Reset to first page on search
			goto(url.toString());
		}, 300);
	}

	// Handle pagination
	let currentPage = $state(data.pagination.currentPage);

	// Watch for page changes and navigate
	$effect(() => {
		if (currentPage !== data.pagination.currentPage) {
			const url = new URL($page.url);
			url.searchParams.set('page', currentPage.toString());
			goto(url.toString());
		}
	});

	// Update currentPage when data changes (from URL navigation)
	$effect(() => {
		currentPage = data.pagination.currentPage;
	});

	// Handle sorting
	function handleSort(column: string) {
		const url = new URL($page.url);
		const currentSort = data.sortBy;
		const currentOrder = data.sortOrder;

		if (currentSort === column) {
			// Toggle order if same column
			url.searchParams.set('order', currentOrder === 'asc' ? 'desc' : 'asc');
		} else {
			// New column, default to ascending
			url.searchParams.set('sort', column);
			url.searchParams.set('order', 'asc');
		}

		goto(url.toString());
	}

	// Get sort icon for column
	function getSortIcon(column: string) {
		if (data.sortBy !== column) return null;
		return data.sortOrder === 'asc' ? ArrowUpIcon : ArrowDownIcon;
	}

	// Format date helper
	function formatDate(date: Date | string | null) {
		if (!date) return 'N/A';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString();
	}

	// Format member number
	function formatMemberNumber(mbr: number | null) {
		return mbr ? `#${mbr}` : 'N/A';
	}
</script>

<svelte:head>
	<title>Member Directory | Island Beer Club</title>
	<meta name="description" content="Island Beer Club member directory - Admin access only" />
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-foreground text-3xl font-bold">Member Directory</h1>
			<p class="text-muted-foreground">Manage and view all Island Beer Club members</p>
		</div>
		<div class="text-muted-foreground text-sm">
			Total: {data.pagination.totalItems} members
		</div>
	</div>

	<!-- Search Bar -->
	<div class="flex items-center space-x-4">
		<div class="relative max-w-sm flex-1">
			<SearchIcon class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
			<Input
				type="text"
				placeholder="Search members..."
				class="pl-10"
				bind:value={searchInput}
				oninput={handleSearch}
			/>
		</div>
		{#if data.search}
			<Button
				variant="outline"
				onclick={() => {
					searchInput = '';
					handleSearch();
				}}
			>
				Clear
			</Button>
		{/if}
	</div>

	<!-- Members Table -->
	<div class="rounded-md border">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="bg-muted/50 border-b">
						<th class="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
							Photo
						</th>
						<th class="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
							<button
								class="hover:text-foreground flex items-center gap-1"
								onclick={() => handleSort('name')}
							>
								Name
								{#if getSortIcon('name')}
									{@const SortIcon = getSortIcon('name')}
									<SortIcon class="size-4" />
								{/if}
							</button>
						</th>
						<th class="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
							<button
								class="hover:text-foreground flex items-center gap-1"
								onclick={() => handleSort('email')}
							>
								Email
								{#if getSortIcon('email')}
									{@const SortIcon = getSortIcon('email')}
									<SortIcon class="size-4" />
								{/if}
							</button>
						</th>
						<th class="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
							<button
								class="hover:text-foreground flex items-center gap-1"
								onclick={() => handleSort('role')}
							>
								Role
								{#if getSortIcon('role')}
									{@const SortIcon = getSortIcon('role')}
									<SortIcon class="size-4" />
								{/if}
							</button>
						</th>
						<th class="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
							<button
								class="hover:text-foreground flex items-center gap-1"
								onclick={() => handleSort('mbr')}
							>
								Member #
								{#if getSortIcon('mbr')}
									{@const SortIcon = getSortIcon('mbr')}
									<SortIcon class="size-4" />
								{/if}
							</button>
						</th>
						<th class="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
							Phone
						</th>
						<th class="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
							Member Since
						</th>
						<th class="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
							Test Status
						</th>
						<th class="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
							<button
								class="hover:text-foreground flex items-center gap-1"
								onclick={() => handleSort('created_at')}
							>
								Joined
								{#if getSortIcon('created_at')}
									{@const SortIcon = getSortIcon('created_at')}
									<SortIcon class="size-4" />
								{/if}
							</button>
						</th>
					</tr>
				</thead>
				<tbody>
					{#each data.members as member}
						<tr class="hover:bg-muted/50 border-b transition-colors">
							<td class="p-4 align-middle">
								<Avatar.Root class="size-10">
									{#if member.img}
										<Avatar.Image src={member.img} alt={member.name} />
									{/if}
									<Avatar.Fallback>{generateUsername(member.name)}</Avatar.Fallback>
								</Avatar.Root>
							</td>
							<td class="p-4 align-middle font-medium">
								{member.name}
							</td>
							<td class="text-muted-foreground p-4 align-middle">
								{member.email}
							</td>
							<td class="p-4 align-middle">
								<span
									class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize {member.role ===
									'admin'
										? 'bg-red-100 text-red-800'
										: member.role === 'member'
											? 'bg-green-100 text-green-800'
											: 'bg-gray-100 text-gray-800'}"
								>
									{member.role}
								</span>
							</td>
							<td class="text-muted-foreground p-4 align-middle">
								{formatMemberNumber(member.mbr)}
							</td>
							<td class="text-muted-foreground p-4 align-middle">
								{member.phone || 'N/A'}
							</td>
							<td class="text-muted-foreground p-4 align-middle">
								{formatDate(member.msd)}
							</td>
							<td class="p-4 align-middle">
								{#if member.test_passed}
									<span
										class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
									>
										Passed
									</span>
								{:else}
									<span
										class="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800"
									>
										Pending
									</span>
								{/if}
							</td>
							<td class="text-muted-foreground p-4 align-middle">
								{formatDate(member.created_at)}
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="9" class="p-8 text-center text-muted-foreground">
								{#if data.search}
									No members found matching "{data.search}"
								{:else}
									No members found
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Pagination -->
	{#if data.pagination.totalPages > 1}
		<div class="flex items-center justify-between">
			<div class="text-muted-foreground text-sm">
				Showing {(data.pagination.currentPage - 1) * data.pagination.itemsPerPage + 1} to
				{Math.min(
					data.pagination.currentPage * data.pagination.itemsPerPage,
					data.pagination.totalItems
				)} of
				{data.pagination.totalItems} results
			</div>

			<Pagination.Root
				count={data.pagination.totalItems}
				perPage={data.pagination.itemsPerPage}
				bind:page={currentPage}
			>
				{#snippet children({ pages, currentPage: activePage })}
					<Pagination.Content>
						<Pagination.Item>
							<Pagination.PrevButton />
						</Pagination.Item>
						{#each pages as page (page.key)}
							{#if page.type === 'ellipsis'}
								<Pagination.Item>
									<Pagination.Ellipsis />
								</Pagination.Item>
							{:else}
								<Pagination.Item>
									<Pagination.Link {page} isActive={activePage === page.value}>
										{page.value}
									</Pagination.Link>
								</Pagination.Item>
							{/if}
						{/each}
						<Pagination.Item>
							<Pagination.NextButton />
						</Pagination.Item>
					</Pagination.Content>
				{/snippet}
			</Pagination.Root>
		</div>
	{/if}
</div>
