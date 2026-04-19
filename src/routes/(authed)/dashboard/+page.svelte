<script lang="ts">
	import type { PageData, ActionData } from "./$types";
	import { enhance } from "$app/forms";
	import { navigating, page } from "$app/state";
	import * as Alert from "$lib/components/ui/alert";
	import * as Card from "$lib/components/ui/card";
	import * as Table from "$lib/components/ui/table";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import { Skeleton } from "$lib/components/ui/skeleton/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import {
		Beer,
		BookUser,
		Calendar,
		CalendarDays,
		CalendarRange,
		CheckIcon,
		ClipboardList,
		ClockIcon,
		LayoutGrid,
		LinkIcon,
		Loader2,
		Package,
		Plus,
		Sparkles,
		TrendingUp,
		User,
		UserPlusIcon,
		Users
	} from "@lucide/svelte/icons";
	import { requiresIbcTest } from "$lib/ibc-test";
	import { formatDate, formatDateTime } from "$lib/utils";
	import CustomCopy from "$lib/components/Custom-Copy.svelte";

	let { data }: { data: PageData } = $props();

	let form = $derived(page.form as ActionData | null);
	let creating = $state(false);

	const engagementPct = $derived(
		data.user && data.clubStats.totalMembers > 0
			? Math.round((data.clubStats.activeMembers / data.clubStats.totalMembers) * 100)
			: 0
	);

	/** Shown while client-navigating to this page so the card doesn’t jump empty. */
	const pendingMembersCardLoading = $derived(
		navigating?.to?.url.pathname === "/dashboard"
	);

	/** Unused expired links are hidden from the list. */
	const visibleInvitations = $derived(
		(data.invitations ?? []).filter(
			(inv) =>
				Boolean(inv.used_at) || Date.now() < new Date(inv.expires_at).getTime()
		)
	);

	const canCreateInvites = $derived(
		Boolean(
			data.user &&
				!requiresIbcTest(data.user) &&
				(data.user.role === "admin" ||
					(data.user.role === "member" && data.user.mbr != null))
		)
	);

	/** Shared chrome so icon actions read clearly as buttons on dark hero cards. */
	const hubHeroActionBtnClass =
		"gap-1.5 shadow-md transition-all duration-150 hover:shadow-lg hover:brightness-105 active:translate-y-px active:brightness-95 focus-visible:ring-2 focus-visible:ring-amber-200/90 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent min-h-9 px-2.5 sm:px-3";
</script>

<svelte:head>
	<title>Dashboard | Island Beer Club</title>
	<meta name="description" content="Island Beer Club member dashboard" />
</svelte:head>

