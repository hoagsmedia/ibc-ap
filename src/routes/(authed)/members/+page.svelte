<script lang="ts">
	import { page } from '$app/state';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { ArrowLeft, ChevronRightIcon, ChevronLeftIcon, EllipsisVertical } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Search } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { cn, generateUsername } from '$lib/utils';

	let { data }: PageProps = $props();

	// --- Reactive State ---
	let searchTerm = $state(data.searchTerm || '');
	const pageData = $state(page);
	const admin = $derived(pageData.data.user.role === 'admin');
	const isAuthenticated = $derived(!!admin);
	const isMobile = new IsMobile();
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
			goto(
				`?page=1&perPage=${data.pagination.perPage}${
					searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''
				}`
			);
		}, 300);
	}
</script>

<svelte:head>
	<title>Member Directory | Island Beer Club</title>
	<meta name="description" content="Island Beer Club member directory - Admin access only" />
</svelte:head>
<div class="container py-8 md:w-full">
	<!-- Header with back button -->
	<div class="mb-6 flex flex-col items-center gap-4 md:flex-row">
		<Button variant="outline" size="sm" onclick={() => history.back()}>
			<ArrowLeft class="size-4" />
			Back to Dashboard
		</Button>
		<h1 class="text-3xl font-bold">Members</h1>
	</div>

	<!-- Search Bar -->
	<div class="mb-4 flex items-center gap-2">
		<div class="relative flex-1">
			<Search class="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
			<Input
				bind:value={searchTerm}
				autofocus
				oninput={handleSearch}
				type="search"
				placeholder="Search members by name, email, or member #..."
				class="pl-9"
				aria-label="Search members"
			/>
		</div>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header class="bg-muted">
				<Table.Row>
					<Table.Head>Profile</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head class={cn('p-5', isMobile.current && 'text-center')}>Member #</Table.Head>
					{#if !isMobile.current}
						<Table.Head>Email</Table.Head>
					{/if}
					<Table.Head class="text-end">Actions</Table.Head>
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
								<Avatar.Root class="size-8">
									<Avatar.Image src={member.img} alt={member.name ?? 'User Avatar'} />
									<Avatar.Fallback>{generateUsername(member.name)}</Avatar.Fallback>
								</Avatar.Root>
							</Table.Cell>
							<Table.Cell>{member.name || 'N/A'}</Table.Cell>
							<Table.Cell class={cn('', isMobile.current && 'text-center')}
								>{member.mbr || 'N/A'}</Table.Cell
							>
							{#if !isMobile.current}
								<Table.Cell>{member.email || 'N/A'}</Table.Cell>
							{/if}
							<Table.Cell class="text-end">
								{#if isAuthenticated && admin}
									<DropdownMenu.Root>
										<DropdownMenu.Trigger>
											<EllipsisVertical class="text-muted-foreground size-5 cursor-pointer" />
										</DropdownMenu.Trigger>
										<DropdownMenu.Content>
											<DropdownMenu.Group>
												<DropdownMenu.Label>Actions</DropdownMenu.Label>
												<DropdownMenu.Separator />
												<DropdownMenu.Item>
													<a href={`/members/${member.id}`}> View Profile </a>
												</DropdownMenu.Item>
												<DropdownMenu.Item>
													<a href={`/members/${member.id}/edit`}> Edit Profile </a>
												</DropdownMenu.Item>
											</DropdownMenu.Group>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								{:else}
									<Button variant="ghost" href={`/members/${member.id}`} size="sm">View</Button>
								{/if}
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
