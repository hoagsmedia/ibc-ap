<script lang="ts">
	import { page } from "$app/state";
	import * as Table from "$lib/components/ui/table/index.js";
	import * as Pagination from "$lib/components/ui/pagination/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import Avatar from "$lib/components/Avatar.svelte";
	import { ArrowLeft, ChevronRightIcon, ChevronLeftIcon } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Search } from "@lucide/svelte";
	import { dev } from "$app/environment";
	import { goto } from "$app/navigation";
	import type { PageProps } from "./$types";
	import { IsMobile } from "$lib/hooks/is-mobile.svelte";
	import { cn } from "$lib/utils";
	import { LocalStorage } from "$lib/utils/local-storage.svelte";

	let { data }: PageProps = $props();

	// --- LocalStorage for caching search results ---
	interface CachedMemberData {
		members: (typeof data & { isAuthenticated: true })["members"];
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
	let searchTerm = $state(data.isAuthenticated ? data.searchTerm || "" : "");
	let members = $state(data.isAuthenticated ? data.members : []);
	let pagination = $state<PaginationData>(
		data.isAuthenticated
			? data.pagination
			: { page: 1, perPage: 10, totalCount: 0, totalPages: 0 }
	);
	const pageData = $state(page);
	const isAdmin = $derived(pageData.data.user?.role === "admin");
	const isMobile = new IsMobile();
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

	function isCacheValid(timestamp: number): boolean {
		return Date.now() - timestamp < CACHE_EXPIRY;
	}

	function getCachedResults(searchKey: string): CachedMemberData | null {
		if (dev) console.log("Checking cache for:", searchKey);
		const cache = memberCache.value || {};
		const cached = cache[searchKey];
		if (cached && isCacheValid(cached.timestamp)) {
			return cached;
		}
		return null;
	}

	function cacheResults(
		searchKey: string,
		members: CachedMemberData["members"],
		searchTerm: string,
		totalCount: number
	): void {
		const cache = memberCache.value || {};
		memberCache.value = {
			...cache,
			[searchKey]: {
				members,
				searchTerm,
				timestamp: Date.now(),
				totalCount
			}
		};
	}

	async function performSearch(term: string, pageNum: number = 1): Promise<void> {
		if (!data.isAuthenticated) return;
		const searchKey = `${term}-${pageNum}-${pagination.perPage}`;

		const cached = getCachedResults(searchKey);
		if (cached && cached.members.length > 0) {
			if (dev) console.log("Using cached results for:", searchKey);
			members = cached.members;
			pagination = {
				...pagination,
				page: pageNum,
				totalCount: cached.totalCount,
				totalPages: Math.ceil(cached.totalCount / pagination.perPage)
			};
			return;
		}

		if (dev) console.log("Fetching from server for:", searchKey);
		navigateToServer(pageNum);
	}

	function navigateToServer(page: number): void {
		const params = new URLSearchParams();
		params.set("page", page.toString());
		params.set("perPage", pagination.perPage.toString());
		if (searchTerm) {
			params.set("search", searchTerm);
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

	function handlePageChange(newPage: number): void {
		performSearch(searchTerm, newPage);
	}

	function handleSearch(): void {
		if (searchTimeout) clearTimeout(searchTimeout);

		searchTimeout = setTimeout(() => {
			performSearch(searchTerm, 1);
		}, 1000);
	}

	$effect(() => {
		if (!data.isAuthenticated) return;

		if (!("cached" in data) || (!data.cached && data.members.length > 0)) {
			if (dev) console.log("[Effect]:Processing server data:", data);
			const searchKey = `${data.searchTerm}-${data.pagination.page}-${data.pagination.perPage}`;
			cacheResults(searchKey, data.members, data.searchTerm, data.pagination.totalCount);
		}

		if (!("cached" in data) || !data.cached) {
			if (dev) console.log("[Effect]:Updating members and pagination");
			members = data.members;
			pagination = data.pagination;
		}
	});
</script>

<svelte:head>
	<title>Member Directory | Island Beer Club</title>
	<meta
		name="description"
		content={data.isAuthenticated
			? "Island Beer Club member directory for signed-in members."
			: "Island Beer Club roster snapshot. Sign in for more if you're a member."}
	/>
</svelte:head>

<div class="container py-8 md:w-full">
	{#if !data.isAuthenticated}
		<div class="mb-8 flex flex-col gap-2">
			<h1 class="text-3xl font-bold">Members</h1>
			<p class="text-muted-foreground max-w-2xl text-pretty">
				A quick snapshot of the club roster. Extra detail for members is behind sign-in.
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

		<Card.Root class="border-primary/30 bg-muted/30">
			<Card.Header>
				<Card.Title>Already a member?</Card.Title>
				<Card.Description>
					Sign in with your club account to see what's available to members.
				</Card.Description>
			</Card.Header>
			<Card.Footer class="gap-2">
				<Button href="/login">Sign in</Button>
				<Button variant="outline" href="/">Back to home</Button>
			</Card.Footer>
		</Card.Root>
	{:else}
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
					{#if members.length === 0}
						<Table.Row>
							<Table.Cell class="py-6 text-center">
								{searchTerm ? "No members found for your search" : "No members found"}
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each members as member (member.id)}
							<Table.Row>
								<Table.Cell>
									<Avatar
										class="size-8"
										name={member.name}
										img={member.img ?? undefined}
										dops={member.dops ?? undefined}
									/>
								</Table.Cell>
								<Table.Cell>
									<a
										href={`/members/${member.username ?? member.id}`}
										class="text-foreground font-medium underline-offset-4 hover:text-primary hover:underline"
									>
										{member.name || "N/A"}
									</a>
								</Table.Cell>
								<Table.Cell class={cn("", isMobile.current && "text-center")}
									>{member.mbr || "N/A"}</Table.Cell
								>
								{#if !isMobile.current}
									<Table.Cell>{member.email ?? member.username ?? "N/A"}</Table.Cell>
								{/if}
								<Table.Cell class="text-end">
									{#if isAdmin}
										<div class="flex flex-wrap items-center justify-end gap-1">
											<Button
												variant="ghost"
												size="sm"
												href={`/members/${member.username ?? member.id}`}
											>
												View
											</Button>
											<Button
												variant="ghost"
												size="sm"
												href={`/members/${member.username ?? member.id}/edit`}
											>
												Edit
											</Button>
										</div>
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
				count={pagination.totalCount}
				perPage={pagination.perPage}
				page={pagination.page}
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
								disabled={currentPage === pagination.totalPages}
							>
								<span class="hidden sm:block">Next</span>
								<ChevronRightIcon class="size-4" />
							</Pagination.NextButton>
						</Pagination.Item>
					</Pagination.Content>
				{/snippet}
			</Pagination.Root>
		</div>
	{/if}
</div>
