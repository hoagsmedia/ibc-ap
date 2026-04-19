<script lang="ts">
	import { page } from "$app/state";
	import * as Table from "$lib/components/ui/table/index.js";
	import * as Pagination from "$lib/components/ui/pagination/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import Avatar from "$lib/components/Avatar.svelte";
	import { ArrowLeft, ChevronRightIcon, ChevronLeftIcon, Eye, Pencil } from "@lucide/svelte";
	import HubBackLink from "$lib/components/HubBackLink.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Search } from "@lucide/svelte";
	import { goto } from "$app/navigation";
	import { untrack } from "svelte";
	import type { PageProps } from "./$types";
	import { LocalStorage } from "$lib/utils/local-storage.svelte";

	let { data }: PageProps = $props();

	type AuthData = Extract<PageProps["data"], { isAuthenticated: true }>;
	type MemberRow = AuthData["members"][number];

	// --- LocalStorage for caching search results ---
	interface CachedMemberData {
		members: AuthData["members"];
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
	const MAX_CACHE_KEYS = 24;

	const emptyPagination = (): PaginationData => ({
		page: 1,
		perPage: 10,
		totalCount: 0,
		totalPages: 0
	});

	/** Client-only hit from localStorage (no navigation). */
	let cacheHit = $state<{ members: AuthData["members"]; pagination: PaginationData } | null>(null);
	/**
	 * Last full server payload; when the server returns the `cached` stub (empty body), keep showing this
	 * so the sheet matches pre-navigation behavior.
	 */
	let rosterFallback = $state<{ members: AuthData["members"]; pagination: PaginationData } | null>(null);

	const isStubLoad = $derived(
		Boolean(data.isAuthenticated && "cached" in data && data.cached === true)
	);

	const members = $derived.by((): MemberRow[] => {
		if (!data.isAuthenticated) return [];
		if (cacheHit) return cacheHit.members;
		if (isStubLoad && rosterFallback) return rosterFallback.members;
		return data.members;
	});

	const pagination = $derived.by((): PaginationData => {
		if (!data.isAuthenticated) return emptyPagination();
		if (cacheHit) return cacheHit.pagination;
		if (isStubLoad && rosterFallback) return rosterFallback.pagination;
		return data.pagination;
	});

	const urlSearchTerm = $derived(data.isAuthenticated ? (data.searchTerm ?? "") : "");

	/** Draft search box; kept in sync with the URL when `data.searchTerm` changes (navigation), not while typing. */
	let searchTerm = $state("");

	$effect.pre(() => {
		searchTerm = urlSearchTerm;
	});

	const isAdmin = $derived(page.data.user?.role === "admin");
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

	/** Avoids redundant cacheResults when the same server payload is applied more than once. */
	let lastServerFingerprint = "";

	function isCacheValid(timestamp: number): boolean {
		return Date.now() - timestamp < CACHE_EXPIRY;
	}

	function getCachedResults(searchKey: string): CachedMemberData | null {
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
		const next: Record<string, CachedMemberData> = {
			...cache,
			[searchKey]: {
				members,
				searchTerm,
				timestamp: Date.now(),
				totalCount
			}
		};
		const keys = Object.keys(next);
		if (keys.length > MAX_CACHE_KEYS) {
			const drop = keys
				.map((k) => ({ k, t: next[k]!.timestamp }))
				.sort((a, b) => a.t - b.t)
				.slice(0, keys.length - MAX_CACHE_KEYS);
			for (const { k } of drop) delete next[k];
		}
		memberCache.value = next;
	}

	async function performSearch(term: string, pageNum: number = 1): Promise<void> {
		if (!data.isAuthenticated) return;
		const perPage = pagination.perPage;
		const searchKey = `${term}-${pageNum}-${perPage}`;

		const cached = getCachedResults(searchKey);
		if (cached && cached.members.length > 0) {
			cacheHit = {
				members: cached.members,
				pagination: {
					page: pageNum,
					perPage,
					totalCount: cached.totalCount,
					totalPages: Math.ceil(cached.totalCount / perPage)
				}
			};
			return;
		}

		navigateToServer(pageNum);
	}

	function navigateToServer(pageNum: number): void {
		const params = new URLSearchParams();
		params.set("page", pageNum.toString());
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
		}, 300);
	}

	$effect(() => {
		if (!data.isAuthenticated) {
			lastServerFingerprint = "";
			cacheHit = null;
			rosterFallback = null;
			return;
		}

		if (isStubLoad) return;

		const serverMembers = data.members;
		const serverPagination = data.pagination;
		const serverSearchTerm = data.searchTerm ?? "";
		const nextSearchKey = `${serverSearchTerm}-${serverPagination.page}-${serverPagination.perPage}`;
		const fingerprint = `${nextSearchKey}|${serverPagination.totalCount}|${serverMembers.map((m) => m.id).join(",")}`;

		untrack(() => {
			rosterFallback = { members: serverMembers, pagination: serverPagination };
			cacheHit = null;

			if (fingerprint !== lastServerFingerprint) {
				lastServerFingerprint = fingerprint;
				cacheResults(
					nextSearchKey,
					serverMembers,
					serverSearchTerm,
					serverPagination.totalCount
				);
			}
		});
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

{#if !data.isAuthenticated}
	<div class="container py-8 md:w-full">
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
	</div>
{:else}
	<div class="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6 md:w-full">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div class="min-w-0">
				<h1 class="text-3xl font-bold">Members</h1>
				<p class="text-muted-foreground text-sm">
					{pagination.totalCount} member{pagination.totalCount === 1 ? "" : "s"}{#if pagination.totalPages > 1}
						· page {pagination.page} of {pagination.totalPages}{/if}
				</p>
			</div>
			<HubBackLink href="/dashboard" size="sm" class="shrink-0 gap-2 self-start sm:self-center">
				<ArrowLeft class="size-4" />
				Back to Dashboard
			</HubBackLink>
		</div>

		<div class="flex items-center gap-2">
			<div class="relative flex-1">
				<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
				<Input
					bind:value={searchTerm}
					oninput={handleSearch}
					type="search"
					placeholder="Search members by name, email, or member #..."
					class="border-border/60 bg-muted/30 focus-visible:ring-primary/40 h-9 pl-9 text-sm shadow-none"
					aria-label="Search members"
				/>
			</div>
		</div>

		<div class="ibc-hub-surface overflow-hidden">
			<Table.Root class="border-separate border-spacing-0">
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-14">Profile</Table.Head>
						<Table.Head class="min-w-[10rem]">Name</Table.Head>
						<Table.Head class="w-24 text-center md:text-left">Member #</Table.Head>
						<Table.Head class="hidden min-w-[12rem] md:table-cell">Email</Table.Head>
						<Table.Head
							class="sticky right-0 z-30 w-28 border-l border-border/60 bg-card/90 text-center shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.12)] backdrop-blur-sm dark:bg-card/80 dark:shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.35)]"
						>
							Actions
						</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if members.length === 0}
						<Table.Row>
							<Table.Cell class="py-6 text-center text-sm" colspan={5}>
								{searchTerm ? "No members found for your search" : "No members found"}
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each members as member (member.id)}
							<Table.Row class="group">
								<Table.Cell>
									<Avatar
										class="size-8"
										name={member.name}
										img={member.img ?? undefined}
										dops={member.dops ?? undefined}
									/>
								</Table.Cell>
								<Table.Cell class="text-sm">
									<a
										href={`/members/${member.username ?? member.id}`}
										class="text-foreground font-medium underline-offset-4 hover:text-primary hover:underline"
									>
										{member.name || "N/A"}
									</a>
								</Table.Cell>
								<Table.Cell class="text-center text-sm tabular-nums md:text-left">{member.mbr || "N/A"}</Table.Cell>
								<Table.Cell class="hidden text-sm md:table-cell"
									>{member.email ?? member.username ?? "N/A"}</Table.Cell
								>
								<Table.Cell
									class="group-hover:bg-muted/50 sticky right-0 z-20 w-28 border-l border-border/60 bg-card/90 text-center shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-colors dark:bg-card/80 dark:shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.35)]"
								>
									<div class="flex justify-center gap-1">
										{#if isAdmin}
											<Button
												variant="outline"
												size="icon"
												href={`/members/${member.username ?? member.id}/edit`}
												title="Edit"
												aria-label="Edit member"
											>
												<Pencil class="h-4 w-4" />
											</Button>
										{:else}
											<Button
												variant="outline"
												size="icon"
												href={`/members/${member.username ?? member.id}`}
												title="View"
												aria-label="View member"
											>
												<Eye class="h-4 w-4" />
											</Button>
										{/if}
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</div>

		<!-- Pagination -->
		<div class="mt-6 flex items-center justify-center">
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
						{#each pages as pageItem (pageItem.key)}
							{#if pageItem.type === "ellipsis"}
								<Pagination.Item>
									<Pagination.Ellipsis />
								</Pagination.Item>
							{:else}
								<Pagination.Item>
									<Pagination.Link
										page={pageItem}
										isActive={currentPage === pageItem.value}
										onclick={() => handlePageChange(pageItem.value)}
									>
										{pageItem.value}
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
	</div>
{/if}
