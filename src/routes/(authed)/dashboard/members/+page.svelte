<script lang="ts">
	import { page } from "$app/state";
	import * as Table from "$lib/components/ui/table/index.js";
	import * as Pagination from "$lib/components/ui/pagination/index.js";
	import Avatar from "$lib/components/Avatar.svelte";
	import {
		ArrowLeft,
		ChevronRightIcon,
		ChevronLeftIcon,
		Eye,
		Pencil,
		UserPlus
	} from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import HubBackLink from "$lib/components/HubBackLink.svelte";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Search } from "@lucide/svelte";
	import { goto } from "$app/navigation";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	type MemberRow = PageProps["data"]["members"][number];
	type PaginationData = PageProps["data"]["pagination"];

	const members = $derived.by((): MemberRow[] => data.members);
	const pagination = $derived.by((): PaginationData => data.pagination);
	const urlSearchTerm = $derived(data.searchTerm ?? "");

	// eslint-disable-next-line svelte/prefer-writable-derived -- draft must reset from URL on navigation; writable $derived fights intentional typing vs server search param.
	let searchTerm = $state("");

	$effect.pre(() => {
		searchTerm = urlSearchTerm;
	});

	const isAdmin = $derived(page.data.user?.role === "admin");
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

	function memberRowHref(memberId: string): string {
		return isAdmin ? `/members/${memberId}/edit` : `/members/${memberId}`;
	}

	function goToMemberRow(memberId: string): void {
		void goto(memberRowHref(memberId));
	}

	function memberRowKeydown(e: KeyboardEvent, memberId: string): void {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			goToMemberRow(memberId);
		}
	}

	function navigateToServer(pageNum: number): void {
		const params = new URLSearchParams();
		params.set("page", pageNum.toString());
		params.set("perPage", pagination.perPage.toString());
		if (searchTerm.trim()) {
			params.set("search", searchTerm.trim());
		}
		const nextQuery = params.toString();
		const currentQuery = page.url.searchParams.toString();
		if (nextQuery === currentQuery) return;

		void goto(`/dashboard/members?${nextQuery}`, {
			keepFocus: true,
			noScroll: true,
			replaceState: true
		});
	}

	function handlePageChange(newPage: number): void {
		navigateToServer(newPage);
	}

	function handleSearch(): void {
		if (searchTimeout) clearTimeout(searchTimeout);

		searchTimeout = setTimeout(() => {
			navigateToServer(1);
		}, 300);
	}

	$effect(() => {
		return () => {
			if (searchTimeout) clearTimeout(searchTimeout);
		};
	});
</script>

<svelte:head>
	<title>Member directory | Island Beer Club</title>
	<meta
		name="description"
		content="Search the Island Beer Club member directory (signed-in members)."
	/>
</svelte:head>

