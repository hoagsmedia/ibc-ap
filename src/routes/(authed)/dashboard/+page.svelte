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
	import {
		BarChart3,
		Beer,
		BookUser,
		CalendarDays,
		CalendarRange,
		CheckIcon,
		ClockIcon,
		IdCard,
		LayoutGrid,
		LinkIcon,
		Package,
		Sparkles,
		TrendingUp,
		User,
		UserPlusIcon,
		UserCheck,
		Users
	} from "@lucide/svelte/icons";
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
</script>

<svelte:head>
	<title>Dashboard | Island Beer Club</title>
	<meta name="description" content="Island Beer Club member dashboard" />
</svelte:head>

<div class="mx-auto flex max-w-[1600px] flex-col gap-8">
	<!-- Hero + insights -->
	{#if data.user}
		<section
			class="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5"
			aria-labelledby="welcome-heading"
		>
			<div
				class="ibc-lounge-hero border-border/50 relative col-span-1 flex min-h-[260px] flex-col overflow-hidden rounded-2xl border shadow-md lg:col-span-2"
			>
				<div
					class="pointer-events-none absolute inset-0 z-0 bg-[url('/images/welcome-island-sunset-bg.png')] bg-cover bg-[position:58%_center] bg-no-repeat opacity-[0.55] saturate-[1.05]"
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
					<div class="max-w-xl space-y-4 sm:space-y-5">
						<p
							class="text-[0.7rem] font-semibold tracking-[0.28em] text-white/80 uppercase sm:text-xs sm:tracking-[0.22em]"
						>
							Member area
						</p>
						<h1
							id="welcome-heading"
							class="text-foam text-3xl font-bold tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-4xl"
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
			<div class="flex flex-col gap-4">
				<Card.Root class="border-border/50 rounded-2xl border shadow-sm">
					<Card.Header class="pb-2">
						<div class="flex items-center gap-2">
							<span
								class="bg-secondary/80 text-secondary-foreground flex size-8 items-center justify-center rounded-lg"
							>
								<TrendingUp class="size-4" />
							</span>
							<Card.Title class="text-base">Engagement</Card.Title>
						</div>
						<Card.Description>Members with numbers vs total roster</Card.Description>
					</Card.Header>
					<Card.Content>
						<p class="text-foam text-4xl font-bold tabular-nums">{engagementPct}%</p>
						<p class="text-muted-foreground mt-2 text-xs leading-relaxed">
							Higher means more of the club is fully onboarded with member numbers.
						</p>
					</Card.Content>
				</Card.Root>
				<Card.Root class="border-border/50 rounded-2xl border shadow-sm">
					<Card.Header class="pb-2">
						<div class="flex items-center gap-2">
							<span
								class="bg-secondary/80 text-secondary-foreground flex size-8 items-center justify-center rounded-lg"
							>
								<Sparkles class="size-4" />
							</span>
							<Card.Title class="text-base">Season pace</Card.Title>
						</div>
						<Card.Description>Events and kegs in the data snapshot</Card.Description>
					</Card.Header>
					<Card.Content>
						<p class="text-muted-foreground text-sm leading-relaxed">
							<span class="text-foam font-semibold tabular-nums"
								>{data.clubStats.eventsThisYear}</span
							>
							events this year ·
							<span class="text-foam font-semibold tabular-nums">{data.clubStats.kegsConsumed}</span
							>
							kegs recorded — keep the island pouring.
						</p>
					</Card.Content>
				</Card.Root>
			</div>
		</section>
	{/if}

	<!-- Member information, quick actions, club stats — responsive row -->
	{#if data.user}
		<section
			class="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3 xl:items-stretch"
			aria-labelledby="member-info-heading"
		>
			<Card.Root
				class="border-border/50 from-sidebar/25 to-card flex min-h-0 min-w-0 flex-col rounded-2xl border bg-gradient-to-br shadow-sm"
			>
				<Card.Header class="flex flex-row items-center gap-3 pb-2">
					<div
						class="border-primary/45 bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-sm"
						aria-hidden="true"
					>
						<IdCard class="text-primary size-5" />
					</div>
					<Card.Title
						id="member-info-heading"
						class="text-foam text-lg font-semibold tracking-tight"
					>
						Member information
					</Card.Title>
				</Card.Header>
				<Card.Content class="flex flex-1 flex-col space-y-5 pt-0">
					<div
						class="border-border/55 bg-muted/15 rounded-xl border px-4 py-3 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.04)]"
					>
						<p
							class="text-muted-foreground text-[0.65rem] font-semibold tracking-[0.2em] uppercase"
						>
							Member number
						</p>
						<p class="text-foam mt-1 text-3xl font-bold tracking-tight tabular-nums">
							{#if data.user.mbr != null}
								{data.user.mbr}
							{:else if data.user.test_passed}
								<span class="text-primary">Pending</span>
							{:else}
								—
							{/if}
						</p>
					</div>

					<div class="space-y-4">
						<div>
							<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Name</p>
							<p class="text-foam mt-0.5 text-sm font-semibold">{data.user.name}</p>
						</div>
						<div>
							<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Email</p>
							<p class="text-foam mt-0.5 text-sm font-semibold break-all">
								{data.user.email ?? data.user.username ?? "—"}
							</p>
						</div>
						<div>
							<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Role</p>
							<div class="mt-1.5">
								<Badge
									class="border-primary/35 bg-primary text-primary-foreground font-medium capitalize shadow-sm"
								>
									{data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1)}
								</Badge>
							</div>
						</div>
						<div>
							<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
								Member since
							</p>
							<p class="text-foam mt-0.5 text-sm font-semibold tabular-nums">
								{#if data.user.msd}
									{formatDate(new Date(data.user.msd))}
								{:else}
									—
								{/if}
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

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
						<Card.Title id="actions-heading" class="text-foam text-lg font-semibold tracking-tight">
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
						class="border-border/55 bg-muted/20 text-foam hover:bg-muted/35 h-auto min-h-12 justify-start gap-3 px-3 py-2.5 font-medium shadow-sm"
					>
						<BookUser class="text-primary size-[1.15rem] shrink-0" />
						{data.user.role === "admin" ? "Manage members" : "Member directory"}
					</Button>
					{#if data.user.role === "admin"}
						<Button
							href="/admin/events"
							variant="outline"
							class="border-border/55 bg-muted/20 text-foam hover:bg-muted/35 h-auto min-h-12 justify-start gap-3 px-3 py-2.5 font-medium shadow-sm"
						>
							<CalendarDays class="text-primary size-[1.15rem] shrink-0" />
							Manage events
						</Button>
						<Button
							href="/admin/stats/keg-credits"
							variant="outline"
							class="border-border/55 bg-muted/20 text-foam hover:bg-muted/35 h-auto min-h-12 justify-start gap-3 px-3 py-2.5 font-medium shadow-sm"
						>
							<Package class="text-primary size-[1.15rem] shrink-0" />
							Manage keg credits
						</Button>
						<Button
							href="/admin/stats/beer-consumed"
							variant="outline"
							class="border-border/55 bg-muted/20 text-foam hover:bg-muted/35 h-auto min-h-12 justify-start gap-3 px-3 py-2.5 font-medium shadow-sm"
						>
							<Beer class="text-primary size-[1.15rem] shrink-0" />
							Manage beer consumed
						</Button>
						<Button
							href="/admin/stats"
							variant="outline"
							class="border-border/55 bg-muted/20 text-foam hover:bg-muted/35 h-auto min-h-12 justify-start gap-3 px-3 py-2.5 font-medium shadow-sm"
						>
							<BarChart3 class="text-primary size-[1.15rem] shrink-0" />
							Club stats data
						</Button>
					{:else}
						<Button
							href="/events"
							variant="outline"
							class="border-border/55 bg-muted/20 text-foam hover:bg-muted/35 h-auto min-h-12 justify-start gap-3 px-3 py-2.5 font-medium shadow-sm"
						>
							<CalendarRange class="text-primary size-[1.15rem] shrink-0" />
							View events
						</Button>
					{/if}
				</Card.Content>
			</Card.Root>

			<Card.Root
				class="border-border/50 from-sidebar/25 to-card flex min-h-0 min-w-0 flex-col rounded-2xl border bg-gradient-to-br shadow-sm md:col-span-2 xl:col-span-1"
				aria-labelledby="club-stats-heading"
			>
				<Card.Header class="flex flex-row items-center gap-3 pb-2">
					<div
						class="border-primary/45 bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-sm"
						aria-hidden="true"
					>
						<BarChart3 class="text-primary size-5" />
					</div>
					<div class="min-w-0">
						<Card.Title
							id="club-stats-heading"
							class="text-foam text-lg font-semibold tracking-tight"
						>
							Club stats
						</Card.Title>
						<Card.Description class="text-muted-foreground text-sm leading-snug">
							Live figures from the club database
						</Card.Description>
					</div>
				</Card.Header>
				<Card.Content class="flex flex-1 flex-col gap-2 pt-0">
					<div
						class="border-border/50 bg-muted/15 flex items-center gap-3 rounded-xl border px-3 py-2.5"
					>
						<Users class="text-primary size-5 shrink-0" aria-hidden="true" />
						<span class="text-foam min-w-0 flex-1 text-sm leading-tight"
							>Members &amp; officers</span
						>
						<span class="text-foam shrink-0 text-sm font-semibold tabular-nums">
							{data.clubStats.totalMembers.toLocaleString()}
						</span>
					</div>
					<div
						class="border-border/50 bg-muted/15 flex items-center gap-3 rounded-xl border px-3 py-2.5"
					>
						<UserCheck class="text-primary size-5 shrink-0" aria-hidden="true" />
						<span class="text-foam min-w-0 flex-1 text-sm leading-tight">With member number</span>
						<span class="text-foam shrink-0 text-sm font-semibold tabular-nums">
							{data.clubStats.activeMembers.toLocaleString()}
						</span>
					</div>
					<div
						class="border-border/50 bg-muted/15 flex items-center gap-3 rounded-xl border px-3 py-2.5"
					>
						<CalendarDays class="text-primary size-5 shrink-0" aria-hidden="true" />
						<span class="text-foam min-w-0 flex-1 text-sm leading-tight">Events this year</span>
						<span class="text-foam shrink-0 text-sm font-semibold tabular-nums">
							{data.clubStats.eventsThisYear.toLocaleString()}
						</span>
					</div>
					<div
						class="border-border/50 bg-muted/15 flex items-center gap-3 rounded-xl border px-3 py-2.5"
					>
						<Beer class="text-primary size-5 shrink-0" aria-hidden="true" />
						<span class="text-foam min-w-0 flex-1 text-sm leading-tight">Kegs consumed</span>
						<span class="text-foam shrink-0 text-sm font-semibold tabular-nums">
							{data.clubStats.kegsConsumed.toLocaleString()}
						</span>
					</div>
				</Card.Content>
			</Card.Root>
		</section>
	{/if}

	{#if data.user}
		<section
			class="grid grid-cols-1 gap-4 sm:gap-5 lg:items-stretch {data.user.role === 'admin'
				? 'lg:grid-cols-2'
				: ''}"
			aria-label="New members and invitation links"
		>
			{#if data.user.role === "admin"}
				<Card.Root
					class="border-border/50 border-primary/15 relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border shadow-sm lg:h-full"
				>
					<div
						class="pointer-events-none absolute inset-0 z-0 bg-[url('/images/pending-members-hop-bg.png')] bg-cover bg-[position:right_65%_bottom] bg-no-repeat opacity-[0.62] saturate-[1.08]"
						aria-hidden="true"
					></div>
					<div
						class="from-card/88 via-card/50 to-card/25 pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r"
						aria-hidden="true"
					></div>
					<div
						class="to-card/35 pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-transparent via-transparent"
						aria-hidden="true"
					></div>
					<Card.Header class="relative z-10">
						<Card.Title
							id="pending-heading"
							class="text-foam flex items-center gap-2 text-lg font-semibold tracking-tight"
						>
							<UserPlusIcon class="text-primary size-5" />
							New potential members
						</Card.Title>
						<Card.Description class="text-muted-foreground max-w-xl leading-snug text-pretty">
							People who passed the test but don’t have a member number yet. Manage them and assign
							member numbers.
						</Card.Description>
					</Card.Header>
					<Card.Content class="relative z-10 flex flex-1 flex-col gap-4 pt-0">
						<div>
							{#if pendingMembersCardLoading}
								<div
									class="space-y-3"
									aria-busy="true"
									aria-label="Loading new potential members"
								>
									<Skeleton class="h-4 w-36" />
									<Skeleton class="h-4 w-full max-w-md" />
									<Skeleton class="h-4 w-full max-w-[13rem]" />
									<Skeleton class="h-3 w-40" />
								</div>
							{:else if (data.pendingMembersCount ?? 0) > 0}
								<p class="text-muted-foreground text-sm">
									<span class="text-foam font-semibold tabular-nums">{data.pendingMembersCount}</span>
									waiting for acceptance.
								</p>
								{#if data.pendingMembers && data.pendingMembers.length > 0}
									<ul class="mt-3 max-h-[7.5rem] space-y-1.5 overflow-hidden text-pretty">
										{#each data.pendingMembers as pending (pending.id)}
											<li class="text-muted-foreground truncate text-sm">{pending.name}</li>
										{/each}
									</ul>
									{#if (data.pendingMembersCount ?? 0) > data.pendingMembers.length}
										<p class="text-muted-foreground mt-2 text-xs">
											+{(data.pendingMembersCount ?? 0) - data.pendingMembers.length} more on the full
											list.
										</p>
									{/if}
								{/if}
							{:else}
								<p class="text-muted-foreground text-sm">No pending applicants right now.</p>
							{/if}
						</div>
						<Button
							href="/dashboard/pending-members"
							variant="secondary"
							class="gap-2 self-start shadow-md"
						>
							<UserPlusIcon class="size-4" />
							Manage new members
						</Button>
					</Card.Content>
				</Card.Root>
			{/if}

			<Card.Root
				class="border-border/50 border-primary/15 relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border shadow-sm lg:h-full"
				aria-labelledby="invites-heading"
			>
				<div
					class="pointer-events-none absolute inset-0 z-0 bg-[url('/images/invitation-barrels-bg.png')] bg-cover bg-[position:85%_center] bg-no-repeat opacity-[0.64] saturate-[1.06]"
					aria-hidden="true"
				></div>
				<div
					class="ibc-invites-card-bg pointer-events-none absolute inset-0 z-[1] opacity-[0.35]"
					aria-hidden="true"
				></div>
				<div
					class="from-card/86 via-card/45 pointer-events-none absolute inset-0 z-[1] bg-gradient-to-l to-transparent"
					aria-hidden="true"
				></div>
				<div
					class="from-card/40 pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t via-transparent to-transparent"
					aria-hidden="true"
				></div>
				<Card.Header class="relative z-10">
					<Card.Title
						id="invites-heading"
						class="text-foam flex items-center gap-2 text-lg font-semibold tracking-tight"
					>
						<LinkIcon class="text-primary size-5" />
						Invitation links
					</Card.Title>
					<Card.Description class="text-muted-foreground max-w-xl leading-snug text-pretty">
						Create secure, one-time signup links to invite new members.
					</Card.Description>
				</Card.Header>
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
						{#if !data.user?.test_passed}
							<Alert.Root class="mb-4" variant="destructive">
								<ClockIcon class="size-4" />
								<Alert.Title>Test required</Alert.Title>
								<Alert.Description>
									You must pass the official IBC test before you can create invitation links.
								</Alert.Description>
							</Alert.Root>
							<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<p class="text-muted-foreground text-sm">
									Complete the IBC test to unlock invitations.
								</p>
								<Button class="shrink-0 shadow-md">
									<a href="/test">Take test</a>
								</Button>
							</div>
						{:else if data.user?.role !== "admin" && (data.user?.role !== "member" || data.user?.mbr == null)}
							<Alert.Root class="mb-4" variant="default">
								<ClockIcon class="size-4" />
								<Alert.Title>Member acceptance required</Alert.Title>
								<Alert.Description>
									You must be accepted and assigned a member number before creating invitation
									links.
								</Alert.Description>
							</Alert.Root>
							<p class="text-muted-foreground text-sm">
								An admin will review your profile after you pass the test.
							</p>
						{:else}
							<div
								class="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center"
							>
								<p class="text-muted-foreground text-sm">
									Create secure, one-time signup links for new members.
								</p>
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
									<Button type="submit" disabled={creating} class="shadow-md">
										{creating ? "Creating..." : "Create invite link"}
									</Button>
								</form>
							</div>

							{#if data.invitations && data.invitations.length > 0}
								<div class="mt-6 space-y-3">
									<h4 class="text-foam text-sm font-semibold">Recent invitations</h4>
									<ul class="space-y-2">
										{#each data.invitations as invitation (invitation.token)}
											<li
												class="border-border/50 bg-muted/15 flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
											>
												<div class="min-w-0 flex-1">
													<span class="text-muted-foreground font-mono text-xs">
														{invitation.token.slice(0, 8)}…
													</span>
													<div class="text-muted-foreground mt-1 text-xs">
														Created: {formatDateTime(invitation.created_at)}
													</div>
												</div>
												<div class="flex flex-wrap items-center gap-2">
													{#if invitation.used_at}
														<Badge variant="secondary">
															<CheckIcon class="mr-1 size-3" />
															Used
														</Badge>
													{:else if Date.now() >= new Date(invitation.expires_at).getTime()}
														<Badge variant="destructive">
															<ClockIcon class="mr-1 size-3" />
															Expired
														</Badge>
													{:else}
														<Badge>
															<ClockIcon class="mr-1 size-3" />
															Active
														</Badge>
													{/if}
													{#if !invitation.used_at && Date.now() < new Date(invitation.expires_at).getTime()}
														<CustomCopy
															text={`${data.baseUrl}/invite/${invitation.token}`}
															ariaLabel="Copy invitation link"
														/>
													{/if}
												</div>
											</li>
										{/each}
									</ul>
								</div>
							{/if}
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		</section>
	{/if}

	<!-- Upcoming events -->
	{#if data.user}
		<section aria-labelledby="tables-heading">
			<h2 id="tables-heading" class="sr-only">Upcoming events</h2>
			<Card.Root class="border-border/50 relative overflow-hidden rounded-2xl border shadow-sm">
				<div
					class="pointer-events-none absolute inset-0 z-0 bg-[url('/images/upcoming-events-bg.png')] bg-cover bg-[position:center_28%] bg-no-repeat opacity-[0.58] saturate-[1.05]"
					aria-hidden="true"
				></div>
				<div
					class="from-card/82 via-card/48 to-card/72 pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b"
					aria-hidden="true"
				></div>
				<div
					class="from-card/45 pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t via-transparent to-transparent"
					aria-hidden="true"
				></div>
				<Card.Header class="relative z-10">
					<Card.Title class="text-foam text-lg font-semibold tracking-tight"
						>Upcoming events</Card.Title
					>
					<Card.Description class="text-muted-foreground max-w-lg text-pretty">
						Next on the club calendar
					</Card.Description>
				</Card.Header>
				<Card.Content class="relative z-10 px-0 pb-2">
					{#if data.upcomingEvents.length === 0}
						<p class="text-muted-foreground px-6 text-sm">No upcoming published events.</p>
					{:else}
						<Table.Root>
							<Table.Header>
								<Table.Row class="border-border/45 hover:bg-card/35 bg-card/45 backdrop-blur-sm">
									<Table.Head class="text-muted-foreground">Event</Table.Head>
									<Table.Head class="text-muted-foreground">When</Table.Head>
									<Table.Head class="text-muted-foreground hidden sm:table-cell">Where</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each data.upcomingEvents as ev (ev.id)}
									<Table.Row
										class="border-border/35 hover:bg-card/40 bg-card/25 backdrop-blur-[2px]"
									>
										<Table.Cell class="font-medium">
											<a href="/events" class="text-foam hover:text-primary transition-colors">
												{ev.title}
											</a>
											{#if ev.members_only}
												<Badge variant="secondary" class="ml-2 text-[10px]">Members</Badge>
											{/if}
										</Table.Cell>
										<Table.Cell class="text-muted-foreground text-sm tabular-nums">
											{ev.event_date ? formatDate(new Date(ev.event_date)) : "—"}
										</Table.Cell>
										<Table.Cell
											class="text-muted-foreground hidden max-w-[10rem] truncate text-sm sm:table-cell"
										>
											{ev.location ?? "—"}
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
