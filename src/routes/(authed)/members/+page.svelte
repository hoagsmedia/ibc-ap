<script lang="ts">
	import { page } from "$app/state";
	import * as Table from "$lib/components/ui/table/index.js";
	import * as Pagination from "$lib/components/ui/pagination/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import Avatar from "$lib/components/Avatar.svelte";
	import { ArrowLeft, ChevronRightIcon, ChevronLeftIcon, EllipsisVertical } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Search } from "@lucide/svelte";
	import { goto } from "$app/navigation";
	import type { PageProps } from "./$types";
	import { IsMobile } from "$lib/hooks/is-mobile.svelte";
	import { cn } from "$lib/utils";
	import { LocalStorage } from "$lib/utils/local-storage.svelte";

	let { data }: PageProps = $props();

	// --- LocalStorage for caching search results ---
	interface CachedMemberData {
		members: typeof data.members;
		searchTerm: string;
		timestamp: number;
		totalCount: number;
	}

	interface PaginationData {
		page: number;
		perPage: number;
		totalCount: number;
		totalPages: number;
	}

	const memberCache = new LocalStorage<Record<string, CachedMemberData>>("member-search-cache", {});
	const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

	// --- Reactive State ---
	let searchTerm = $state(data.searchTerm || "");
	let currentMembers = $state<typeof data.members>(data.members);
	let currentPagination = $state<PaginationData>(data.pagination);
	const pageData = $state(page);
	const admin = $derived(pageData.data.user?.role === "admin");
	const isAuthenticated = $derived(!!admin);
	const isMobile = new IsMobile();
	// Debounce timer for search
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

	// Check if cached data is still valid
	function isCacheValid(timestamp: number): boolean {
		return Date.now() - timestamp < CACHE_EXPIRY;
	}

	// Get cached results for a search term
	function getCachedResults(searchKey: string): CachedMemberData | null {
		console.log("Checking cache for:", searchKey);
		const cache = memberCache.value || {};
		const cached = cache[searchKey];
		if (cached && isCacheValid(cached.timestamp)) {
			return cached;
		}
		return null;
	}

	// Cache search results
	function cacheResults(
		searchKey: string,
		members: typeof data.members,
		searchTerm: string,
		totalCount: number
	): void {
		const cache = memberCache.value || {};
		cache[searchKey] = {
			members,
			searchTerm,
			timestamp: Date.now(),
			totalCount
		};
		memberCache.value = cache;
	}

	// Perform search with caching
	async function performSearch(term: string, pageNum: number = 1): Promise<void> {
		const searchKey = `${term}-${pageNum}-${currentPagination.perPage}`;

		// Check cache first
		const cached = getCachedResults(searchKey);
		if (cached && cached.members.length > 0) {
			console.log("Using cached results for:", searchKey);
			currentMembers = cached.members;
			currentPagination = {
				...currentPagination,
				page: pageNum,
				totalCount: cached.totalCount,
				totalPages: Math.ceil(cached.totalCount / currentPagination.perPage)
			};
			return;
		}

		// If no cache or empty results, go to server
		console.log("Fetching from server for:", searchKey);
		navigateToServer(pageNum);
	}

	// Navigate to server (original behavior)
	function navigateToServer(page: number): void {
		const params = new URLSearchParams();
		params.set("page", page.toString());
		params.set("perPage", currentPagination.perPage.toString());
		if (searchTerm) {
			params.set("search", searchTerm);
			// Check if we have any cached results for this search
			const cacheKeys = Object.keys(memberCache.value || {});
			const hasCache = cacheKeys.some((key) => {
				const cacheData = memberCache.value![key];
				return key.startsWith(searchTerm) && cacheData && isCacheValid(cacheData.timestamp);
			});
			if (hasCache) {
				params.set("useCache", "true");
			}
		}
		goto(`?${params.toString()}`);
	}

	// Handle page change
	function handlePageChange(newPage: number): void {
		performSearch(searchTerm, newPage);
	}

	// Handle search input
	function handleSearch(): void {
		if (searchTimeout) clearTimeout(searchTimeout);

		searchTimeout = setTimeout(() => {
			performSearch(searchTerm, 1); // Reset to page 1 when searching
		}, 1000); // Reduced timeout for better UX
	}

	// Cache current results when data changes
	$effect(() => {
		// Only process server data if it's not a cached response
		if (!("cached" in data) || (!data.cached && data.members.length > 0)) {
			console.log("[Effect]:Processing server data:", data);
			const searchKey = `${data.searchTerm}-${data.pagination.page}-${data.pagination.perPage}`;
			cacheResults(searchKey, data.members, data.searchTerm, data.pagination.totalCount);
		}

		// Always update current state with fresh data
		if (!("cached" in data) || !data.cached) {
			console.log("[Effect]:Updating current members and pagination");
			currentMembers = data.members;
			currentPagination = data.pagination;
		}
	});
</script>

<svelte:head>
	<title>Member Directory | Island Beer Club</title>
	<meta name="description" content="Island Beer Club member directory - Admin access only" />
</svelte:head>
<div class="container py-8 md:w-full">
	<!-- Header with back button -->
	<div class="mb-6 flex flex-col items-center gap-4 md:flex-row">
		<Button variant="outline" size="sm" href="/dashboard" class="gap-2">
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
					<Table.Head class={cn("p-5", isMobile.current && "text-center")}>Member #</Table.Head>
					{#if !isMobile.current}
						<Table.Head>Email</Table.Head>
					{/if}
					<Table.Head class="text-end">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if currentMembers.length === 0}
					<Table.Row>
						<Table.Cell class="py-6 text-center">
							{searchTerm ? "No members found for your search" : "No members found"}
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each currentMembers as member (member.id)}
						<Table.Row>
							<Table.Cell>
								<Avatar
									class="size-8"
									name={member.name}
									img={member.img ?? undefined}
									dops={member.dops ?? undefined}
								/>
							</Table.Cell>
							<Table.Cell>{member.name || "N/A"}</Table.Cell>
							<Table.Cell class={cn("", isMobile.current && "text-center")}
								>{member.mbr || "N/A"}</Table.Cell
							>
							{#if !isMobile.current}
								<Table.Cell>{member.email ?? member.username ?? "N/A"}</Table.Cell>
							{/if}
							<Table.Cell class="text-end">
								{#if isAuthenticated && admin}
									<DropdownMenu.Root>
										<DropdownMenu.Trigger>
											<EllipsisVertical class="text-muted-foreground cursor-pointe mr-4 size-5" />
										</DropdownMenu.Trigger>
										<DropdownMenu.Content>
											<DropdownMenu.Group>
												<DropdownMenu.Label>Actions</DropdownMenu.Label>
												<DropdownMenu.Separator />
												<DropdownMenu.Item>
													<a href={`/members/${member.username ?? member.id}`}> View Profile </a>
												</DropdownMenu.Item>
												<DropdownMenu.Item>
													<a href={`/members/${member.username ?? member.id}/edit`}>
														Edit Profile
													</a>
												</DropdownMenu.Item>
											</DropdownMenu.Group>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								{:else}
									<Button
										variant="ghost"
										href={`/members/${member.username ?? member.id}`}
										size="sm">View</Button
									>
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
			count={currentPagination.totalCount}
			perPage={currentPagination.perPage}
			page={currentPagination.page}
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
						{#if page.type === "ellipsis"}
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
							disabled={currentPage === currentPagination.totalPages}
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
