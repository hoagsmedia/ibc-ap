<script lang="ts">
	import type { PageData } from "./$types";
	import { enhance } from "$app/forms";
	import { navigating } from "$app/state";
	import { AlertDialog } from "bits-ui";
	import * as Alert from "$lib/components/ui/alert";
	import * as Card from "$lib/components/ui/card";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Skeleton } from "$lib/components/ui/skeleton/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import { Separator } from "$lib/components/ui/separator";
	import DatePickerField from "$lib/components/DatePickerField.svelte";
	import QuickActionLink from "$lib/components/dashboard/QuickActionLink.svelte";
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
	import {
		hubCardMidWashClass,
		hubHeroActionBtnClass,
		hubHeroScrimLrClass,
		hubHeroScrimTbClass,
		hubTableColSepClass,
		inviteCopyBtnClass,
		inviteRowHighlightClass,
		inviteRowIdleClass,
		inviteRowShellClass
	} from "$lib/dashboard-hub-classes";
	import { formatDate, formatDateTime } from "$lib/utils";
	import CustomCopy from "$lib/components/Custom-Copy.svelte";

	let { data }: { data: PageData } = $props();

	let creating = $state(false);
	let highlightInviteToken = $state<string | null>(null);
	let inviteErrorOpen = $state(false);
	let inviteErrorMessage = $state("");
	let inviteCreateDialogOpen = $state(false);
	let prospectProgressDialogOpen = $state(Boolean(data.prospectGate?.active));
	let meeting1Date = $state(data.prospectGate?.meetingDates?.[0] ?? "");
	let meeting2Date = $state(data.prospectGate?.meetingDates?.[1] ?? "");
	let meeting3Date = $state(data.prospectGate?.meetingDates?.[2] ?? "");

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
	const isProspectOnboarding = $derived(Boolean(data.prospectGate?.active));
	const canAccessExclusiveFeatures = $derived(Boolean(data.canAccessExclusiveFeatures));
	const meetingsRemaining = $derived(
		data.prospectGate ? data.prospectGate.meetingsRequired - data.prospectGate.meetingCount : 0
	);

</script>

<svelte:head>
	<title>Dashboard | Island Beer Club</title>
	<meta name="description" content="Island Beer Club member dashboard" />
</svelte:head>

