<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Search } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let searchTerm = $state(data.searchTerm || '');

	// Debounce timer for search
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

	// Handle page change
	function handlePageChange(newPage: number) {
		goto(
			`?page=${newPage}&perPage=${data.pagination.perPage}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`
		);
	}

	// Handle search input
	function handleSearch() {
		if (searchTimeout) clearTimeout(searchTimeout);

		searchTimeout = setTimeout(() => {
			// Reset to page 1 when search changes
			goto(
				`?page=1&perPage=${data.pagination.perPage}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`
			);
		}, 300);
	}
</script>

<svelte:head>
	<title>Member Directory | Island Beer Club</title>
	<meta name="description" content="Island Beer Club member directory - Admin access only" />
</svelte:head>

<div class="container py-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Member Directory</h1>
		<div class="flex gap-2">
			<Button variant="outline">Export</Button>
			<Button>Add Member</Button>
		</div>
	</div>

	<!-- Search Bar -->
	<div class="mb-4 flex items-center gap-2">
		<div class="relative flex-1">
			<Search class="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
			<Input
				type="search"
				placeholder="Search members by name, email, or member #..."
				class="pl-9"
				bind:value={searchTerm}
				oninput={handleSearch}
			/>
		</div>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-16">Profile</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Member #</Table.Head>
					<Table.Head>Email</Table.Head>
					<Table.Head class="text-right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if data.members.length === 0}
					<Table.Row>
						<Table.Cell class="py-6 text-center">
							{searchTerm ? 'No members found for your search' : 'No members found'}
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each data.members as member (member.id)}
						<Table.Row>
							<Table.Cell>
								{#if member.img}
									<img
										src={member.img}
										alt={member.name}
										class="h-10 w-10 rounded-full object-cover"
									/>
								{:else}
									<div class="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
										<span class="text-muted-foreground">
											{member.name?.[0]?.toUpperCase() || '?'}
										</span>
									</div>
								{/if}
							</Table.Cell>
							<Table.Cell>{member.name || 'N/A'}</Table.Cell>
							<Table.Cell>{member.mbr || 'N/A'}</Table.Cell>
							<Table.Cell>{member.email || 'N/A'}</Table.Cell>
							<Table.Cell class="text-right">
								<Button variant="ghost" size="sm">View</Button>
								<Button variant="ghost" size="sm">Edit</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Pagination -->
	<div class="mt-8 flex items-center justify-center">
		<Pagination.Root
			count={data.pagination.totalCount}
			perPage={data.pagination.perPage}
			page={data.pagination.page}
		>
			{#snippet children({ pages, currentPage })}
				<Pagination.Content>
					<Pagination.Item>
						<Pagination.PrevButton
							onclick={() => handlePageChange(currentPage - 1)}
							disabled={currentPage === 1}
						>
							<ChevronLeftIcon class="size-4" />
							<span class="hidden sm:block">Previous</span>
						</Pagination.PrevButton>
					</Pagination.Item>
					{#each pages as page (page.key)}
						{#if page.type === 'ellipsis'}
							<Pagination.Item>
								<Pagination.Ellipsis />
							</Pagination.Item>
						{:else}
							<Pagination.Item>
								<Pagination.Link
									{page}
									isActive={currentPage === page.value}
									onclick={() => handlePageChange(page.value)}
								>
									{page.value}
								</Pagination.Link>
							</Pagination.Item>
						{/if}
					{/each}
					<Pagination.Item>
						<Pagination.NextButton
							onclick={() => handlePageChange(currentPage + 1)}
							disabled={currentPage === data.pagination.totalPages}
						>
							<span class="hidden sm:block">Next</span>
							<ChevronRightIcon class="size-4" />
						</Pagination.NextButton>
					</Pagination.Item>
				</Pagination.Content>
			{/snippet}
		</Pagination.Root>
	</div>
</div>