<div class="mx-auto flex max-w-[1600px] flex-col gap-8">
	{#if data.user}
		<section
			class="grid grid-cols-3 gap-2 sm:gap-4 md:gap-5"
			aria-labelledby="club-overview-heading"
		>
			<h2 id="club-overview-heading" class="sr-only">Club snapshot</h2>
			<a
				href="/members"
				class="text-foreground border-border/50 from-sidebar/25 to-card relative block min-w-0 overflow-hidden rounded-xl border bg-gradient-to-br p-3 no-underline shadow-sm outline-offset-2 transition-[border-color,box-shadow] sm:rounded-2xl sm:p-5 hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
			>
				<div class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:gap-4">
					<div class="min-w-0">
						<p
							class="text-muted-foreground text-[0.6rem] font-medium tracking-wide uppercase sm:text-xs"
						>
							Total members
						</p>
						<p
							class="text-foreground mt-1 text-xl font-bold tracking-tight tabular-nums sm:mt-2 sm:text-3xl"
						>
							{data.clubStats.totalMembers.toLocaleString()}
						</p>
						{#if data.clubStats.membersJoinedThisMonth > 0}
							<p
								class="mt-1 line-clamp-2 text-[0.65rem] leading-snug text-emerald-600 sm:mt-2 sm:text-sm sm:leading-normal dark:text-emerald-400/90"
							>
								+{data.clubStats.membersJoinedThisMonth} this month
							</p>
						{:else}
							<p
								class="text-muted-foreground mt-1 line-clamp-2 text-[0.65rem] leading-snug sm:mt-2 sm:text-sm sm:leading-normal"
							>
								None this month
							</p>
						{/if}
					</div>
					<div
						class="border-primary/45 bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg border shadow-sm sm:size-11 sm:rounded-xl"
						aria-hidden="true"
					>
						<Users class="size-4 sm:size-5" />
					</div>
				</div>
			</a>
			<a
				href={data.user.role === "admin" ? "/admin/stats/beer-consumed" : "/stats"}
				class="text-foreground border-border/50 from-sidebar/25 to-card relative block min-w-0 overflow-hidden rounded-xl border bg-gradient-to-br p-3 no-underline shadow-sm outline-offset-2 transition-[border-color,box-shadow] sm:rounded-2xl sm:p-5 hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
			>
				<div class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:gap-4">
					<div class="min-w-0">
						<p
							class="text-muted-foreground text-[0.6rem] font-medium tracking-wide uppercase sm:text-xs"
						>
							Kegs consumed
						</p>
						<p
							class="text-foreground mt-1 text-xl font-bold tracking-tight tabular-nums sm:mt-2 sm:text-3xl"
						>
							{data.clubStats.kegsConsumed.toLocaleString()}
						</p>
						{#if data.clubStats.kegsAddedThisMonth > 0}
							<p
								class="mt-1 line-clamp-2 text-[0.65rem] leading-snug text-emerald-600 sm:mt-2 sm:text-sm sm:leading-normal dark:text-emerald-400/90"
							>
								+{data.clubStats.kegsAddedThisMonth} this month
							</p>
						{:else}
							<p
								class="text-muted-foreground mt-1 line-clamp-2 text-[0.65rem] leading-snug sm:mt-2 sm:text-sm sm:leading-normal"
							>
								None this month
							</p>
						{/if}
					</div>
					<div
						class="border-primary/45 bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg border shadow-sm sm:size-11 sm:rounded-xl"
						aria-hidden="true"
					>
						<Beer class="size-4 sm:size-5" />
					</div>
				</div>
			</a>
			<a
				href="/events"
				class="text-foreground border-border/50 from-sidebar/25 to-card relative block min-w-0 overflow-hidden rounded-xl border bg-gradient-to-br p-3 no-underline shadow-sm outline-offset-2 transition-[border-color,box-shadow] sm:rounded-2xl sm:p-5 hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
			>
				<div class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:gap-4">
					<div class="min-w-0">
						<p
							class="text-muted-foreground text-[0.6rem] font-medium tracking-wide uppercase sm:text-xs"
						>
							Events this year
						</p>
						<p
							class="text-foreground mt-1 text-xl font-bold tracking-tight tabular-nums sm:mt-2 sm:text-3xl"
						>
							{data.clubStats.eventsThisYear.toLocaleString()}
						</p>
						{#if data.clubStats.eventsThisYear === 0}
							<p
								class="text-muted-foreground mt-1 line-clamp-2 text-[0.65rem] leading-snug sm:mt-2 sm:text-sm sm:leading-normal"
							>
								No events yet
							</p>
						{:else if data.clubStats.eventsThisMonth > 0}
							<p
								class="mt-1 line-clamp-2 text-[0.65rem] leading-snug text-emerald-600 sm:mt-2 sm:text-sm sm:leading-normal dark:text-emerald-400/90"
							>
								+{data.clubStats.eventsThisMonth} this month
							</p>
						{:else}
							<p
								class="text-muted-foreground mt-1 line-clamp-2 text-[0.65rem] leading-snug sm:mt-2 sm:text-sm sm:leading-normal"
							>
								None scheduled this month
							</p>
						{/if}
					</div>
					<div
						class="border-primary/45 bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg border shadow-sm sm:size-11 sm:rounded-xl"
						aria-hidden="true"
					>
						<Calendar class="size-4 sm:size-5" />
					</div>
				</div>
			</a>
		</section>
	{/if}

	<!-- Hero + insights -->
	{#if data.user}
		<section
			class="grid grid-cols-1 gap-8 lg:grid-cols-3"
			aria-labelledby="welcome-heading"
		>
			<div
				class="ibc-lounge-hero border-border/50 relative col-span-1 flex min-h-[260px] flex-col overflow-hidden rounded-2xl border shadow-md lg:col-span-2"
			>
				<div
					class="pointer-events-none absolute inset-0 z-0 bg-[url('/images/welcome-island-sunset-bg.jpg')] bg-cover bg-[position:right_center] bg-no-repeat opacity-[0.55] saturate-[1.05]"
					aria-hidden="true"
				></div>
				<div
					class="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-black/78 via-black/45 to-black/10"
					aria-hidden="true"
				></div>
				<div
					class="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/55 via-transparent to-black/25"
					aria-hidden="true"
				></div>
				<div class="relative z-10 flex flex-1 flex-col justify-between gap-8 p-6 sm:p-8 lg:min-h-[280px]">
					<div class="flex w-full flex-col gap-4 sm:gap-5">
						<div class="flex w-full items-start justify-between gap-3">
							<p
								class="text-[0.7rem] font-semibold tracking-[0.28em] text-white/80 uppercase sm:text-xs sm:tracking-[0.22em]"
							>
								Member area
							</p>
							<div
								class="flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-1.5 text-right"
							>
								<div class="flex items-baseline justify-end gap-2">
									<span
										class="text-[0.65rem] font-semibold tracking-[0.18em] text-white/55 uppercase sm:text-[0.7rem]"
									>
										Member #
									</span>
									<span
										class="text-lg font-bold tracking-tight text-white tabular-nums drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)] sm:text-xl"
									>
										{#if data.user.mbr != null}
											{data.user.mbr}
										{:else if !requiresIbcTest(data.user)}
											<span class="text-amber-200/95">Prospect</span>
										{:else}
											—
										{/if}
									</span>
								</div>
								{#if data.user.role === "admin"}
									<Badge
										class="border-amber-200/35 bg-black/35 px-2 py-0 text-[0.65rem] font-semibold text-amber-100/95 shadow-sm backdrop-blur-[2px] hover:bg-black/45"
									>
										Admin
									</Badge>
								{/if}
							</div>
						</div>
						<div class="max-w-xl space-y-4 sm:space-y-5">
							<h1
								id="welcome-heading"
								class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-4xl"
							>
								Welcome back
							</h1>
							<p
								class="text-[0.95rem] leading-relaxed text-white/82 drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)] sm:text-base"
							>
								Hello,
								<strong class="font-semibold text-white">{data.user.name}</strong>
								—<br />
								here is your Island Beer Club home base.
							</p>
						</div>
					</div>
					<div class="pt-1">
						<Button
							href="/settings"
							variant="outline"
							size="lg"
							class="border-amber-200/35 bg-black/40 text-amber-100/95 shadow-sm backdrop-blur-[2px] hover:bg-black/55 hover:text-amber-50 rounded-full px-6"
						>
							<User class="size-4 opacity-90" aria-hidden="true" />
							View Member Profile
						</Button>
					</div>
				</div>
			</div>
			<div class="grid min-w-0 grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-1 lg:gap-8">
				<Card.Root
					class="border-border/50 min-w-0 gap-3 rounded-xl border py-4 shadow-sm sm:rounded-2xl sm:gap-6 sm:py-6"
				>
					<Card.Header class="px-3 pb-2 sm:px-6">
						<div class="flex items-center gap-1.5 sm:gap-2">
							<span
								class="bg-secondary/80 text-secondary-foreground flex size-7 shrink-0 items-center justify-center rounded-md sm:size-8 sm:rounded-lg"
							>
								<TrendingUp class="size-3.5 sm:size-4" />
							</span>
							<Card.Title class="text-sm font-semibold sm:text-base">Engagement</Card.Title>
						</div>
						<Card.Description
							class="text-[0.65rem] leading-snug sm:text-sm sm:leading-normal"
						>
							Members with numbers vs total roster
						</Card.Description>
					</Card.Header>
					<Card.Content class="px-3 sm:px-6">
						<p
							class="text-foreground text-2xl font-bold tabular-nums sm:text-4xl"
						>
							{engagementPct}%
						</p>
						<p
							class="text-muted-foreground mt-1.5 line-clamp-3 text-[0.65rem] leading-snug sm:mt-2 sm:text-xs sm:leading-relaxed"
						>
							Higher means more of the club is fully onboarded with member numbers.
						</p>
					</Card.Content>
				</Card.Root>
				<Card.Root
					class="border-border/50 min-w-0 gap-3 rounded-xl border py-4 shadow-sm sm:rounded-2xl sm:gap-6 sm:py-6"
				>
					<Card.Header class="px-3 pb-2 sm:px-6">
						<div class="flex items-center gap-1.5 sm:gap-2">
							<span
								class="bg-secondary/80 text-secondary-foreground flex size-7 shrink-0 items-center justify-center rounded-md sm:size-8 sm:rounded-lg"
							>
								<Sparkles class="size-3.5 sm:size-4" />
							</span>
							<Card.Title class="text-sm font-semibold sm:text-base">Season pace</Card.Title>
						</div>
						<Card.Description
							class="text-[0.65rem] leading-snug sm:text-sm sm:leading-normal"
						>
							Events and kegs in the data snapshot
						</Card.Description>
					</Card.Header>
					<Card.Content class="px-3 sm:px-6">
						<p
							class="text-muted-foreground line-clamp-4 text-[0.62rem] leading-snug sm:line-clamp-none sm:text-sm sm:leading-relaxed"
						>
							<span class="text-foreground font-semibold tabular-nums sm:font-bold"
								>{data.clubStats.eventsThisYear}</span
							>
							{" "}
							events this year ·
							{" "}
							<span class="text-foreground font-semibold tabular-nums sm:font-bold"
								>{data.clubStats.kegsConsumed}</span
							>
							{" "}
							kegs recorded — keep the island pouring.
						</p>
					</Card.Content>
				</Card.Root>
			</div>
			<div
				class="col-span-1 grid grid-cols-1 gap-8 lg:col-span-3 lg:items-stretch {data.user.role === 'admin' ? 'lg:grid-cols-2' : ''}"
				aria-label="Prospects and invitation links"
			>
				{#if data.user.role === "admin"}
					<Card.Root
						class="ibc-lounge-hero border-border/50 border-primary/15 relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border shadow-sm lg:h-full"
						aria-labelledby="pending-heading"
					>
						<div
							class="pointer-events-none absolute inset-0 z-0 bg-[url('/images/pending-members-hop-bg.png')] bg-cover bg-[position:right_bottom] bg-no-repeat opacity-[0.55] saturate-[1.05]"
							aria-hidden="true"
						></div>
						<div
							class="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-black/78 via-black/45 to-black/10"
							aria-hidden="true"
						></div>
						<div
							class="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/55 via-transparent to-black/25"
							aria-hidden="true"
						></div>
						<div class="relative z-10 flex w-full min-w-0 flex-col gap-2 px-6">
							<div
								class="flex w-full min-w-0 flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2"
							>
								<Card.Title
									id="pending-heading"
									class="flex min-w-0 items-center gap-2 text-lg font-semibold tracking-tight text-white drop-shadow-sm dark:text-foreground"
								>
									<UserPlusIcon class="size-5 shrink-0 text-white dark:text-primary" />
									Prospects
								</Card.Title>
								<Tooltip.Root>
									<Tooltip.Trigger>
										{#snippet child({ props })}
											<Button
												{...props}
												href="/dashboard/pending-members"
												size="sm"
												variant="default"
												aria-label="Manage Prospects"
												class={hubHeroActionBtnClass}
											>
												<ClipboardList class="size-4 shrink-0" aria-hidden="true" />
												<span class="text-xs font-semibold tracking-tight">Manage</span>
											</Button>
										{/snippet}
									</Tooltip.Trigger>
									<Tooltip.Content side="bottom" align="end" sideOffset={6}>
										<p>Manage Prospects</p>
									</Tooltip.Content>
								</Tooltip.Root>
							</div>
							<Card.Description
								class="max-w-none text-pretty leading-snug text-white/88 dark:text-muted-foreground"
							>
								Prospects who passed the test but don’t have a member number yet. Manage them and assign
								member numbers.
							</Card.Description>
						</div>
						<Card.Content class="relative z-10 flex flex-1 flex-col gap-4 pt-0">
							<div>
								{#if pendingMembersCardLoading}
									<div
										class="space-y-3"
										aria-busy="true"
										aria-label="Loading Prospects"
									>
										<Skeleton class="h-4 w-36" />
										<Skeleton class="h-4 w-full max-w-md" />
										<Skeleton class="h-4 w-full max-w-[13rem]" />
										<Skeleton class="h-3 w-40" />
									</div>
								{:else if (data.pendingMembersCount ?? 0) > 0}
									<p class="text-sm text-white/82 dark:text-muted-foreground">
										<span class="font-semibold tabular-nums text-white dark:text-foreground"
											>{data.pendingMembersCount}</span
										>
										waiting for acceptance.
									</p>
									{#if data.pendingMembers && data.pendingMembers.length > 0}
										<ul class="mt-3 max-h-[7.5rem] space-y-1.5 overflow-hidden text-pretty">
											{#each data.pendingMembers as pending (pending.id)}
												<li class="truncate text-sm text-white/78 dark:text-muted-foreground">
													{pending.name}
												</li>
											{/each}
										</ul>
										{#if (data.pendingMembersCount ?? 0) > data.pendingMembers.length}
											<p class="mt-2 text-xs text-white/72 dark:text-muted-foreground">
												+{(data.pendingMembersCount ?? 0) - data.pendingMembers.length} more on the full
												list.
											</p>
										{/if}
									{/if}
								{:else}
									<p class="text-sm text-white/82 dark:text-muted-foreground">
										No Prospects right now.
									</p>
								{/if}
							</div>
						</Card.Content>
					</Card.Root>
				{/if}

				<Card.Root
					class="border-border/50 border-primary/15 relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border shadow-sm lg:h-full"
					aria-labelledby="invites-heading"
				>
					<div
						class="pointer-events-none absolute inset-0 z-0 bg-[url('/images/invitation-barrels-bg.png')] bg-cover bg-[position:85%_center] bg-no-repeat opacity-[0.55] saturate-[1.05] dark:opacity-[0.64]"
						aria-hidden="true"
					></div>
					<div
						class="ibc-invites-card-bg pointer-events-none absolute inset-0 z-[1] opacity-[0.12] dark:opacity-[0.35]"
						aria-hidden="true"
					></div>
					<div
						class="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-black/78 via-black/45 to-black/10"
						aria-hidden="true"
					></div>
					<div
						class="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/55 via-transparent to-black/25"
						aria-hidden="true"
					></div>
					<div class="relative z-10 flex w-full min-w-0 flex-col gap-2 px-6">
						<div
							class="flex w-full min-w-0 flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2"
						>
							<Card.Title
								id="invites-heading"
								class="flex min-w-0 items-center gap-2 text-lg font-semibold tracking-tight text-white drop-shadow-sm dark:text-foreground"
							>
								<LinkIcon class="size-5 shrink-0 text-white dark:text-primary" />
								Invitation links
							</Card.Title>
							{#if canCreateInvites}
								<form
									method="post"
									action="?/createInvitation"
									use:enhance={() => {
										creating = true;
										return async ({ update }) => {
											await update();
											creating = false;
										};
									}}
									class="shrink-0"
								>
									<Tooltip.Root>
										<Tooltip.Trigger type="submit" disabled={creating}>
											{#snippet child({ props })}
												<Button
													{...props}
													type="submit"
													size="sm"
													variant="default"
													class={hubHeroActionBtnClass}
													aria-busy={creating}
													aria-label={creating
														? "Creating invitation link"
														: "Create invite link"}
												>
													{#if creating}
														<Loader2 class="size-4 shrink-0 animate-spin" aria-hidden="true" />
													{:else}
														<Plus class="size-4 shrink-0" aria-hidden="true" />
													{/if}
													<span class="text-xs font-semibold tracking-tight">
														{creating ? "Creating…" : "Create"}
													</span>
												</Button>
											{/snippet}
										</Tooltip.Trigger>
										<Tooltip.Content side="bottom" align="end" sideOffset={6}>
											<p>Create invite link</p>
										</Tooltip.Content>
									</Tooltip.Root>
								</form>
							{/if}
						</div>
						<Card.Description
							class="max-w-none text-pretty leading-snug text-white/88 dark:text-muted-foreground"
						>
							Create secure, one-time signup links to invite Prospects.
						</Card.Description>
					</div>
					<Card.Content class="relative z-10 flex flex-1 flex-col p-2 md:p-6">
						{#if form?.success}
							<Alert.Root class="mb-4">
								<CheckIcon class="size-4" />
								<Alert.Title>Success!</Alert.Title>
								<Alert.Description>{form.message}</Alert.Description>
							</Alert.Root>
							{#if form.inviteUrl}
								<div class="bg-secondary/50 border-border/40 mb-4 rounded-xl border p-4">
									<p class="text-secondary-foreground mb-2 text-sm font-medium">
										Your new invitation link:
									</p>
									<div class="flex items-center gap-2">
										<code
											class="bg-muted/50 text-muted-foreground flex-1 truncate rounded-md px-2 py-1.5 text-xs"
										>
											{form.inviteUrl}
										</code>
										<CustomCopy text={form.inviteUrl} ariaLabel="Copy invitation link" />
									</div>
								</div>
							{/if}
						{:else if form?.message}
							<Alert.Root class="mb-4" variant="destructive">
								<Alert.Title>Error</Alert.Title>
								<Alert.Description>{form.message}</Alert.Description>
							</Alert.Root>
						{/if}

						<div class="space-y-4">
							{#if data.user && requiresIbcTest(data.user)}
								<Alert.Root class="mb-4" variant="destructive">
									<ClockIcon class="size-4" />
									<Alert.Title>Test required</Alert.Title>
									<Alert.Description>
										You must pass the official IBC test before you can create invitation links.
									</Alert.Description>
								</Alert.Root>
								<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
									<p class="text-sm text-white/88 dark:text-muted-foreground">
										Complete the IBC test to unlock invitations.
									</p>
									<Button class="shrink-0 shadow-md">
										<a href="/test">Take test</a>
									</Button>
								</div>
							{:else if data.user?.role !== "admin" && (data.user?.role !== "member" || data.user?.mbr == null)}
								<Alert.Root class="mb-4" variant="default">
									<ClockIcon class="size-4" />
									<Alert.Title>Prospect acceptance required</Alert.Title>
									<Alert.Description>
										You must be accepted as a member and assigned a member number before creating
										invitation links.
									</Alert.Description>
								</Alert.Root>
								<p class="text-sm text-white/88 dark:text-muted-foreground">
									An admin will review your profile after you pass the test.
								</p>
							{:else}
								<div class="mt-6 space-y-3">
									<div
										class="flex flex-row flex-wrap items-center justify-between gap-x-3 gap-y-1"
									>
										<h4
											class="text-sm font-semibold text-white drop-shadow-sm dark:text-foreground"
										>
											Invites this year
										</h4>
										<a
											href="/dashboard/invitations"
											class="text-xs font-semibold text-amber-200/95 underline-offset-4 hover:underline dark:text-primary"
										>
											View all
										</a>
									</div>
									{#if visibleInvitations.length > 0}
										<ul class="space-y-2">
											{#each visibleInvitations as invitation (invitation.token)}
												<li
													class="flex min-h-10 flex-row flex-nowrap items-center gap-2 rounded-xl border border-white/25 bg-black/25 px-3 py-2 backdrop-blur-[2px] dark:border-border/50 dark:bg-muted/15"
												>
													<div
														class="flex min-w-0 flex-1 flex-nowrap items-center gap-x-2 overflow-hidden"
													>
														<span
															class="font-mono text-xs shrink-0 text-white/92 tabular-nums dark:text-muted-foreground"
														>
															{invitation.token.slice(0, 8)}…
														</span>
														<span
															class="shrink-0 text-xs text-white/55 dark:text-muted-foreground/80"
															aria-hidden="true"
														>
															·
														</span>
														<span
															class="min-w-0 truncate text-xs text-white/78 dark:text-muted-foreground"
														>
															Created {formatDateTime(invitation.created_at)}
														</span>
													</div>
													<div class="flex shrink-0 flex-nowrap items-center gap-2">
														{#if invitation.used_at}
															<Badge variant="secondary" class="shrink-0 whitespace-nowrap">
																<CheckIcon class="mr-1 size-3" />
																Used
															</Badge>
														{:else}
															<Badge class="shrink-0 whitespace-nowrap">
																<ClockIcon class="mr-1 size-3" />
																Active
															</Badge>
															<CustomCopy
																text={`${data.baseUrl}/invite/${invitation.token}`}
																ariaLabel="Copy invitation link"
															/>
														{/if}
													</div>
												</li>
											{/each}
										</ul>
									{:else}
										<p class="text-sm text-white/78 dark:text-muted-foreground">
											No invites from {data.invitationYear} yet.
										</p>
									{/if}
								</div>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</section>
	{/if}

	<!-- Quick actions -->
	{#if data.user}
		<section aria-labelledby="actions-heading">
			<Card.Root
				class="border-border/50 from-sidebar/25 to-card flex min-h-0 min-w-0 flex-col rounded-2xl border bg-gradient-to-br shadow-sm"
				aria-labelledby="actions-heading"
			>
				<Card.Header class="flex flex-row items-center gap-3 pb-2">
					<div
						class="border-primary/45 bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-sm"
						aria-hidden="true"
					>
						<LayoutGrid class="text-primary size-5" />
					</div>
					<div class="min-w-0">
						<Card.Title id="actions-heading" class="text-foreground text-lg font-semibold tracking-tight">
							Quick actions
						</Card.Title>
						<Card.Description class="text-muted-foreground text-sm leading-snug">
							Shortcuts to common member tools
						</Card.Description>
					</div>
				</Card.Header>
				<Card.Content class="flex flex-1 flex-col gap-2">
					<Button
						href="/members"
						variant="outline"
						class="border-border/55 bg-muted/20 text-foreground hover:bg-muted/35 h-auto min-h-12 justify-start gap-3 px-3 py-2.5 font-medium shadow-sm"
					>
						<BookUser class="text-primary size-[1.15rem] shrink-0" />
						{data.user.role === "admin" ? "Manage members" : "Member directory"}
					</Button>
					{#if data.user.role === "admin"}
						<Button
							href="/admin/events"
							variant="outline"
							class="border-border/55 bg-muted/20 text-foreground hover:bg-muted/35 h-auto min-h-12 justify-start gap-3 px-3 py-2.5 font-medium shadow-sm"
						>
							<CalendarDays class="text-primary size-[1.15rem] shrink-0" />
							Manage events
						</Button>
						<Button
							href="/admin/stats/beer-consumed"
							variant="outline"
							class="border-border/55 bg-muted/20 text-foreground hover:bg-muted/35 h-auto min-h-12 justify-start gap-3 px-3 py-2.5 font-medium whitespace-normal shadow-sm"
						>
							<Beer class="text-primary size-[1.15rem] shrink-0" />
							<span class="min-w-0 text-left leading-snug">
								<span class="sm:hidden">Beer consumed</span>
								<span class="hidden sm:inline">Manage Beer Consumed</span>
							</span>
						</Button>
						<Button
							href="/admin/stats/keg-credits"
							variant="outline"
							class="border-border/55 bg-muted/20 text-foreground hover:bg-muted/35 h-auto min-h-12 justify-start gap-3 px-3 py-2.5 font-medium shadow-sm"
						>
							<Package class="text-primary size-[1.15rem] shrink-0" />
							Manage Keg Credits
						</Button>
					{:else}
						<Button
							href="/events"
							variant="outline"
							class="border-border/55 bg-muted/20 text-foreground hover:bg-muted/35 h-auto min-h-12 justify-start gap-3 px-3 py-2.5 font-medium shadow-sm"
						>
							<CalendarRange class="text-primary size-[1.15rem] shrink-0" />
							View events
						</Button>
					{/if}
				</Card.Content>
			</Card.Root>
		</section>
	{/if}

	<!-- Upcoming events -->
	{#if data.user}
		<section aria-labelledby="tables-heading">
			<h2 id="tables-heading" class="sr-only">Upcoming events</h2>
			<Card.Root
				class="ibc-lounge-hero border-border/50 relative overflow-hidden rounded-2xl border shadow-sm"
			>
				<div
					class="pointer-events-none absolute inset-0 z-0 bg-[url('/images/upcoming-events-bg.png')] bg-cover bg-[position:center_28%] bg-no-repeat opacity-[0.55] saturate-[1.05] dark:opacity-[0.58]"
					aria-hidden="true"
				></div>
				<div
					class="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-black/78 via-black/45 to-black/10"
					aria-hidden="true"
				></div>
				<div
					class="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/55 via-transparent to-black/25"
					aria-hidden="true"
				></div>
				<Card.Header class="relative z-10">
					<Card.Title
						class="text-lg font-semibold tracking-tight text-white drop-shadow-sm dark:text-foreground"
						>Upcoming events</Card.Title
					>
					<Card.Description
						class="max-w-lg text-pretty text-white/88 dark:text-muted-foreground"
					>
						Next on the club calendar
					</Card.Description>
				</Card.Header>
				<Card.Content class="relative z-10 px-0 pb-2">
					{#if data.upcomingEvents.length === 0}
						<p class="px-6 text-sm text-white/88 dark:text-muted-foreground">
							No upcoming published events.
						</p>
					{:else}
						<Table.Root>
							<Table.Header>
								<Table.Row
									class="border-white/20 bg-black/22 backdrop-blur-sm hover:bg-black/28 dark:border-border/45 dark:bg-card/45 dark:hover:bg-card/35"
								>
									<Table.Head class="text-white/82 dark:text-muted-foreground">Event</Table.Head>
									<Table.Head class="text-white/82 dark:text-muted-foreground">When</Table.Head>
									<Table.Head class="hidden text-white/82 dark:text-muted-foreground sm:table-cell"
										>Where</Table.Head
									>
									<Table.Head
										class="w-0 whitespace-nowrap text-end text-white/82 dark:text-muted-foreground"
										>Access</Table.Head
									>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each data.upcomingEvents as ev (ev.id)}
									<Table.Row
										class="border-white/15 bg-black/18 backdrop-blur-[2px] hover:bg-black/26 dark:border-border/35 dark:bg-card/25 dark:hover:bg-card/40"
									>
										<Table.Cell class="font-medium">
											<a
												href="/events"
												class="text-white transition-colors hover:text-white/95 dark:text-foreground dark:hover:text-primary"
											>
												{ev.title}
											</a>
										</Table.Cell>
										<Table.Cell
											class="text-sm tabular-nums text-white/85 dark:text-muted-foreground"
										>
											{ev.event_date ? formatDate(new Date(ev.event_date)) : "—"}
										</Table.Cell>
										<Table.Cell
											class="hidden max-w-[10rem] truncate text-sm text-white/85 dark:text-muted-foreground sm:table-cell"
										>
											{ev.location ?? "—"}
										</Table.Cell>
										<Table.Cell class="w-0 text-end align-middle">
											{#if ev.members_only}
												<Badge variant="secondary" class="shrink-0 text-[10px]">Members</Badge>
											{:else}
												<Badge
													variant="outline"
													class="shrink-0 border-white/40 bg-black/15 text-[10px] text-white/90 dark:border-border dark:bg-transparent dark:text-foreground"
												>
													Public
												</Badge>
											{/if}
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					{/if}
				</Card.Content>
			</Card.Root>
		</section>
	{/if}
</div>