<div class="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6 max-md:overflow-x-clip md:w-full">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div class="min-w-0">
			<h1 class="text-3xl font-bold">Member directory</h1>
			<p class="text-muted-foreground text-sm">
				{pagination.totalCount} member{pagination.totalCount === 1
					? ""
					: "s"}{#if pagination.totalPages > 1}
					· page {pagination.page} of {pagination.totalPages}{/if}
			</p>
		</div>
		<div class="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-center">
			{#if isAdmin}
				<Button href="/dashboard/members/create" size="sm" class="gap-2">
					<UserPlus class="size-4" />
					Add member
				</Button>
			{/if}
			<HubBackLink href="/dashboard" size="sm" class="gap-2">
				<ArrowLeft class="size-4" />
				Back to Dashboard
			</HubBackLink>
		</div>
	</div>

	<div class="flex min-w-0 items-center gap-2">
		<div class="relative min-w-0 flex-1">
			<Search
				class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
			/>
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

	<div class="hub-members-table-host ibc-hub-surface overflow-hidden max-md:px-3 md:px-0">
		<Table.Root
			class="hub-member-sep-table border-separate border-spacing-0 [&_tbody>tr]:border-b-0 [&_thead>tr]:border-b-0"
		>
			<Table.Header>
				<Table.Row>
					<Table.Head
						class="w-14 max-md:w-[4.75rem] max-md:max-w-[4.75rem] max-md:min-w-[4.75rem] max-md:px-2 max-md:text-center md:text-left"
						>Profile</Table.Head
					>
					<Table.Head class="min-w-0 max-md:w-auto md:min-w-[10rem]">Name</Table.Head>
					<Table.Head
						class="w-24 text-center max-md:w-[7.25rem] max-md:max-w-[7.25rem] max-md:min-w-[7.25rem] max-md:px-1.5 md:w-24 md:max-w-none md:px-2 md:text-left"
						>Member #</Table.Head
					>
					<Table.Head class="hidden min-w-[12rem] md:table-cell">Email</Table.Head>
					<Table.Head
						class="w-10 shrink-0 px-1 text-center max-md:w-[3rem] max-md:max-w-[3.25rem] max-md:min-w-[3rem] max-md:px-2 lg:w-12"
						scope="col"
					>
						<span class="sr-only">{isAdmin ? "Edit member" : "View member"}</span>
					</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if members.length === 0}
					<Table.Row class="border-b-0">
						<Table.Cell class="py-6 text-center text-sm" colspan={5}>
							{searchTerm ? "No members found for your search" : "No members found"}
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each members as member (member.id)}
						<Table.Row
							class="group focus-visible:ring-ring cursor-pointer focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none"
							role="link"
							tabindex={0}
							aria-label={isAdmin
								? `Edit member ${member.name || "member"}`
								: `View member ${member.name || "member"}`}
							onclick={() => goToMemberRow(member.id)}
							onkeydown={(e) => memberRowKeydown(e, member.id)}
						>
							<Table.Cell
								class="relative z-0 max-md:w-[4.75rem] max-md:max-w-[4.75rem] max-md:min-w-[4.75rem] max-md:px-2 max-md:text-center"
							>
								<div class="flex justify-center">
									<Avatar
										class="size-8"
										name={member.name}
										img={member.img ?? undefined}
										dops={member.dops ?? undefined}
									/>
								</div>
							</Table.Cell>
							<Table.Cell class="relative z-0 min-w-0 text-sm max-md:pr-1">
								<span class="text-foreground font-medium break-words">{member.name || "N/A"}</span>
							</Table.Cell>
							<Table.Cell
								class="relative z-0 text-center text-sm tabular-nums max-md:w-[7.25rem] max-md:max-w-[7.25rem] max-md:min-w-[7.25rem] max-md:px-1.5 md:w-auto md:max-w-none md:px-2 md:text-left"
								>{member.mbr || "N/A"}</Table.Cell
							>
							<Table.Cell class="relative z-0 hidden text-sm md:table-cell"
								>{member.email ?? member.username ?? "N/A"}</Table.Cell
							>
							<Table.Cell
								class="relative z-0 shrink-0 px-1 text-center align-middle max-md:w-[3rem] max-md:max-w-[3.25rem] max-md:min-w-[3rem] max-md:px-0.5"
							>
								<span
									class="text-muted-foreground max-lg:border-border/80 max-lg:bg-background max-lg:text-foreground pointer-events-none mx-auto inline-flex
										items-center justify-center opacity-100 transition-opacity max-lg:h-10 max-lg:w-10 max-lg:rounded-lg max-lg:border
										max-lg:shadow-sm lg:h-auto lg:w-auto lg:rounded-none lg:border-0 lg:bg-transparent
										lg:shadow-none
										lg:[@media(hover:hover)_and_(pointer:fine)]:opacity-0
										lg:[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100"
									aria-hidden="true"
								>
									{#if isAdmin}
										<Pencil class="size-4 shrink-0" />
									{:else}
										<Eye class="size-4 shrink-0" />
									{/if}
								</span>
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<div class="mt-6 flex min-w-0 items-center justify-center">
		<Pagination.Root
			class="max-w-full min-w-0 justify-center"
			count={pagination.totalCount}
			perPage={pagination.perPage}
			page={pagination.page}
		>
			{#snippet children({ pages, currentPage })}
				<Pagination.Content class="max-w-full flex-wrap justify-center gap-y-2">
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

<style>
	/*
		Inset horizontal row dividers on cells (not on <tr>).
		`position: relative` + ::before on table rows breaks column alignment in Chromium/WebKit.
	*/
	:global(.hub-member-sep-table thead th),
	:global(.hub-member-sep-table tbody td) {
		position: relative;
		border-bottom-width: 0;
	}

	:global(.hub-member-sep-table thead > tr > th:nth-child(1)::after),
	:global(.hub-member-sep-table tbody > tr > td:nth-child(1)::after) {
		content: "";
		position: absolute;
		pointer-events: none;
		bottom: 0;
		left: 2.5rem;
		right: 0;
		height: 1px;
		background: color-mix(in oklch, var(--border) 55%, transparent);
	}

	:global(.hub-member-sep-table thead > tr > th:nth-child(2)::after),
	:global(.hub-member-sep-table thead > tr > th:nth-child(3)::after),
	:global(.hub-member-sep-table thead > tr > th:nth-child(4)::after),
	:global(.hub-member-sep-table tbody > tr > td:nth-child(2)::after),
	:global(.hub-member-sep-table tbody > tr > td:nth-child(3)::after),
	:global(.hub-member-sep-table tbody > tr > td:nth-child(4)::after) {
		content: "";
		position: absolute;
		pointer-events: none;
		bottom: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: color-mix(in oklch, var(--border) 55%, transparent);
	}

	:global(.hub-member-sep-table thead > tr > th:nth-child(5)::after),
	:global(.hub-member-sep-table tbody > tr > td:nth-child(5)::after) {
		content: "";
		position: absolute;
		pointer-events: none;
		bottom: 0;
		left: 0;
		right: 2.5rem;
		height: 1px;
		background: color-mix(in oklch, var(--border) 55%, transparent);
	}

	:global(.hub-member-sep-table tbody > tr:last-child > td::after) {
		display: none;
	}

	:global(.hub-member-sep-table tbody > tr:only-child > td:only-child::after) {
		display: none;
	}

	@media (max-width: 767px) {
		:global(.hub-members-table-host [data-slot="table-container"]) {
			overflow-x: clip;
		}

		:global(.hub-member-sep-table) {
			table-layout: fixed;
			width: 100%;
		}

		:global(.hub-member-sep-table th),
		:global(.hub-member-sep-table td) {
			white-space: normal;
			word-break: break-word;
		}

		:global(.hub-member-sep-table thead > tr > th:nth-child(3)) {
			white-space: nowrap;
		}

		/* Let the name column take all space not used by fixed-width profile / # / action. */
		:global(.hub-member-sep-table thead > tr > th:nth-child(2)),
		:global(.hub-member-sep-table tbody > tr > td:nth-child(2)) {
			width: auto;
			min-width: 0;
		}

		:global(.hub-member-sep-table thead > tr > th:nth-child(1)::after),
		:global(.hub-member-sep-table tbody > tr > td:nth-child(1)::after) {
			left: 0.5rem;
		}

		:global(.hub-member-sep-table thead > tr > th:nth-child(5)::after),
		:global(.hub-member-sep-table tbody > tr > td:nth-child(5)::after) {
			right: 0.5rem;
		}
	}
</style>