<div class="mx-auto flex max-w-[1600px] flex-col gap-8">
	{#if data.user && canAccessExclusiveFeatures}
		<section
			class="grid grid-cols-3 gap-2 sm:gap-4 md:gap-5"
			aria-labelledby="club-overview-heading"
		>
			<h2 id="club-overview-heading" class="sr-only">Club snapshot</h2>
			<a
				href="/dashboard/members"
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
				class="ibc-lounge-hero border-border/50 relative col-span-1 flex min-h-[260px] flex-col overflow-hidden rounded-2xl border shadow-md {data.user.role === 'admin'
					? 'lg:col-span-2'
					: 'lg:col-span-3'}"
			>
				<div
					class="pointer-events-none absolute inset-0 z-0 bg-[url('/images/welcome-island-sunset-bg.jpg')] bg-cover bg-[position:right_center] bg-no-repeat opacity-[0.55] saturate-[1.05]"
					aria-hidden="true"
				></div>
				<div class={hubHeroScrimLrClass} aria-hidden="true"></div>
				<div class={hubHeroScrimTbClass} aria-hidden="true"></div>
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
										{:else if data.user.role !== "admin" && data.user.role !== "member"}
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
			{#if data.user.role === "admin"}
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
								> events this year · <span class="text-foreground font-semibold tabular-nums sm:font-bold"
									>{data.clubStats.kegsConsumed}</span
								> kegs recorded — keep the island pouring.
							</p>
						</Card.Content>
					</Card.Root>
				</div>
			{/if}
			<div
				class="col-span-1 grid grid-cols-1 gap-8 lg:col-span-3 lg:items-stretch {data.user.role === 'admin'
					? 'lg:grid-cols-[minmax(0,35fr)_minmax(0,65fr)]'
					: ''}"
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
						<div class={hubHeroScrimLrClass} aria-hidden="true"></div>
						<div class={hubHeroScrimTbClass} aria-hidden="true"></div>
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
												<li class="truncate text-sm">
													<a
														href="/dashboard/pending-members#prospect-{pending.id}"
														class="text-white/88 underline-offset-2 transition-colors hover:text-white hover:underline dark:text-muted-foreground dark:hover:text-foreground"
													>
														{pending.name}
													</a>
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
					<div class={hubCardMidWashClass} aria-hidden="true"></div>
					<div class={hubHeroScrimLrClass} aria-hidden="true"></div>
					<div class={hubHeroScrimTbClass} aria-hidden="true"></div>
					<div class="relative z-10 flex w-full min-w-0 flex-col gap-3 px-6">
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
								<Button
									type="button"
									size="sm"
									variant="default"
									class={hubHeroActionBtnClass}
									aria-haspopup="dialog"
									aria-expanded={inviteCreateDialogOpen}
									onclick={() => {
										inviteCreateDialogOpen = true;
									}}
								>
									<Plus class="size-4 shrink-0" aria-hidden="true" />
									<span class="text-xs font-semibold tracking-tight">New invite</span>
								</Button>
							{/if}
						</div>
						{#if canCreateInvites}
							<Dialog.Root bind:open={inviteCreateDialogOpen}>
								<Dialog.Content class="sm:max-w-md">
									<Dialog.Header>
										<Dialog.Title>Create invitation</Dialog.Title>
										<Dialog.Description>
											Add a name so you remember who the link is for.
										</Dialog.Description>
									</Dialog.Header>
									<form
										method="post"
										action="?/createInvitation"
										use:enhance={() => {
											creating = true;
											return async ({ update, result }) => {
												await update({ reset: true });
												creating = false;
												if (result.type === "success") {
													inviteCreateDialogOpen = false;
													const d = result.data as { invitation?: { token?: string } } | undefined;
													const t = d?.invitation?.token;
													if (t) {
														highlightInviteToken = t;
														setTimeout(() => {
															highlightInviteToken = null;
														}, 12_000);
													}
												} else if (result.type === "failure") {
													const msg = result.data?.message;
													inviteErrorMessage =
														typeof msg === "string"
															? msg
															: "Could not create an invitation link.";
													inviteErrorOpen = true;
												}
											};
										}}
										class="flex flex-col gap-4"
									>
										<div class="flex flex-col gap-2">
											<Label for="dialog-invite-name">Who is this invite for?</Label>
											<Input
												id="dialog-invite-name"
												name="inviteName"
												type="text"
												required
												maxlength={120}
												autocomplete="off"
												placeholder="e.g. Alex Kim"
												disabled={creating}
											/>
										</div>
										<Dialog.Footer>
											<Button
												type="button"
												variant="outline"
												disabled={creating}
												onclick={() => {
													inviteCreateDialogOpen = false;
												}}
											>
												Cancel
											</Button>
											<Button type="submit" disabled={creating} class="gap-1.5">
												{#if creating}
													<Loader2 class="size-4 shrink-0 animate-spin" aria-hidden="true" />
													<span>Generating…</span>
												{:else}
													<span>Generate</span>
												{/if}
											</Button>
										</Dialog.Footer>
									</form>
								</Dialog.Content>
							</Dialog.Root>
						{/if}
						<Card.Description
							class="max-w-none text-pretty leading-snug text-white/88 dark:text-muted-foreground"
						>
							Create secure, one-time signup links to invite Prospects. Use the copy icon on active
							rows to copy a link.
						</Card.Description>
					</div>
					<Card.Content class="relative z-10 flex flex-1 flex-col p-2 md:p-6">
						<AlertDialog.Root bind:open={inviteErrorOpen}>
							<AlertDialog.Portal>
								<AlertDialog.Overlay
									class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60"
								/>
								<AlertDialog.Content
									class="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-md"
								>
									<div class="flex flex-col gap-2">
										<AlertDialog.Title class="text-lg font-semibold tracking-tight">
											Couldn’t create invite
										</AlertDialog.Title>
										<AlertDialog.Description class="text-muted-foreground text-sm">
											{inviteErrorMessage}
										</AlertDialog.Description>
									</div>
									<div class="flex justify-end pt-2">
										<AlertDialog.Cancel
											class="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium shadow-sm transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
										>
											OK
										</AlertDialog.Cancel>
									</div>
								</AlertDialog.Content>
							</AlertDialog.Portal>
						</AlertDialog.Root>

						<div class="space-y-4">
							{#if isProspectOnboarding && data.prospectGate && !data.prospectGate.canTakeTestNow}
								<Alert.Root class="mb-4" variant="destructive">
									<ClockIcon class="size-4" />
									<Alert.Title>Three meeting dates required first</Alert.Title>
									<Alert.Description>
										Log all three beer club meetings on your dashboard before the IBC test unlocks.
									</Alert.Description>
								</Alert.Root>
								<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
									<p class="text-sm text-white/88 dark:text-muted-foreground">
										You have {data.prospectGate.meetingCount} of {data.prospectGate.meetingsRequired} meetings saved.
										Add the remaining {meetingsRemaining} on this dashboard to continue.
									</p>
									<Button class="shrink-0 shadow-md" type="button" onclick={() => (prospectProgressDialogOpen = true)}>
										View progress
									</Button>
								</div>
							{:else if data.user && requiresIbcTest(data.user)}
								<Alert.Root class="mb-4" variant="destructive">
									<ClockIcon class="size-4" />
									<Alert.Title>Test required</Alert.Title>
									<Alert.Description>
										You must pass the official IBC test before you can create invitation links.
									</Alert.Description>
								</Alert.Root>
								<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
									<p class="text-sm text-white/88 dark:text-muted-foreground">
										Complete the IBC test to unlock invitations. An admin will review your profile
										after you pass the test.
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
									{#if data.user.test_passed != null}
										You’ve passed the IBC test. An admin will review your profile and assign your
										member number when you’re accepted.
									{:else}
										An admin will assign your member number when your account is ready.
									{/if}
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
										<ul class="flex min-w-0 flex-col" role="list">
											{#each visibleInvitations as invitation (invitation.token)}
												{@const inviteUrl = `${data.baseUrl}/invite/${invitation.token}`}
												{@const canCopyInvite =
													!invitation.used_at &&
													Date.now() < new Date(invitation.expires_at).getTime()}
												{@const isNewHighlight = invitation.token === highlightInviteToken}
												{@const rowChrome = isNewHighlight
													? inviteRowHighlightClass
													: inviteRowIdleClass}
												<li class="{inviteRowShellClass} list-none p-0">
													<div
														class="flex min-h-10 w-full min-w-0 flex-nowrap items-center {rowChrome}"
													>
														<div
															class="text-white/92 dark:text-foreground flex w-max max-w-[9rem] shrink-0 items-center px-2 py-2 text-xs font-medium sm:max-w-[11rem] sm:px-3"
														>
															<span class="truncate"
																>{invitation.invite_name?.trim() || "—"}</span
															>
														</div>
														<div class="flex shrink-0 items-center">
															<Separator orientation="vertical" class={hubTableColSepClass} />
															<div class="flex items-center px-2 py-2 sm:px-3">
																<span
																	class="font-mono text-xs text-white/88 tabular-nums dark:text-muted-foreground"
																>
																	{invitation.token.slice(0, 8)}…
																</span>
															</div>
														</div>
														<div class="flex min-w-0 flex-1 items-center">
															<Separator orientation="vertical" class={hubTableColSepClass} />
															<div
																class="text-white/78 dark:text-muted-foreground flex min-w-0 flex-1 items-center px-2 py-2 text-xs sm:px-3"
															>
																<span class="truncate"
																	>Created {formatDateTime(invitation.created_at)}</span
																>
															</div>
														</div>
														<div class="flex shrink-0 items-center">
															<Separator orientation="vertical" class={hubTableColSepClass} />
															<div
																class="flex min-h-10 shrink-0 items-center gap-2 px-2 py-2 sm:px-3"
															>
																<!-- Fixed badge column + fixed copy slot so Active/Used badges line up across rows -->
																<div
																	class="flex w-[6.5rem] shrink-0 items-center justify-start sm:w-[7rem]"
																>
																	{#if canCopyInvite}
																		<Badge
																			class="shrink-0 rounded-sm px-2 py-0.5 text-[10px] whitespace-nowrap"
																		>
																			<ClockIcon class="mr-1 size-3" />
																			Active
																		</Badge>
																	{:else}
																		<Badge
																			variant="secondary"
																			class="shrink-0 rounded-sm px-2 py-0.5 text-[10px] whitespace-nowrap"
																		>
																			<CheckIcon class="mr-1 size-3" />
																			Used
																		</Badge>
																	{/if}
																</div>
																<div
																	class="flex size-8 shrink-0 items-center justify-center"
																	aria-hidden={!canCopyInvite}
																>
																	{#if canCopyInvite}
																		<CustomCopy
																			text={inviteUrl}
																			ariaLabel="Copy invitation link for {invitation.invite_name?.trim() ||
																				'this invite'}"
																			class={inviteCopyBtnClass}
																		/>
																	{/if}
																</div>
															</div>
														</div>
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

	{#if isProspectOnboarding && data.prospectGate}
		<Dialog.Root bind:open={prospectProgressDialogOpen}>
			<Dialog.Content class="sm:max-w-xl">
				<Dialog.Header>
					<Dialog.Title>Prospect progress</Dialog.Title>
					<Dialog.Description>
						Attend and log three beer club meetings to unlock the IBC test and member-only tools.
					</Dialog.Description>
				</Dialog.Header>
				<div class="space-y-4">
					<div class="grid grid-cols-3 gap-2">
						{#each [1, 2, 3] as slot}
							<div class="rounded-xl border p-3 text-center">
								<div class="mb-2 flex justify-center">
									{#if slot <= data.prospectGate.meetingCount}
										<div class="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 flex size-8 items-center justify-center rounded-full">
											<CheckIcon class="size-4" />
										</div>
									{:else}
										<div class="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-full">
											<ClockIcon class="size-4" />
										</div>
									{/if}
								</div>
								<p class="text-sm font-medium">Meeting {slot}</p>
								<p class="text-muted-foreground mt-1 text-xs">
									{data.prospectGate.meetingDates[slot - 1] || "Not saved yet"}
								</p>
							</div>
						{/each}
					</div>
					<p class="text-sm text-muted-foreground">
						{#if data.prospectGate.canTakeTestNow}
							Nice — all three meetings are logged. You can take the IBC test now.
						{:else}
							You’re {meetingsRemaining} meeting{meetingsRemaining === 1 ? "" : "s"} away from unlocking the test.
						{/if}
					</p>
				</div>
				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => (prospectProgressDialogOpen = false)}>Close</Button>
					{#if data.prospectGate.canTakeTestNow}
						<Button href="/test">Take test</Button>
					{/if}
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>

		<section id="prospect-progress" class="space-y-6">
			<Card.Root class="border-primary/20 overflow-hidden rounded-2xl border shadow-sm">
				<Card.Header class="space-y-3">
					<div class="flex flex-wrap items-start justify-between gap-3">
						<div class="space-y-1">
							<Card.Title class="text-xl">Log your first 3 meetings</Card.Title>
							<Card.Description>
								Before you can take the IBC test or view exclusive member info, save the dates of the
								three beer club meetings you attended.
							</Card.Description>
						</div>
						<Badge variant="secondary" class="text-sm">
							{data.prospectGate.meetingCount}/{data.prospectGate.meetingsRequired} saved
						</Badge>
					</div>
					<Alert.Root variant={data.prospectGate.canTakeTestNow ? "default" : "destructive"}>
						<ClockIcon class="size-4" />
						<Alert.Title>
							{#if data.prospectGate.canTakeTestNow}
								Meetings complete — test unlocked
							{:else}
								Member directory and stats stay locked until all 3 meetings are saved
							{/if}
						</Alert.Title>
						<Alert.Description>
							{#if data.prospectGate.canTakeTestNow}
								You can head straight to the IBC test now.
							{:else}
								Save each meeting whenever you attend it — you do not need to fill all three at once.
							{/if}
						</Alert.Description>
					</Alert.Root>
				</Card.Header>
				<Card.Content class="space-y-6">
					<div class="grid gap-4 lg:grid-cols-3">
						{#each [
							{ slot: 1, label: "Meeting 1", value: meeting1Date },
							{ slot: 2, label: "Meeting 2", value: meeting2Date },
							{ slot: 3, label: "Meeting 3", value: meeting3Date }
						] as meeting}
							<div class="rounded-xl border p-4">
								<div class="mb-3 flex items-center justify-between gap-3">
									<div>
										<h3 class="font-medium">{meeting.label}</h3>
										<p class="text-muted-foreground text-xs">
											{meeting.value ? "Saved and editable anytime." : "Save whenever you attend it."}
										</p>
									</div>
									{#if meeting.value}
										<Badge variant="secondary">Saved</Badge>
									{/if}
								</div>
								<form method="POST" action="?/saveProspectMeetingDate" class="space-y-3">
									<input type="hidden" name="slot" value={meeting.slot} />
									{#if meeting.slot === 1}
										<DatePickerField id="meeting-1-date" name="meetingDate" bind:value={meeting1Date} />
									{:else if meeting.slot === 2}
										<DatePickerField id="meeting-2-date" name="meetingDate" bind:value={meeting2Date} />
									{:else}
										<DatePickerField id="meeting-3-date" name="meetingDate" bind:value={meeting3Date} />
									{/if}
									<div class="flex flex-wrap gap-2">
										<Button type="submit" size="sm">Save date</Button>
										{#if meeting.value}
											<button class="text-sm text-muted-foreground hover:text-foreground" type="submit" formaction="?/clearProspectMeetingDate" formmethod="POST">
												Clear
											</button>
										{/if}
									</div>
								</form>
							</div>
						{/each}
					</div>
					<div class="flex flex-wrap items-center gap-3">
						<Button type="button" variant="outline" onclick={() => (prospectProgressDialogOpen = true)}>
							View progress
						</Button>
						{#if data.prospectGate.canTakeTestNow}
							<Button href="/test">Take the IBC test</Button>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		</section>
	{/if}

	{#if data.user && canAccessExclusiveFeatures}
		<div
			class="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:items-stretch"
			aria-label="Upcoming events and quick actions"
		>
			<!-- Upcoming events -->
			<section class="min-w-0 lg:flex lg:flex-col" aria-labelledby="tables-heading">
				<Card.Root
					class="ibc-lounge-hero border-border/50 border-primary/15 relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border shadow-sm lg:h-full"
				>
					<div
						class="pointer-events-none absolute inset-0 z-0 bg-[url('/images/upcoming-events-bg.png')] bg-cover bg-[position:center_28%] bg-no-repeat opacity-[0.55] saturate-[1.05] dark:opacity-[0.58]"
						aria-hidden="true"
					></div>
					<div class={hubCardMidWashClass} aria-hidden="true"></div>
					<div class={hubHeroScrimLrClass} aria-hidden="true"></div>
					<div class={hubHeroScrimTbClass} aria-hidden="true"></div>
					<div class="relative z-10 flex w-full min-w-0 flex-col gap-3 px-6">
						<div
							class="flex w-full min-w-0 flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2"
						>
							<Card.Title
								id="tables-heading"
								class="flex min-w-0 items-center gap-2 text-lg font-semibold tracking-tight text-white drop-shadow-sm dark:text-foreground"
							>
								<Calendar class="size-5 shrink-0 text-white dark:text-primary" />
								Upcoming events
							</Card.Title>
							<a
								href="/events"
								class="text-xs font-semibold text-amber-200/95 underline-offset-4 hover:underline dark:text-primary"
							>
								View all
							</a>
						</div>
						<Card.Description
							class="max-w-none text-pretty leading-snug text-white/88 dark:text-muted-foreground"
						>
							Next on the club calendar
						</Card.Description>
					</div>
					<Card.Content class="relative z-10 flex flex-1 flex-col p-2 md:p-6">
						{#if data.upcomingEvents.length === 0}
							<p class="text-sm text-white/78 dark:text-muted-foreground">
								No upcoming published events.
							</p>
						{:else}
							<ul
								class="flex flex-col overflow-hidden"
								role="list"
								aria-label="Upcoming events: title, date, location, and access"
							>
								{#each data.upcomingEvents as ev (ev.id)}
									<li class="{inviteRowShellClass} list-none p-0">
										<div
											class="flex min-h-10 w-full min-w-0 flex-nowrap items-center {inviteRowIdleClass}"
										>
											<div
												class="text-white/92 dark:text-foreground flex min-w-0 max-w-[9rem] flex-1 items-center px-3 py-2 text-xs font-medium sm:max-w-[11rem] sm:px-4"
											>
												<a
													href="/events"
													class="truncate transition-colors hover:text-white/95 dark:hover:text-primary"
												>
													{ev.title}
												</a>
											</div>
											<div class="flex min-w-0 items-center">
												<Separator orientation="vertical" class={hubTableColSepClass} />
												<div
													class="flex min-w-0 items-center px-3 py-2 text-xs tabular-nums text-white/88 sm:px-4 dark:text-muted-foreground"
												>
													{ev.event_date ? formatDate(new Date(ev.event_date)) : "—"}
												</div>
											</div>
											<div class="hidden min-w-0 items-center sm:flex">
												<Separator orientation="vertical" class={hubTableColSepClass} />
												<div
													class="flex max-w-[10rem] min-w-0 items-center px-3 py-2 text-xs text-white/85 sm:px-4 dark:text-muted-foreground"
												>
													<span class="truncate">{ev.location ?? "—"}</span>
												</div>
											</div>
											<div class="flex min-w-0 flex-1 items-center justify-end">
												<Separator orientation="vertical" class={hubTableColSepClass} />
												<div
													class="flex min-h-10 min-w-0 flex-1 items-center justify-end px-2 py-2 sm:px-3"
												>
													{#if ev.members_only}
														<Badge
															variant="secondary"
															class="shrink-0 rounded-sm px-2 py-0.5 text-[10px] whitespace-nowrap"
														>
															Members
														</Badge>
													{:else}
														<Badge
															variant="outline"
															class="shrink-0 rounded-sm border-white/40 bg-black/15 px-2 py-0.5 text-[10px] whitespace-nowrap text-white/90 dark:border-border dark:bg-transparent dark:text-foreground"
														>
															Public
														</Badge>
													{/if}
												</div>
											</div>
										</div>
									</li>
								{/each}
							</ul>
						{/if}
					</Card.Content>
				</Card.Root>
			</section>

			<!-- Quick actions -->
			<section class="min-w-0 lg:flex lg:flex-col" aria-labelledby="actions-heading">
				<Card.Root
					class="border-border/50 from-sidebar/25 to-card flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl border bg-gradient-to-br shadow-sm lg:h-full"
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
						<QuickActionLink href="/dashboard/members">
							<BookUser class="text-primary size-[1.15rem] shrink-0" />
							{data.user.role === "admin" ? "Manage members" : "Member directory"}
						</QuickActionLink>
						{#if data.user.role === "admin"}
							<QuickActionLink href="/admin/events">
								<CalendarDays class="text-primary size-[1.15rem] shrink-0" />
								Manage events
							</QuickActionLink>
							<QuickActionLink href="/admin/stats/beer-consumed" class="whitespace-normal">
								<Beer class="text-primary size-[1.15rem] shrink-0" />
								<span class="min-w-0 text-left leading-snug">
									<span class="sm:hidden">Beer consumed</span>
									<span class="hidden sm:inline">Manage Beer Consumed</span>
								</span>
							</QuickActionLink>
							<QuickActionLink href="/admin/stats/keg-credits">
								<Package class="text-primary size-[1.15rem] shrink-0" />
								Manage Keg Credits
							</QuickActionLink>
						{:else}
							<QuickActionLink href="/stats#beer-consumed-section" class="whitespace-normal">
								<Beer class="text-primary size-[1.15rem] shrink-0" />
								<span class="min-w-0 text-left leading-snug">Beer consumed</span>
							</QuickActionLink>
							<QuickActionLink href="/stats#keg-credits-section">
								<Package class="text-primary size-[1.15rem] shrink-0" />
								Keg credits
							</QuickActionLink>
							<QuickActionLink href="/events">
								<CalendarRange class="text-primary size-[1.15rem] shrink-0" />
								View events
							</QuickActionLink>
						{/if}
					</Card.Content>
				</Card.Root>
			</section>
		</div>
	{/if}
</div>
